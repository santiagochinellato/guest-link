"use server";

import { db } from "@/db";
import { properties, transportInfo } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  findTransitRoute,
  findGoogleTransitStations,
} from "@/lib/services/google-places";
import { fetchNearbyTransitStops } from "@/lib/actions/overpass";

// Key destinations to test routes (Only if we find stops)
const KEY_DESTINATIONS = ["Centro Cívico", "Terminal de Ómnibus"];

export async function populateTransitSmart(
  propertyId: number,
  cityContext: string = ""
) {
  try {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property?.latitude || !property?.longitude) {
      return { success: false, error: "Coordenadas no disponibles." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);
    const city = property.city || cityContext || "";

    let itemsAdded = 0;
    const linesFound = new Set<string>();

    // --- STRATEGY 1: OSM (Free & Fast) ---
    // Search for physical stops and tagged lines
    console.log("🔍 Layer 1: Searching OSM for transit stops...");
    const osmStops = await fetchNearbyTransitStops(lat, lng);

    for (const stop of osmStops) {
      // If the stop has defined lines (e.g., ["20", "51"])
      if (stop.lines.length > 0) {
        for (const line of stop.lines) {
          if (linesFound.has(line)) continue;

          await db.insert(transportInfo).values({
            propertyId,
            name: `Línea ${line}`,
            type: "bus",
            description: `Parada cercana: ${stop.name}. Consulte horarios en la app local.`,
          });
          linesFound.add(line);
          itemsAdded++;
        }
      }
    }

    console.log(`✅ OSM found ${itemsAdded} lines`);

    // --- STRATEGY 2: Google Routes (Smart Fill) ---
    // If OSM didn't give us lines (or gave few), ask Google how to get to key destinations
    // This "discovers" lines that OSM didn't have tagged
    if (itemsAdded < 3) {
      console.log("🔍 Layer 2: Trying Google Directions to key destinations...");
      
      const destinations = [
        `Centro ${city}`,
        `Terminal de Ómnibus ${city}`,
        `Aeropuerto ${city}`,
      ];

      for (const destination of destinations) {
        if (itemsAdded >= 5) break; // Limit to avoid too many API calls

        const route = await findTransitRoute(lat, lng, destination);

        if (route && !linesFound.has(route.lineName)) {
          // Get nearby stations to find the actual stop location
          const stations = await findGoogleTransitStations(lat, lng);
          const nearestStop = stations.length > 0 
            ? stations[0].name 
            : "Parada cercana a la propiedad";

          await db.insert(transportInfo).values({
            propertyId,
            name: `Línea ${route.lineName}`,
            type: "bus",
            description: `🚏 Parada: ${nearestStop}\n🚌 ${route.vehicle} hacia ${route.headsign}\n📍 Recorrido: Conecta con ${destination.replace(city, '').trim()} (${route.duration})`,
          });
          linesFound.add(route.lineName);
          itemsAdded++;
          console.log(`✅ Google Directions found Line ${route.lineName} → ${route.headsign}`);
        }

        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // --- STRATEGY 3: Google Stations (Final Fallback) ---
    // If nothing worked, at least show "There's a stop nearby"
    if (itemsAdded === 0) {
      console.log("🔍 Layer 3: Searching Google Transit Stations...");
      const stations = await findGoogleTransitStations(lat, lng);
      
      if (stations.length > 0) {
        // Add up to 2 nearest stations
        for (let i = 0; i < Math.min(2, stations.length); i++) {
          const station = stations[i];
          await db.insert(transportInfo).values({
            propertyId,
            name: station.name || "Parada de Transporte",
            type: "bus",
            description: `🚏 Parada de transporte público cercana\n📍 Ubicación: ${station.vicinity || "Ver en mapa"}\n💡 Consulte líneas disponibles en la app de transporte local.`,
          });
          itemsAdded++;
        }
        console.log(`✅ Google Stations found ${itemsAdded} stops`);
      }
    }

    revalidatePath("/dashboard/properties");

    return {
      success: true,
      count: itemsAdded,
      message:
        itemsAdded > 0
          ? `Se detectaron ${itemsAdded} opciones de transporte público.`
          : "No se detectó transporte público cercano. Intente con un radio mayor o verifique la ubicación.",
    };
  } catch (error: unknown) {
    console.error("Smart Transit Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, error: errorMessage };
  }
}
