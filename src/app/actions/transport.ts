"use server";

import { db } from "@/db";
import { transportInfo, properties } from "@/db/schema";
import { findNearbyTransit } from "@/lib/services/transit-matcher";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function autoDetectTransport(propertyId: number) {
  try {
    // 1. Get Property Coordinates
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property || !property.latitude || !property.longitude) {
      return { success: false, error: "Property not found or missing coordinates" };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return { success: false, error: "Invalid coordinates format" };
    }

    // 2. Run Triangulation Logic
    const transitMatches = await findNearbyTransit(lat, lng);

    if (transitMatches.length === 0) {
      return {
        success: true,
        message: "No registered stops found nearby (600m radius).",
        data: [],
      };
    }

    // 3. Save to transport_info table
    // We'll clear existing auto-detected transport info first (optional strategy)
    // For now, let's just append or formatted nicely.

    const newTransportEntries = [];

    for (const match of transitMatches) {
      // The new MatchResult already has enriched formatting
      const title = match.scheduleInfo; // "📍 Parada a Xm (Calle)"
      const fullDescription = match.description; // Detailed lines info

      // Insert into DB
      const result = await db.insert(transportInfo).values({
        propertyId,
        type: "bus",
        name: title,
        description: fullDescription,
        scheduleInfo: match.scheduleInfo,
      }).returning();
      
      newTransportEntries.push(result[0]);
    }
    
    revalidatePath(`/admin/properties/${propertyId}/transport`);

    return {
      success: true,
      message: `Found ${transitMatches.length} stops. Added to transport info.`,
      data: newTransportEntries,
    };

  } catch (error) {
    console.error("AutoDetect error:", error);
    return { success: false, error: "Failed to detect transport info" };
  }
}
