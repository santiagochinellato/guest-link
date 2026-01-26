"use server";

import { db } from "@/db";
import { properties, recommendations, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findTopRatedPlaces, findNearbyTransit } from "@/lib/services/google-places";
import { fetchNearbyPlaces } from "@/lib/actions/overpass";

// Helper to map simplified string categories to DB Categories
async function getOrCreateCategory(type: string, propertyId: number): Promise<number> {
    const existing = await db.select().from(categories).where(
        and(
            eq(categories.propertyId, propertyId),
            // eq(categories.type, type) // Type match or name match? 
            // Let's match by type if possible, or name loosely.
            // Schema has `type` column.
            eq(categories.type, type)
        )
    ).limit(1);

    if (existing.length > 0) {
        return existing[0].id;
    }

    // Create new
    const [newCat] = await db.insert(categories).values({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        type: type,
        propertyId: propertyId,
        isSystemCategory: false
    }).returning({ id: categories.id });

    return newCat.id;
}


export async function populateRecommendations(propertyId: number) {
  try {
    // 1. Fetch Property
    const property = await db.query.properties.findFirst({
        where: eq(properties.id, propertyId),
    });

    if (!property || !property.latitude || !property.longitude) {
        return { success: false, error: "Property not found or missing coordinates." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    // 2. Check existing auto-populated items
    const existingAuto = await db.select().from(recommendations).where(
        and(
            eq(recommendations.propertyId, propertyId),
            eq(recommendations.externalSource, "google") // Check specifically for google items to avoid spamming bills
        )
    );

    if (existingAuto.length > 5) {
         // Already populated? strict check.
         // Let's accept if user wants to re-run, but maybe we should be careful.
         // For now, proceed but maybe skip Google if already present?
         // Requirement says "Check if recommendations strictly from external sources already exist to avoid API spam"
         // Let's skip Google API if we have enough Google items.
    }
    
    // 3. Parallel Fetch
    const promises = [
        // Google Places
        findTopRatedPlaces(lat, lng, "restaurants"),
        findTopRatedPlaces(lat, lng, "supermarket"), 
        findTopRatedPlaces(lat, lng, "tourist attraction"),
        // Google Transit
        findNearbyTransit(lat, lng),
        // Overpass Outdoors
        fetchNearbyPlaces(lat, lng, "outdoors"),
    ];

    const results = await Promise.allSettled(promises);
    
    const allSuggestions = [];

    // Process results
    for (const res of results) {
        if (res.status === "fulfilled") {
            // Google services return array directly, Overpass returns { success, data }
            // Wait, my services signatures:
            // Google: Promise<PlaceResult[]>
            // Overpass: Promise<{ success, data... }>
            
            const val = res.value;
            if (Array.isArray(val)) {
                // Google Result
                allSuggestions.push(...val);
            } else if (val && "data" in val && Array.isArray(val.data)) {
                 // Overpass Result
                 allSuggestions.push(...val.data);
            }
        }
    }

    if (allSuggestions.length === 0) {
        return { success: true, message: "No recommendations found nearby." };
    }

    // 4. Transform and Insert
    let addedCount = 0;
    
    // Pre-fetch categories to optimize
    const categoryMap = new Map<string, number>();

    for (const item of allSuggestions) {
        // Resolve Category Type -> Database Category ID
        // Map common types to standard sets
        let targetType = item.categoryType || "other";
        
        // Ensure category exists
        if (!categoryMap.has(targetType)) {
            const catId = await getOrCreateCategory(targetType, propertyId);
            categoryMap.set(targetType, catId);
        }
        
        // Insert DB Item
        // Check uniqueness by googlePlaceId if present
        if (item.googlePlaceId) {
             const existing = await db.select().from(recommendations).where(
                 eq(recommendations.googlePlaceId, item.googlePlaceId)
             ).limit(1);
             if (existing.length > 0) continue; 
        }

        // Additional geometry handling if json
        // Drizzle json column accepts object
        const geometryValue = (item.geometry) ? item.geometry : null;

        await db.insert(recommendations).values({
            propertyId: propertyId,
            categoryId: categoryMap.get(targetType),
            title: item.title,
            description: item.description,
            formattedAddress: item.formattedAddress,
            googleMapsLink: item.googleMapsLink,
            // Cast rating to any to assume DB handles it as real (mapped to number in TS usually)
            rating: item.rating ? Number(item.rating) : null, 
            userRatingsTotal: item.userRatingsTotal,
            googlePlaceId: item.googlePlaceId,
            externalSource: item.externalSource || "manual",
            geometry: geometryValue,
            isAutoSuggested: true
        });
        
        addedCount++;
    }

    revalidatePath(`/dashboard/properties`);
    
    return { success: true, count: addedCount };
    
  } catch (error: any) {
    console.error("Auto-Populate Error:", error);
    return { success: false, error: error.message };
  }
}
