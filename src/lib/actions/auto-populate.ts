"use server";

import { db } from "@/db";
import { properties, recommendations, categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findTopRatedPlaces, findNearbyTransit } from "@/lib/services/google-places";
import { fetchNearbyPlaces } from "@/lib/actions/overpass";

// --- 1. Helper para Categorías (Optimizado) ---
async function getOrCreateCategory(type: string, propertyId: string): Promise<string> {
    // Normalizamos el type para evitar duplicados por casing
    const normalizedType = type.toLowerCase().trim();
    
    // Mapeo de tipos técnicos a Nombres Amigables para la UI
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

// --- 2. Main Action ---
export async function populateRecommendations(propertyId: string) {
  try {
    // A. Validación Inicial
    const property = await db.query.properties.findFirst({
        where: eq(properties.id, propertyId),
    });

    if (!property || !property.latitude || !property.longitude) {
        return { success: false, error: "Propiedad no encontrada o sin coordenadas." };
    }

    const lat = parseFloat(property.latitude);
    const lng = parseFloat(property.longitude);

    // B. Check de "Ya poblado" (Evitar gastos innecesarios de API)
    const existingAuto = await db.select().from(recommendations).where(
        and(
            eq(recommendations.propertyId, propertyId),
            eq(recommendations.externalSource, "google")
        )
    );

    // Si ya tiene más de 5 recomendaciones de Google, asumimos que ya se corrió.
    // Puedes comentar esto si quieres forzar la actualización.
    if (existingAuto.length > 5) {
        return { success: true, message: "La propiedad ya tiene recomendaciones automáticas.", count: 0 };
    }
    
    // C. Estrategia de Keywords "Premium"
    // Usamos términos bilingües para asegurar match con POIs locales y turistas.
    const promises = [
        // 1. GASTRONOMÍA (Dividido por momentos del día)
        // Cena/Almuerzo fuerte (Parrillas, Local, Alta cocina)
        findTopRatedPlaces(lat, lng, "best restaurants local cuisine parrilla steakhouse"),
        // Desayuno/Merienda (Crucial para huéspedes)
        findTopRatedPlaces(lat, lng, "specialty coffee bakery cafe brunch pastelería"),
        // Opciones Veggie/Saludables (Muy buscado hoy)
        findTopRatedPlaces(lat, lng, "vegetarian vegan healthy food organic"),
        
        // 2. ESENCIALES (Lo primero que busca un huésped)
        findTopRatedPlaces(lat, lng, "supermarket grocery store mercado"),
        findTopRatedPlaces(lat, lng, "pharmacy drugstore farmacia"),
        
        // 3. TURISMO & PASEOS
        findTopRatedPlaces(lat, lng, "tourist attraction historical landmark viewpoint mirador"),
        findTopRatedPlaces(lat, lng, "museum art gallery culture"),
        
        // 4. ENTRETENIMIENTO & FAMILIA
        findTopRatedPlaces(lat, lng, "kids activities family entertainment playground"),
        findTopRatedPlaces(lat, lng, "cinema movie theater ice cream heladería"),
        
        // 5. VIDA NOCTURNA
        findTopRatedPlaces(lat, lng, "cocktail bar craft beer brewery cervecería artesanal"),
        
        // 6. COMPRAS (Filtrado para evitar kioscos)
        findTopRatedPlaces(lat, lng, "shopping mall boutique gift shop regional products"),

        // 7. SERVICIOS ESPECIALIZADOS
        // Google Transit (Estaciones cercanas)
        findNearbyTransit(lat, lng),
        
        // OpenStreetMap (Naturaleza pura)
        fetchNearbyPlaces(lat, lng, "outdoors"),
    ];

    // D. Ejecución Resiliente (Promise.allSettled)
    const results = await Promise.allSettled(promises);
    
    const allSuggestions: any[] = [];
    let failedServices = 0;

    for (const res of results) {
        if (res.status === "fulfilled") {
            const val = res.value;
            // Manejo flexible de respuestas (Google array vs Overpass object)
            if (Array.isArray(val)) {
                allSuggestions.push(...val);
            } else if (val && typeof val === 'object' && "data" in val && Array.isArray((val as any).data)) {
                 allSuggestions.push(...(val as any).data);
            }
        } else {
            failedServices++;
            console.warn("Service failed:", res.reason);
        }
    }

    if (allSuggestions.length === 0) {
        return { 
            success: true, 
            message: failedServices > 0 
                ? `No se encontraron lugares. ${failedServices} servicio(s) fallaron.` 
                : "No se encontraron lugares cercanos relevantes.",
            count: 0 
        };
    }

    // E. Procesamiento y Mapeo Inteligente
    let addedCount = 0;
    const categoryMap = new Map<string, string>(); // Cache de IDs de categorías

    // Mapeo inverso de keywords a "Tipos" internos para agrupar en DB
    // Esto asegura que "cafe" vaya a "Breakfast" y no a "Gastronomy" genérico
    const categorizeItem = (item: any): string => {
        const text = (item.title + " " + (item.categoryType || "")).toLowerCase();
        
        if (text.includes("cafe") || text.includes("coffee") || text.includes("bakery") || text.includes("brunch")) return "breakfast";
        if (text.includes("pharmacy") || text.includes("supermarket") || text.includes("grocery")) return "essentials";
        if (text.includes("beer") || text.includes("bar") || text.includes("pub") || text.includes("wine")) return "nightlife";
        if (text.includes("park") || text.includes("playground") || text.includes("kids") || text.includes("ice cream")) return "kids";
        if (text.includes("transit") || text.includes("station") || text.includes("bus")) return "transit";
        if (text.includes("hiking") || text.includes("trail") || text.includes("viewpoint")) return "outdoors";
        if (text.includes("museum") || text.includes("gallery") || text.includes("attraction")) return "tourism";
        
        // Default fallbacks
        if (item.categoryType === "restaurant") return "gastronomy";
        return item.categoryType || "other";
    };

    for (const item of allSuggestions) {
        const targetType = categorizeItem(item);
        
        // Obtener ID de categoría (con caché local para velocidad)
        if (!categoryMap.has(targetType)) {
            const catId = await getOrCreateCategory(targetType, propertyId);
            categoryMap.set(targetType, catId);
        }
        
        // Evitar duplicados por Google Place ID
        if (item.googlePlaceId) {
             const existing = await db.select().from(recommendations).where(
                 eq(recommendations.googlePlaceId, item.googlePlaceId)
             ).limit(1);
             if (existing.length > 0) continue; 
        }

        await db.insert(recommendations).values({
            propertyId: propertyId,
            categoryId: categoryMap.get(targetType),
            title: item.title,
            description: item.description || `Recomendado en ${targetType}`, // Fallback description
            formattedAddress: item.formattedAddress,
            googleMapsLink: item.googleMapsLink,
            rating: item.rating ? Number(item.rating) : null, 
            userRatingsTotal: item.userRatingsTotal ? Number(item.userRatingsTotal) : null,
            googlePlaceId: item.googlePlaceId,
            externalSource: item.externalSource || "manual",
            geometry: item.geometry || null,
            isAutoSuggested: true
        });
        
        addedCount++;
    }

    revalidatePath(`/dashboard/properties`);
    
    return { 
        success: true, 
        count: addedCount, 
        message: `Se agregaron ${addedCount} lugares nuevos (${failedServices} errores de API).` 
    };
    
  } catch (error: any) {
    console.error("Auto-Populate Critical Error:", error);
    return { success: false, error: error.message || "Error desconocido al poblar datos." };
  }
}