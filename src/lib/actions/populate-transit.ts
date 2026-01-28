"use server";

import { db } from "@/db";
import { properties } from "@/db/schema";
import { findNearbyTransit } from "@/lib/services/transit-matcher";
import { eq } from "drizzle-orm";

export async function populateTransitSmart(
  propertyId: number,
  cityContext: string = ""
) {
  try {
    console.log(`🚍 Smart Transit (Bariloche DB) for Property ${propertyId}`);

    // 1. Get Property Coordinates
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property?.latitude || !property?.longitude) {
      return { success: false, error: "Coordenadas no disponibles en la propiedad." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, error: "Formato de coordenadas inválido." };
    }

    // 2. Run Local Triangulation Logic
    let nearbyStops = await findNearbyTransit(lat, lng);

    if (nearbyStops.length === 0) {
        return {
            success: true,
            count: 0,
            message: "No se encontraron paradas oficiales en el radio de 600m.",
            data: []
        };
    }

    // 3. Refine Results: Take only unique stops, up to 3 maximum
    const bestStops = nearbyStops.slice(0, 3);
    const suggestions = [];

    for (const stop of bestStops) {
        // Format lines: "20, 55, 10"
        const lineNumbers = stop.lines.map(l => l.number).join(", ");
        
        // Rich description with attractions
        const details = stop.lines.map(l => {
            let info = `• Línea ${l.number}`;
            if (l.attractions) info += `: Va a ${l.attractions}`;
            else if (l.name) info += ` (${l.name})`;
            return info;
        }).join("\n");

        const fullDescription = `📍 Parada a ${stop.distanceMeters}m (${stop.stopName})\n\n${details}`;
        
        // Title: "Parada de Colectivo (Líneas 20, 55)"
        const title = `Colectivo (Líneas ${lineNumbers})`;

        // Google Maps Link
        const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}&travelmode=transit`;

        suggestions.push({
            name: title,
            type: "bus",
            description: fullDescription,
            website: mapUrl, // Using the 'website' field for the map link
        });
    }

    return {
      success: true,
      count: suggestions.length,
      message: `Se detectaron ${suggestions.length} paradas cercanas.`,
      data: suggestions
    };

  } catch (error: unknown) {
    console.error("Smart Transit Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
