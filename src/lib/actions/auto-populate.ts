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

// --- HELPER: Get or Create Category ---
async function getOrCreateCategory(type: string, propertyId: number): Promise<number> {
    const normalizedType = type.toLowerCase().trim();
    
    const displayNames: Record<string, string> = {
        "gastronomy": "Restaurantes",
        "sights": "Turismo",
        "shops": "Tiendas",
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
        "coffee": "Café & Brunch",
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
        // 1. Get Category ID
        const categoryId = await getOrCreateCategory(type, propertyId);
        const categoryLabel = property.city || property.address || "";
        
        console.log(`  🎯 Processing category: ${type} (ID: ${categoryId})`);

        // 2. DISPATCHER: Choose the best source for each category
        if (type === "transit") {
            // OSM Transit (Free)
            promises.push(
                fetchNearbyTransitStops(lat, lng).then(results => ({
                    categoryId,
                    categoryType: type,
                    results,
                    source: "osm"
                }))
            );
        } else if (type === "outdoors" || type === "trails") {
            // OSM Outdoors
            promises.push(
                fetchNearbyPlaces(lat, lng, type).then(result => ({
                    categoryId,
                    categoryType: type,
                    results: result.data || [],
                    source: "osm"
                }))
            );
        } else if (["gastronomy", "nightlife", "bars", "coffee", "breakfast"].includes(type)) {
            // Foursquare for popularity
            const fsqQuery = type === "gastronomy" ? "Restaurant Parrilla Steakhouse" : 
                            type === "coffee" || type === "breakfast" ? "Specialty Coffee Brunch Cafe" :
                            "Cervecería Brewery Bar Pub";
            
            promises.push(
                searchFoursquarePlaces(lat, lng, fsqQuery).then(results => ({
                    categoryId,
                    categoryType: type,
                    results,
                    source: "foursquare"
                }))
            );
        } else if (["essentials", "supermarket", "pharmacy"].includes(type)) {
            // Google for precision
            const googleQuery = type === "essentials" ? "supermarket pharmacy" : 
                               type === "supermarket" ? "supermarket grocery" : "pharmacy farmacia";
                               
            promises.push(
                findTopRatedPlaces(lat, lng, `${googleQuery} cerca de ${categoryLabel}`).then(results => ({
                    categoryId,
                    categoryType: type,
                    results,
                    source: "google"
                }))
            );
        } else {
            // Default Fallback: Google -> OSM
            const keywords = existingCategoriesMap.get(type)?.searchKeywords?.split(",")[0] || DEFAULT_KEYWORDS[type]?.[0] || type;
            promises.push(
                searchWithFallback(lat, lng, keywords, type, categoryLabel).then(({ results, source }) => ({
                    categoryId,
                    categoryType: type,
                    results,
                    source
                }))
            );
        }
    }


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