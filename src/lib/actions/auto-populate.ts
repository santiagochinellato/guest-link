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
  // Restaurantes (gastronomy in DB)
  gastronomy: ["restaurantes recomendados", "parrilla argentina", "comida regional"],
  
  // Turismo (sights in DB)
  sights: ["atracciones turísticas", "mirador panorámico", "museo", "puntos de interés"],
  
  // Compras (shopping in DB)
  shopping: ["tienda de souvenirs", "productos regionales", "artesanías", "centro comercial"],
  
  // Senderos (trails in DB)
  trails: ["senderos", "trekking", "caminatas", "rutas de montaña"],
  
  // Kids
  kids: ["actividades para niños", "parque infantil", "heladería artesanal", "juegos"],
  
  // Bares (bars in DB)
  bars: ["cervecería artesanal", "bar de tragos", "wine bar vinoteca", "pub"],
  
  // Outdoors
  outdoors: [], // Handled by Overpass API
  
  // Legacy/Other categories
  breakfast: ["café de especialidad", "pastelería artesanal", "brunch"],
  nightlife: ["cervecería artesanal", "bar de tragos", "wine bar vinoteca"],
  essentials: ["supermercado", "farmacia 24 horas"],
  tourism: ["atracciones turísticas", "mirador panorámico", "museo"],
  transit: [], // Handled by Smart Transit
  other: ["lugares de interés"],
};

// --- HELPER: Get or Create Category ---
async function getOrCreateCategory(type: string, propertyId: number): Promise<number> {
    const normalizedType = type.toLowerCase().trim();
    
    const displayNames: Record<string, string> = {
        "gastronomy": "Restaurantes",
        "sights": "Turismo",
        "shopping": "Compras",
        "trails": "Senderos",
        "kids": "Kids",
        "bars": "Bares",
        "outdoors": "Outdoors",
        // Legacy
        "breakfast": "Desayuno & Cafetería",
        "tourism": "Atracciones & Cultura",
        "essentials": "Supermercados & Farmacias",
        "nightlife": "Vida Nocturna",
        "transit": "Transporte Público",
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
export async function populateRecommendations(
  propertyId: number,
  categoryFilter?: string
) {
  console.log("\n🎬 === POPULATE RECOMMENDATIONS STARTED ===");
  console.log("📋 Parameters:", { propertyId, categoryFilter });
  
  try {
    // A. Fetch Property with Categories
    console.log("🔍 Fetching property...");
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

    // B. Check existing auto-generated recommendations (for logging only)
    const existingAuto = await db.select().from(recommendations).where(
        and(
            eq(recommendations.propertyId, propertyId),
            eq(recommendations.externalSource, "google")
        )
    );
    
    console.log(`📊 Existing auto-generated recommendations: ${existingAuto.length}`);

    // Note: Removed the blocking validation to allow continuous discovery
    // Users can manually delete recommendations if needed

    // C. Determine which categories to process
    let categoriesToProcess: string[];
    
    if (categoryFilter) {
      // Single category mode (from Auto-Discovery button)
      console.log(`🎯 Single category mode: ${categoryFilter}`);
      categoriesToProcess = [categoryFilter];
    } else {
      // All categories mode (from global Auto-Discovery)
      categoriesToProcess = Object.keys(DEFAULT_KEYWORDS);
      console.log(`🌐 All categories mode: ${categoriesToProcess.length} categories`);
    }

    // D. Build Search Promises (Category-Driven)
    const promises: Promise<any>[] = [];
    const categoryMap = new Map<string, number>(); // categoryType -> categoryId

    // If no categories exist, create default ones
    if (!property.categories || property.categories.length === 0) {
        console.log("⚠️ No categories found, using defaults");
        // Create default categories and use DEFAULT_KEYWORDS
        for (const [type, keywords] of Object.entries(DEFAULT_KEYWORDS)) {
            // Apply category filter
            if (categoryFilter && type !== categoryFilter) {
                console.log(`⏭️  Skipping ${type} (filter: ${categoryFilter})`);
                continue;
            }
            
            if (keywords.length === 0) {
                console.log(`⏭️  Skipping ${type} (no keywords)`);
                continue;
            }
            
            console.log(`✅ Processing ${type} with ${keywords.length} keywords`);
            const catId = await getOrCreateCategory(type, propertyId);
            categoryMap.set(type, catId);
            
            for (const keyword of keywords) {
                const searchQuery = `${keyword} cerca de ${property.city || property.address}`;
                console.log(`  🔍 Searching: "${searchQuery}"`);
                promises.push(
                    findTopRatedPlaces(lat, lng, searchQuery).then(results => ({
                        categoryId: catId,
                        categoryType: type,
                        results
                    }))
                );
            }
        }
    } else {
        console.log(`📂 Found ${property.categories.length} existing categories`);
        // Use existing categories with custom or default keywords
        for (const category of property.categories) {
            if (!category.type) continue;
            
            // Apply category filter
            if (categoryFilter && category.type !== categoryFilter) {
                console.log(`⏭️  Skipping ${category.type} (filter: ${categoryFilter})`);
                continue;
            }
            
            categoryMap.set(category.type, category.id);
            
            let keywords: string[] = [];
            
            // Use custom keywords if defined
            if (category.searchKeywords && category.searchKeywords.trim() !== "") {
                keywords = category.searchKeywords.split(",").map(k => k.trim());
                console.log(`✅ Using custom keywords for ${category.type}: ${keywords.join(', ')}`);
            } 
            // Fallback to defaults
            else if (DEFAULT_KEYWORDS[category.type]) {
                keywords = DEFAULT_KEYWORDS[category.type];
                console.log(`✅ Using default keywords for ${category.type}: ${keywords.join(', ')}`);
            } else {
                console.log(`⚠️  No keywords for ${category.type}`);
            }
            
            // Execute searches for this category
            for (const keyword of keywords) {
                const searchQuery = `${keyword} cerca de ${property.city || property.address}`;
                console.log(`  🔍 Searching: "${searchQuery}"`);
                promises.push(
                    findTopRatedPlaces(lat, lng, searchQuery).then(results => ({
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