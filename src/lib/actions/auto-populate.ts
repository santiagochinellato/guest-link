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
      // All categories mode: Defaults + Custom Existing Categories
      const allTypes = new Set(Object.keys(DEFAULT_KEYWORDS));
      
      if (property.categories) {
          property.categories.forEach(c => {
              if (c.type) allTypes.add(c.type);
          });
      }
      
      categoriesToProcess = Array.from(allTypes);
      console.log(`🌐 All categories mode: ${categoriesToProcess.length} categories (Defaults + Custom)`);
    }

    // D. Build Search Promises (Category-Driven)
    const promises: Promise<any>[] = [];
    // Create a map of existing categories for quick lookup
    const existingCategoriesMap = new Map<string, typeof property.categories[0]>();
    if (property.categories) {
        property.categories.forEach(c => {
            if (c.type) existingCategoriesMap.set(c.type, c);
        });
    }

    console.log(`📂 Found ${existingCategoriesMap.size} existing categories`);

    for (const type of categoriesToProcess) {
        // Skip types handled explicitly later (unless we want to verify existence here, but getOrCreate handles it there)
        if (type === 'transit' || type === 'outdoors') continue;

        let categoryId: number;
        let categoryKeywords: string[] = [];

        // 1. Get ID and Keywords
        if (existingCategoriesMap.has(type)) {
            const cat = existingCategoriesMap.get(type)!;
            categoryId = cat.id;
            
            // Determine keywords from DB or Default
            if (cat.searchKeywords && cat.searchKeywords.trim() !== "") {
                categoryKeywords = cat.searchKeywords.split(",").map(k => k.trim());
                console.log(`✅ Using custom keywords for ${type}: ${categoryKeywords.join(', ')}`);
            } else if (DEFAULT_KEYWORDS[type]) {
                categoryKeywords = DEFAULT_KEYWORDS[type];
                 console.log(`✅ Using default keywords for ${type}: ${categoryKeywords.join(', ')}`);
            }
        } else {
             // Category doesn't exist. 
             // If manual filter, we MUST create it since user asked for it.
             // If global auto-fill, we only create if it has keywords (part of our core set).
             
             if (!DEFAULT_KEYWORDS[type] || DEFAULT_KEYWORDS[type].length === 0) {
                 console.log(`⏭️  Skipping ${type} (no existing category and no default keywords)`);
                 continue;
             }

             console.log(`🆕 Creating missing category: ${type}`);
             categoryId = await getOrCreateCategory(type, propertyId);
             categoryKeywords = DEFAULT_KEYWORDS[type];
        }

        if (categoryKeywords.length === 0) {
             console.log(`⚠️  No keywords for ${type}`);
             continue;
        }

        // 2. Schedule Searches
        for (const keyword of categoryKeywords) {
             const searchQuery = `${keyword} cerca de ${property.city || property.address}`;
             console.log(`  🔍 Searching: "${searchQuery}"`);
             promises.push(
                findTopRatedPlaces(lat, lng, searchQuery).then(results => ({
                    categoryId: categoryId,
                    categoryType: type,
                    results
                }))
             );
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