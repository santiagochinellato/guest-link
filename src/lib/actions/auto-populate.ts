"use server";

import { db } from "@/db";
import { properties, recommendations, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findTopRatedPlaces, findNearbyTransit } from "@/lib/services/google-places";
import { fetchNearbyPlaces } from "@/lib/actions/overpass";

// --- DEFAULT KEYWORD MAPPINGS ---
// Used when category doesn't have custom searchKeywords defined
const DEFAULT_KEYWORDS: Record<string, string[]> = {
  gastronomy: ["restaurantes recomendados", "parrilla argentina", "comida regional"],
  breakfast: ["café de especialidad", "pastelería artesanal", "brunch"],
  nightlife: ["cervecería artesanal", "bar de tragos", "wine bar vinoteca"],
  essentials: ["supermercado", "farmacia 24 horas"],
  tourism: ["atracciones turísticas", "mirador panorámico", "museo"],
  kids: ["actividades para niños", "parque infantil", "heladería artesanal"],
  shopping: ["tienda de souvenirs", "productos regionales", "artesanías"],
  transit: [], // Handled by findNearbyTransit
  outdoors: [], // Handled by Overpass
  other: ["lugares de interés"],
};

// --- HELPER: Get or Create Category ---
async function getOrCreateCategory(type: string, propertyId: number): Promise<number> {
    const normalizedType = type.toLowerCase().trim();
    
    const displayNames: Record<string, string> = {
        "gastronomy": "Gastronomía & Sabores",
        "breakfast": "Desayuno & Cafetería",
        "tourism": "Atracciones & Cultura",
        "shopping": "Compras & Regalos",
        "essentials": "Supermercados & Farmacias",
        "kids": "Niños & Familia",
        "nightlife": "Vida Nocturna",
        "transit": "Transporte Público",
        "outdoors": "Naturaleza & Trekking",
        "other": "Otros"
    };

    const displayName = displayNames[normalizedType] || 
                        (normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1));

    const existing = await db.select().from(categories).where(
        and(
            eq(categories.propertyId, propertyId),
            eq(categories.type, normalizedType)
        )
    ).limit(1);

    if (existing.length > 0) {
        return existing[0].id;
    }

    const [newCat] = await db.insert(categories).values({
        name: displayName,
        type: normalizedType,
        propertyId: propertyId,
        isSystemCategory: false
    }).returning({ id: categories.id });

    return newCat.id;
}

// --- MAIN ACTION: Smart Discovery 2.0 ---
export async function populateRecommendations(propertyId: number) {
  try {
    // A. Fetch Property with Categories
    const property = await db.query.properties.findFirst({
        where: eq(properties.id, propertyId),
        with: {
            categories: true
        }
    });

    if (!property || !property.latitude || !property.longitude) {
        return { success: false, error: "Propiedad no encontrada o sin coordenadas." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    // B. Check if already populated (avoid API spam)
    const existingAuto = await db.select().from(recommendations).where(
        and(
            eq(recommendations.propertyId, propertyId),
            eq(recommendations.externalSource, "google")
        )
    );

    if (existingAuto.length > 10) {
        return { 
            success: true, 
            message: "La propiedad ya tiene recomendaciones automáticas. Elimina algunas para actualizar.", 
            count: 0 
        };
    }

    // C. Build Search Promises (Category-Driven)
    const promises: Promise<any>[] = [];
    const categoryMap = new Map<string, number>(); // categoryType -> categoryId

    // If no categories exist, create default ones
    if (!property.categories || property.categories.length === 0) {
        console.log("No categories found, using defaults");
        // Create default categories and use DEFAULT_KEYWORDS
        for (const [type, keywords] of Object.entries(DEFAULT_KEYWORDS)) {
            if (keywords.length === 0) continue; // Skip transit/outdoors
            
            const catId = await getOrCreateCategory(type, propertyId);
            categoryMap.set(type, catId);
            
            for (const keyword of keywords) {
                promises.push(
                    findTopRatedPlaces(lat, lng, keyword).then(results => ({
                        categoryId: catId,
                        categoryType: type,
                        results
                    }))
                );
            }
        }
    } else {
        // Use existing categories with custom or default keywords
        for (const category of property.categories) {
            if (!category.type) continue;
            
            categoryMap.set(category.type, category.id);
            
            let keywords: string[] = [];
            
            // Use custom keywords if defined
            if (category.searchKeywords && category.searchKeywords.trim() !== "") {
                keywords = category.searchKeywords.split(",").map(k => k.trim());
            } 
            // Fallback to defaults
            else if (DEFAULT_KEYWORDS[category.type]) {
                keywords = DEFAULT_KEYWORDS[category.type];
            }
            
            // Execute searches for this category
            for (const keyword of keywords) {
                promises.push(
                    findTopRatedPlaces(lat, lng, keyword).then(results => ({
                        categoryId: category.id,
                        categoryType: category.type,
                        results
                    }))
                );
            }
        }
    }

    // Add Transit (always)
    const transitCatId = await getOrCreateCategory("transit", propertyId);
    promises.push(
        findNearbyTransit(lat, lng).then(results => ({
            categoryId: transitCatId,
            categoryType: "transit",
            results
        }))
    );

    // Add Outdoors via Overpass (always)
    const outdoorsCatId = await getOrCreateCategory("outdoors", propertyId);
    promises.push(
        fetchNearbyPlaces(lat, lng, "outdoors").then(result => ({
            categoryId: outdoorsCatId,
            categoryType: "outdoors",
            results: result.data || []
        }))
    );

    // D. Execute with Resilience
    const results = await Promise.allSettled(promises);
    
    let addedCount = 0;
    let failedServices = 0;

    for (const res of results) {
        if (res.status === "fulfilled") {
            const { categoryId, results: items } = res.value;
            
            // Insert items (limit 3 per keyword to avoid spam)
            for (const item of (items || []).slice(0, 3)) {
                // Check for duplicates
                if (item.googlePlaceId) {
                    const existing = await db.select().from(recommendations).where(
                        eq(recommendations.googlePlaceId, item.googlePlaceId)
                    ).limit(1);
                    if (existing.length > 0) continue;
                }

                await db.insert(recommendations).values({
                    propertyId: propertyId,
                    categoryId: categoryId,
                    title: item.title,
                    description: item.description || "Recomendado automáticamente",
                    formattedAddress: item.formattedAddress,
                    googleMapsLink: item.googleMapsLink,
                    rating: item.rating ? Number(item.rating) : null,
                    userRatingsTotal: item.userRatingsTotal ? Number(item.userRatingsTotal) : null,
                    googlePlaceId: item.googlePlaceId,
                    externalSource: item.externalSource || "google",
                    geometry: item.geometry || null,
                    isAutoSuggested: true
                });
                
                addedCount++;
            }
        } else {
            failedServices++;
            console.warn("Service failed:", res.reason);
        }
    }

    if (addedCount === 0) {
        return { 
            success: true, 
            message: failedServices > 0 
                ? `No se encontraron lugares. ${failedServices} servicio(s) fallaron.` 
                : "No se encontraron lugares cercanos relevantes.",
            count: 0 
        };
    }

    revalidatePath(`/dashboard/properties`);
    
    return { 
        success: true, 
        count: addedCount, 
        message: `Se agregaron ${addedCount} lugares nuevos${failedServices > 0 ? ` (${failedServices} errores de API)` : ""}.` 
    };
    
  } catch (error: any) {
    console.error("Auto-Populate Critical Error:", error);
    return { success: false, error: error.message || "Error desconocido al poblar datos." };
  }
}