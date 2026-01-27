"use server";

import { db } from "@/db";
import { properties, recommendations, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findTopRatedPlaces } from "@/lib/services/google-places";
import { searchFoursquarePlaces } from "@/lib/services/foursquare";
import { fetchNearbyPlaces, fetchNearbyTransitStops } from "@/lib/actions/overpass";

// --- DEFAULT KEYWORD MAPPINGS ---
// Used when category doesn't have custom searchKeywords defined
const DEFAULT_KEYWORDS: Record<string, string[]> = {
  // Restaurantes (gastronomy in DB)
  gastronomy: ["restaurantes recomendados", "parrilla argentina", "comida regional"],
  
  // Turismo (sights in DB)
  sights: ["atracciones turísticas", "mirador panorámico", "museo", "puntos de interés"],
  
  // Tiendas (shops in DB - frontend uses 'shops')
  shops: ["ropa", "accesorios", "ropa de invierno", "calzado"],
  
  // Legacy shopping (kept for backward compatibility if needed, though frontend uses shops)
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


// --- HELPER: Search with OSM Fallback ---
// Intenta Google Places primero, si falla usa OpenStreetMap/Overpass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function searchWithFallback(
  lat: number, 
  lng: number, 
  keyword: string, 
  categoryType: string,
  city: string
): Promise<{ results: any[]; source: "google" | "osm" }> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const searchQuery = `${keyword} cerca de ${city}`;
  
  try {
    // Intentar Google Places primero
    const googleResults = await findTopRatedPlaces(lat, lng, searchQuery);
    
    if (googleResults && googleResults.length > 0) {
      console.log(`  ✅ Google: ${googleResults.length} resultados para "${keyword}"`);
      return { results: googleResults, source: "google" };
    }
    
    // Si Google no devuelve resultados, usar OSM como fallback
    console.log(`  ⚠️ Google sin resultados, intentando OSM para "${categoryType}"...`);
  } catch (error: any) {
    // Si Google falla (ej: OVER_QUERY_LIMIT), usar OSM
    console.log(`  ⚠️ Google falló (${error.message || "error"}), usando OSM fallback para "${categoryType}"`);
  }
  
  // Fallback a OpenStreetMap/Overpass
  try {
    const osmResult = await fetchNearbyPlaces(lat, lng, categoryType);
    if (osmResult.success && osmResult.data && osmResult.data.length > 0) {
      console.log(`  ✅ OSM: ${osmResult.data.length} resultados para "${categoryType}"`);
      return { 
        results: osmResult.data.map(item => ({
          ...item,
          externalSource: "osm" as const
        })), 
        source: "osm" 
      };
    }
  } catch {
    console.log(`  ❌ OSM también falló para "${categoryType}"`);
  }
  
  return { results: [], source: "osm" };
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
    const promises: Promise<any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    // 1. Identify all categories to process and batch create them if missing (Optimized)
    const existingCats = property.categories || [];
    const existingCatMap = new Map(existingCats.map(c => [c.type, c.id]));
    const missingCatTypes = categoriesToProcess.filter(type => !existingCatMap.has(type));

    if (missingCatTypes.length > 0) {
      console.log(`🆕 Batch creating ${missingCatTypes.length} categories...`);
      const newCats = await db.insert(categories).values(
        missingCatTypes.map(type => {
          const displayNames: Record<string, string> = {
            "gastronomy": "Restaurantes", "sights": "Turismo", "shops": "Tiendas",
            "shopping": "Compras", "trails": "Senderos", "kids": "Kids",
            "bars": "Bares", "outdoors": "Outdoors", "breakfast": "Desayuno & Cafetería",
            "tourism": "Atracciones & Cultura", "essentials": "Supermercados & Farmacias",
            "nightlife": "Vida Nocturna", "coffee": "Café & Brunch",
            "transit": "Transporte Público", "other": "Otros"
          };
          return {
            name: displayNames[type] || (type.charAt(0).toUpperCase() + type.slice(1)),
            type: type,
            propertyId: propertyId,
            isSystemCategory: false
          };
        })
      ).returning();
      newCats.forEach(c => existingCatMap.set(c.type!, c.id));
    }

    // 2. DISPATCHER: Choose the best source for each category with Resilient Fallbacks
    for (const type of categoriesToProcess) {
        const categoryId = existingCatMap.get(type)!;
        const categoryLabel = property.city || property.address || "";
        
        console.log(`  🎯 Queueing search for category: ${type} (ID: ${categoryId})`);

        if (type === "transit") {
            promises.push(fetchNearbyTransitStops(lat, lng).then(results => ({ categoryId, categoryType: type, results, source: "osm" })));
        } else if (type === "outdoors" || type === "trails") {
            promises.push(fetchNearbyPlaces(lat, lng, type).then(result => ({ categoryId, categoryType: type, results: result.data || [], source: "osm" })));
        } else if (["gastronomy", "nightlife", "bars", "coffee", "breakfast", "shops", "shopping", "tourism", "sights"].includes(type)) {
            // Triple Fallback Strategy: Foursquare -> Google -> OSM
            const fsqQuery = type === "gastronomy" ? "Restaurant Parrilla Steakhouse" : 
                            ["coffee", "breakfast"].includes(type) ? "Specialty Coffee Brunch Cafe" :
                            ["shops", "shopping"].includes(type) ? "Shopping Mall Boutique Store" :
                            "Cervecería Brewery Bar Pub";
            
            const googleKeyword = type === "gastronomy" ? "restaurante parrilla" :
                                 ["coffee", "breakfast"].includes(type) ? "cafetería desayuno" : 
                                 ["shops", "shopping"].includes(type) ? "centro comercial tiendas" : "bar cervecería";

            promises.push(
                searchFoursquarePlaces(lat, lng, fsqQuery).then(async (fsqResults) => {
                    if (fsqResults && fsqResults.length > 0) {
                        return { categoryId, categoryType: type, results: fsqResults, source: "foursquare" };
                    }
                    
                    // FALLBACK 1: GOOGLE
                    console.log(`  ⚠️ FSQ fallback to Google for ${type}...`);
                    try {
                        const googleResults = await findTopRatedPlaces(lat, lng, `${googleKeyword} cerca de ${categoryLabel}`);
                        if (googleResults && googleResults.length > 0) {
                            return { categoryId, categoryType: type, results: googleResults, source: "google" };
                        }
                    } catch (e) {
                        console.warn(`  ❌ Google failed for ${type} (Quota?), trying OSM...`);
                    }

                    // FALLBACK 2: OSM (OpenStreetMap)
                    console.log(`  ⚠️ Google fallback to OSM for ${type}...`);
                    const osmResult = await fetchNearbyPlaces(lat, lng, type);
                    return { categoryId, categoryType: type, results: osmResult.data || [], source: "osm" };
                })
            );
        } else if (["essentials", "supermarket", "pharmacy"].includes(type)) {
            const googleQuery = type === "essentials" ? "supermarket pharmacy" : 
                               type === "supermarket" ? "supermarket grocery" : "pharmacy farmacia";
            
            promises.push(
                findTopRatedPlaces(lat, lng, `${googleQuery} cerca de ${categoryLabel}`).then(async (results) => {
                    if (results && (results as any).length > 0) {
                        return { categoryId, categoryType: type, results, source: "google" };
                    }
                    // Fallback to OSM
                    console.log(`  ⚠️ Essentials fallback to OSM...`);
                    const osmResult = await fetchNearbyPlaces(lat, lng, type);
                    return { categoryId, categoryType: type, results: osmResult.data || [], source: "osm" };
                }).catch(async () => {
                    const osmResult = await fetchNearbyPlaces(lat, lng, type);
                    return { categoryId, categoryType: type, results: osmResult.data || [], source: "osm" };
                })
            );
        } else {
            const keywords = property.categories.find(c => c.type === type)?.searchKeywords?.split(",")[0] || DEFAULT_KEYWORDS[type]?.[0] || type;
            promises.push(searchWithFallback(lat, lng, keywords, type, categoryLabel).then(({ results, source }) => ({ categoryId, categoryType: type, results, source })));
        }
    }


    // D. Process & Batch Insert Results
    const results = await Promise.allSettled(promises);
    
    let addedCount = 0;
    let failedServices = 0;
    const allPendingRecs: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    for (const res of results) {
        if (res.status === "fulfilled") {
            const { categoryId, results: items } = res.value;
            if (items) {
                // Limit 3 per Service/Keyword to avoid spam
                items.slice(0, 3).forEach((item: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
                    allPendingRecs.push({ ...item, categoryId });
                });
            }
        } else {
            failedServices++;
            console.warn("Service failed:", res.reason);
        }
    }

    if (allPendingRecs.length > 0) {
        console.log(`🔍 Checking duplicates for ${allPendingRecs.length} total potential recommendations...`);
        
        // Batch fetch all existing place IDs for this property to avoid N+1 duplicate checks
        const existingRecs = await db.select({ googlePlaceId: recommendations.googlePlaceId })
            .from(recommendations)
            .where(eq(recommendations.propertyId, propertyId));
        
        const existingIdSet = new Set(existingRecs.map(r => r.googlePlaceId).filter(Boolean));

        const filteredRecs = allPendingRecs.filter(rec => !rec.googlePlaceId || !existingIdSet.has(rec.googlePlaceId));
        
        if (filteredRecs.length > 0) {
            console.log(`📥 Bulk inserting ${filteredRecs.length} new unique recommendations...`);
            
            await db.insert(recommendations).values(
                filteredRecs.map((item: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
                    propertyId: propertyId,
                    categoryId: item.categoryId,
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
                }))
            );
            addedCount = filteredRecs.length;
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

    revalidatePath(`/dashboard/properties/${propertyId}/edit`);
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