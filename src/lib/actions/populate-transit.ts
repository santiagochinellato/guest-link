"use server";

import { db } from "@/db";
import { properties, transportInfo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findTransitRoute } from "@/lib/services/google-places";

// Key destinations to test for transit routes
const KEY_DESTINATIONS = [
  "Centro Cívico", 
  "Aeropuerto", 
  "Terminal de Ómnibus",
  "Cerro Catedral",
  "Shopping"
];

export async function populateTransitSmart(propertyId: number, cityContext: string = "") {
  try {
    // 1. Get Property
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property || !property.latitude || !property.longitude) {
      return { success: false, error: "Faltan coordenadas en la propiedad." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    const city = property.city || cityContext || "";

    // 2. Iterate destinations and find routes
    let addedCount = 0;
    
    // Combine generic destinations with city name for precision
    const destinationsToTry = KEY_DESTINATIONS.map(d => `${d} ${city}`.trim());

    for (const dest of destinationsToTry) {
        const route = await findTransitRoute(lat, lng, dest);

        if (route) {
            // Check if we already have this line saved
            const lineName = `Línea ${route.lineName}`;
            const existingTransport = await db.select().from(transportInfo).where(
                eq(transportInfo.propertyId, propertyId)
            );

            // Check if this specific line already exists
            const alreadyExists = existingTransport.some(t => 
              t.name?.includes(route.lineName) || t.description?.includes(route.lineName)
            );

            if (!alreadyExists) {
                await db.insert(transportInfo).values({
                    propertyId: propertyId,
                    name: lineName,
                    type: "bus",
                    description: `${route.vehicleType} hacia ${route.destination}. Ideal para ir a: ${dest.split(' ')[0]}. Duración aprox: ${route.duration}.`,
                });
                addedCount++;
            }
        }
        
        // Small delay to avoid API rate limits
        await new Promise(r => setTimeout(r, 300));
    }

    revalidatePath("/dashboard/properties");
    return { 
        success: true, 
        count: addedCount,
        message: addedCount > 0 
            ? `Se encontraron ${addedCount} líneas de transporte conectando puntos clave.` 
            : "No se encontraron rutas directas a puntos clave." 
    };

  } catch (error: any) {
    console.error("Smart Transit Error:", error);
    return { success: false, error: error.message };
  }
}
