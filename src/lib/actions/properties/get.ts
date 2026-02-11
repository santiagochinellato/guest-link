"use server";

import { db } from "@/db";
import { properties, recommendations, emergencyContacts, transportInfo, categories } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { mapPropertyToGuestDTO } from "@/lib/mappers";
import { PropertyFormData } from "@/lib/schemas";
import { safeJsonParse } from "./helpers";

/**
 * Obtiene todas las propiedades con información de secciones completadas
 * 
 * @returns Lista de propiedades con estado de secciones
 */
export async function getProperties() {
  try {
    const list = await db.select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
      slug: properties.slug,
      views: properties.views,
      status: properties.status,
      coverImageUrl: properties.coverImageUrl,
      wifiSsid: properties.wifiSsid,
      houseRules: properties.houseRules,
      city: properties.city,
      country: properties.country,
      latitude: properties.latitude,
      longitude: properties.longitude,
      checkInTime: properties.checkInTime,
      checkOutTime: properties.checkOutTime,
      syncApiKey: properties.syncApiKey,
    })
      .from(properties)
      .orderBy(properties.createdAt);

    // Fetch related data for section status
    const sectionsData = await Promise.all(
      list.map(async (prop) => {
        const [recs, emergency, transport] = await Promise.all([
          db.select({ id: recommendations.id }).from(recommendations).where(eq(recommendations.propertyId, prop.id)),
          db.select({ id: emergencyContacts.id }).from(emergencyContacts).where(eq(emergencyContacts.propertyId, prop.id)),
          db.select({ id: transportInfo.id }).from(transportInfo).where(eq(transportInfo.propertyId, prop.id)),
        ]);

        return {
          id: prop.id,
          sections: {
            basic: !!(prop.name && prop.coverImageUrl), // Información Básica
            location: !!(prop.address && prop.latitude && prop.longitude), // Ubicación
            wifi: !!prop.wifiSsid, // WiFi y Acceso
            recommendations: recs.length > 0, // Recomendaciones
            transport: transport.length > 0, // Transporte
            rules: !!prop.houseRules, // Reglas
            emergency: emergency.length > 0, // Emergencia
            qr: false, // Diseño QR Flyer (placeholder - siempre false por ahora)
          }
        };
      })
    );

    const sectionsMap = new Map(sectionsData.map(s => [s.id, s.sections]));

    const enrichedList = list.map(prop => ({
      id: prop.id,
      name: prop.name,
      address: prop.address,
      slug: prop.slug,
      views: prop.views,
      status: prop.status,
      coverImageUrl: prop.coverImageUrl,
      wifiSsid: prop.wifiSsid,
      houseRules: prop.houseRules,
      syncApiKey: prop.syncApiKey,
      sections: sectionsMap.get(prop.id) || {
        basic: false,
        location: false,
        wifi: false,
        recommendations: false,
        transport: false,
        rules: false,
        emergency: false,
        qr: false,
      }
    }));

    return { success: true, data: enrichedList };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Fetch Properties Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene una propiedad por ID en formato PropertyFormData
 * 
 * @param id - ID de la propiedad
 * @returns Datos de la propiedad en formato de formulario
 */
export async function getProperty(id: number) {
  try {
    // 1. Fetch Property Basic - Try with raw SQL first to get better error messages
    let prop;
    try {
      // Try using select with where clause instead of query API
      const [result] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);

      prop = result;
    } catch (queryError: any) {
      console.error(`[getProperty] Query error details:`, {
        message: queryError?.message,
        code: queryError?.code,
        detail: queryError?.detail,
        hint: queryError?.hint,
        position: queryError?.position,
        internalPosition: queryError?.internalPosition,
        internalQuery: queryError?.internalQuery,
        where: queryError?.where,
        schema: queryError?.schema,
        table: queryError?.table,
        column: queryError?.column,
        dataType: queryError?.dataType,
        constraint: queryError?.constraint,
        file: queryError?.file,
        line: queryError?.line,
        routine: queryError?.routine,
        stack: queryError?.stack,
        fullError: JSON.stringify(queryError, Object.getOwnPropertyNames(queryError)),
      });

      // Try raw SQL as fallback to see if it's a schema issue
      try {
        const rawResult = await db.execute(
          sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`
        );
        if (rawResult && rawResult.length > 0) {
          prop = rawResult[0] as any;
        }
      } catch (rawError: any) {
        console.error(`[getProperty] Raw SQL also failed:`, rawError?.message);
        throw queryError; // Throw original error
      }

      if (!prop) {
        throw queryError;
      }
    }

    if (!prop) {
      console.error(`[getProperty] Property with id ${id} not found`);
      return { success: false, error: "Property not found" };
    }

    // 2. Fetch Relations separately
    const [recs, emergency, transport, allCats] = await Promise.all([
      db.query.recommendations.findMany({
        where: eq(recommendations.propertyId, id),
        columns: {
          id: true,
          title: true,
          description: true,
          formattedAddress: true,
          googleMapsLink: true,
          rating: true,
          userRatingsTotal: true,
          googlePlaceId: true,
          externalSource: true,
          categoryId: true // Added to allow manual mapping
        }
      }),
      db.query.emergencyContacts.findMany({
        where: eq(emergencyContacts.propertyId, id)
      }),
      db.query.transportInfo.findMany({
        where: eq(transportInfo.propertyId, id)
      }),
      db.query.categories.findMany({
        where: eq(categories.propertyId, id)
      })
    ]);

    if (!prop) return { success: false, error: "Property not found" };

    // Create Map for O(1) Access
    const catMap = new Map(allCats.map(c => [c.id, c]));

    // Transform to Form Data structure if needed
    const formData: PropertyFormData = {
      name: prop.name,
      slug: prop.slug,
      address: prop.address || "",
      city: prop.city || "",
      country: prop.country || "",
      latitude: prop.latitude || "",
      longitude: prop.longitude || "",
      wifiSsid: prop.wifiSsid || "",
      wifiPassword: prop.wifiPassword || "",
      wifiQrCode: prop.wifiQrCode || "",
      coverImageUrl: prop.coverImageUrl || "",
      checkInTime: prop.checkInTime || "",
      checkOutTime: prop.checkOutTime || "",

      hostName: safeJsonParse(prop.houseRules).host?.name || "",
      hostImage: safeJsonParse(prop.houseRules).host?.image || "",
      hostPhone: safeJsonParse(prop.houseRules).host?.phone || "",
      // Status from DB prop
      status: (prop.status as "active" | "draft" | "archived") || "draft",
      autoSendGuide: prop.autoSendGuide ?? true,
      autoCheckoutReminder: prop.autoCheckoutReminder ?? true,
      autoReviewRequest: prop.autoReviewRequest ?? true,

      houseRules: (() => {
        if (!prop.houseRules) return "";

        // Si es un string, intentar parsearlo
        if (typeof prop.houseRules === "string") {
          const trimmed = prop.houseRules.trim();

          // Si parece ser JSON (empieza con {)
          if (trimmed.startsWith("{")) {
            try {
              const parsed = JSON.parse(trimmed);
              // Si es un objeto con propiedad text, devolver solo el text (incluso si está vacío)
              if (parsed && typeof parsed === "object" && parsed !== null && "text" in parsed) {
                // Devolver el texto, incluso si es cadena vacía (para que muestre el placeholder)
                return typeof parsed.text === "string" ? parsed.text : "";
              }
              // Si no tiene text, no es el formato esperado, devolver vacío
              return "";
            } catch (e) {
              // Si falla el parse, no es JSON válido, devolver vacío
              console.warn("[getProperty] Error parsing houseRules JSON:", e);
              return "";
            }
          }
          // Si no es JSON, asumir que es texto plano
          return trimmed;
        }

        // Si ya es un objeto, extraer el texto
        if (typeof prop.houseRules === "object" && prop.houseRules !== null) {
          return (prop.houseRules as any).text || "";
        }

        // Fallback: devolver cadena vacía
        return "";
      })(),
      rulesAllowed: (() => {
        const parsed: any = safeJsonParse(prop.houseRules);
        return (parsed.allowed || []).map((v: any) => ({ value: v }));
      })(),
      rulesProhibited: (() => {
        const parsed: any = safeJsonParse(prop.houseRules);
        return (parsed.prohibited || []).map((v: any) => ({ value: v }));
      })(),
      accessInstructions: safeJsonParse(prop.houseRules).access?.instructions || "",
      accessCode: safeJsonParse(prop.houseRules).access?.accessCode || "",
      alarmCode: safeJsonParse(prop.houseRules).access?.alarmCode || "",
      accessSteps: (safeJsonParse(prop.houseRules).access?.accessSteps || []).map((s: string) => ({ text: s })),
      hasParking: safeJsonParse(prop.houseRules).access?.hasParking || false,
      parkingDetails: safeJsonParse(prop.houseRules).access?.parkingDetails || "",
      recommendations: recs.map(r => ({
        title: r.title,
        description: r.description || "",
        formattedAddress: r.formattedAddress || "",
        googleMapsLink: r.googleMapsLink || "",
        categoryType: (r.categoryId ? catMap.get(r.categoryId)?.type : null) || "sights", // Manual lookup
      })),
      emergencyContacts: emergency.map(c => ({
        name: c.name || "",
        phone: c.phone || "",
        type: (c.type as any) || "other",
      })),
      transport: transport.map(t => ({
        name: t.name,
        type: (t.type as any) || "taxi",
        description: t.description || "",
        scheduleInfo: t.scheduleInfo || "",
        priceInfo: t.priceInfo || "",
      })),
      categories: allCats.map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon || undefined,
        type: c.type || "other",
        displayOrder: c.displayOrder || undefined,
        isSystemCategory: c.isSystemCategory || undefined,
        searchKeywords: c.searchKeywords || undefined,
        propertyId: c.propertyId || undefined
      })) || []
    };

    return { success: true, data: { ...formData, id: prop.id } };

  } catch (error: any) {
    console.error("[getProperty] Error fetching property:", error);
    console.error("[getProperty] Error details:", {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      name: error?.name,
    });
    return {
      success: false,
      error: error?.message || "Failed query: " + (error?.toString() || "Unknown error")
    };
  }
}

/**
 * Obtiene una propiedad por slug en formato GuestProperty (para vista pública)
 * 
 * @param slug - Slug de la propiedad
 * @returns Propiedad en formato DTO para huésped
 */
export async function getPropertyBySlug(slug: string) {
  try {
    // 1. Fetch Property Basic
    const prop = await db.query.properties.findFirst({
      where: eq(properties.slug, slug),
    });

    if (!prop) return { success: false, error: "Property not found" };

    // 2. Fetch Relations separately (More robust for poolers)
    const [recs, emergency, transport, allCategories] = await Promise.all([
      db.query.recommendations.findMany({
        where: eq(recommendations.propertyId, prop.id),
        columns: {
          id: true,
          title: true,
          description: true,
          formattedAddress: true,
          googleMapsLink: true,
          rating: true,
          userRatingsTotal: true,
          googlePlaceId: true,
          externalSource: true,
          latitude: true,
          longitude: true,
          website: true,
          phone: true,
          openingHours: true,
          priceRange: true,
          categoryId: true, // Needed for manual mapping
        }
      }),
      db.query.emergencyContacts.findMany({
        where: eq(emergencyContacts.propertyId, prop.id)
      }),
      db.query.transportInfo.findMany({
        where: eq(transportInfo.propertyId, prop.id)
      }),
      db.query.categories.findMany({
        where: eq(categories.propertyId, prop.id)
      })
    ]);

    if (!prop) return { success: false, error: "Property not found" };

    // Create Category Map for O(1) lookup
    const catMap = new Map(allCategories.map(c => [c.id, c]));

    // Join Category Name to Recommendations for Mapper logic
    const enhancedRecs = recs.map(r => {
      const cat = r.categoryId ? catMap.get(r.categoryId) : null;
      return { ...r, categoryName: cat?.name, categoryType: cat?.type };
    });

    // Use Mapper
    const propDTO = mapPropertyToGuestDTO(prop, enhancedRecs, emergency, transport);
    return { success: true, data: propDTO };

  } catch (error: any) {
    console.error("Fetch Property By Slug Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtiene una propiedad por ID en formato GuestProperty (para vista de huésped con token)
 * Usa raw SQL para evitar problemas de schema cuando las migraciones no están aplicadas
 * 
 * @param id - ID de la propiedad
 * @returns Propiedad en formato DTO para huésped
 */
export async function getPropertyForGuest(id: number) {
  try {
    const propRows = await db.execute(
      sql`SELECT id, name, slug, address, city, country, latitude, longitude, wifi_ssid, wifi_password, wifi_qr_code, house_rules_text, cover_image_url, check_in_time, check_out_time FROM properties WHERE id = ${id} LIMIT 1`
    );
    const propRow = Array.isArray(propRows) ? propRows[0] : (propRows as { rows?: unknown[] }).rows?.[0];
    if (!propRow) return { success: false, error: "Property not found" };

    const p = propRow as Record<string, unknown>;
    const prop = {
      id: p.id,
      name: p.name,
      slug: p.slug,
      address: p.address,
      city: p.city,
      country: p.country,
      latitude: p.latitude,
      longitude: p.longitude,
      wifiSsid: p.wifi_ssid,
      wifiPassword: p.wifi_password,
      wifiQrCode: p.wifi_qr_code,
      houseRules: p.house_rules_text,
      coverImageUrl: p.cover_image_url,
      checkInTime: p.check_in_time,
      checkOutTime: p.check_out_time,
    };

    const [recsRows, emergencyRows, transportRows, catsRows] = await Promise.all([
      db.execute(sql`SELECT id, title, description, formatted_address, google_maps_link, latitude, longitude, website, phone, price_range, category_id FROM recommendations WHERE property_id = ${id}`),
      db.execute(sql`SELECT id, type, name, phone, address FROM emergency_contacts WHERE property_id = ${id}`),
      db.execute(sql`SELECT id, type, name, description, phone, website, schedule_info, price_info FROM transport_info WHERE property_id = ${id}`),
      db.execute(sql`SELECT id, name, type FROM categories WHERE property_id = ${id}`),
    ]);

    const toArr = (r: unknown) => (Array.isArray(r) ? r : (r as { rows?: unknown[] }).rows ?? []);
    const recs = toArr(recsRows).map((r: Record<string, unknown>) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      formattedAddress: r.formatted_address,
      googleMapsLink: r.google_maps_link,
      rating: r.rating ?? null,
      userRatingsTotal: r.user_ratings_total ?? null,
      latitude: r.latitude,
      longitude: r.longitude,
      website: r.website,
      phone: r.phone,
      openingHours: r.opening_hours ?? null,
      priceRange: r.price_range,
      categoryId: r.category_id,
      categoryName: null as string | null,
      categoryType: null as string | null,
    }));
    const allCategories = toArr(catsRows).map((c: Record<string, unknown>) => ({
      id: c.id as number,
      name: c.name as string | undefined,
      type: c.type as string | undefined,
    }));
    const catMap = new Map(allCategories.map((c) => [c.id, c]));
    const enhancedRecs = recs.map((r) => {
      const cat = r.categoryId ? catMap.get(r.categoryId as number) : null;
      return { ...r, categoryName: cat?.name ?? null, categoryType: cat?.type ?? null };
    });

    const emergency = toArr(emergencyRows).map((e: Record<string, unknown>) => ({
      name: e.name,
      phone: e.phone,
      type: e.type,
    }));
    const transport = toArr(transportRows).map((t: Record<string, unknown>) => ({
      name: t.name,
      type: t.type,
      description: t.description,
      scheduleInfo: t.schedule_info,
      priceInfo: t.price_info,
      website: t.website,
      phone: t.phone,
    }));

    const propDTO = mapPropertyToGuestDTO(prop, enhancedRecs, emergency, transport);
    return { success: true, data: propDTO };
  } catch (error: any) {
    console.error("Fetch Property For Guest Error:", error);
    return { success: false, error: error.message };
  }
}



