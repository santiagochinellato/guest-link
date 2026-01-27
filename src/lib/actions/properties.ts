"use server";

import { db } from "@/db";
import { properties, recommendations, emergencyContacts, transportInfo, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PropertyFormSchema, PropertyFormData } from "@/lib/schemas"; // Import from new file

// Schema definitions moved to @/lib/schemas.ts

export async function deleteProperty(id: number) {
  try {
    await db.transaction(async (tx) => {
        // 1. Delete Recommendations first (FK to Category + Property)
        await tx.delete(recommendations).where(eq(recommendations.propertyId, id));

        // 2. Delete Categories (FK to Property)
        await tx.delete(categories).where(eq(categories.propertyId, id));

        // 3. Delete other weak entities
        await tx.delete(emergencyContacts).where(eq(emergencyContacts.propertyId, id));
        await tx.delete(transportInfo).where(eq(transportInfo.propertyId, id));

        // 4. Finally Delete Property
        await tx.delete(properties).where(eq(properties.id, id));
    });

    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}

// --- Actions ---

export async function createProperty(data: PropertyFormData) {
  const result = PropertyFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  
  const p = result.data;

  try {
    // 1. Insert Property (sin transacción para evitar conflictos de poolers en inserción inicial si es posible, 
    // pero aquí usaremos transacción para consistencia si hay relaciones)
    const propId = await db.transaction(async (tx) => {
      const [newProp] = await tx.insert(properties).values({
        name: p.name,
        slug: p.slug,
        address: p.address,
        city: p.city,
        country: p.country,
        latitude: p.latitude,
        longitude: p.longitude,
        wifiSsid: p.wifiSsid,
        wifiPassword: p.wifiPassword,
        wifiQrCode: p.wifiQrCode,
        coverImageUrl: p.coverImageUrl,
        checkInTime: p.checkInTime,
        checkOutTime: p.checkOutTime,
        status: p.status || "draft",
        houseRules: JSON.stringify({
          text: p.houseRules || "",
          allowed: p.rulesAllowed?.map(r => r.value) || [],
          prohibited: p.rulesProhibited?.map(r => r.value) || [],
          host: {
            name: p.hostName,
            image: p.hostImage,
            phone: p.hostPhone
          }
        }),
      }).returning({ id: properties.id });

      const id = newProp.id;

      // 2. Bulk Insert Categories & Recommendations
      if (p.recommendations && p.recommendations.length > 0) {
        const uniqueCatTypes = Array.from(new Set(p.recommendations.map(r => r.categoryType)));
        
        // Inserción masiva de categorías
        const insertedCats = await tx.insert(categories).values(
          uniqueCatTypes.map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            type: type.toLowerCase(),
            propertyId: id,
          }))
        ).returning();

        const catMap = new Map(insertedCats.map(c => [c.type, c.id]));

        // Inserción masiva de recomendaciones
        await tx.insert(recommendations).values(
          p.recommendations.map(rec => ({
            propertyId: id,
            categoryId: catMap.get(rec.categoryType.toLowerCase()),
            title: rec.title,
            formattedAddress: rec.formattedAddress,
            googleMapsLink: rec.googleMapsLink,
            description: rec.description,
            rating: rec.rating ? Number(rec.rating) : null,
            userRatingsTotal: rec.userRatingsTotal ? Number(rec.userRatingsTotal) : null,
            googlePlaceId: rec.googlePlaceId,
            externalSource: rec.externalSource || "manual",
            geometry: rec.geometry || null,
          }))
        );
      }

      // 3. Bulk Insert Emergency Contacts
      if (p.emergencyContacts && p.emergencyContacts.length > 0) {
        await tx.insert(emergencyContacts).values(
          p.emergencyContacts.map(c => ({
            propertyId: id,
            name: c.name,
            phone: c.phone,
            type: c.type ?? "other"
          }))
        );
      }

      // 4. Bulk Insert Transport Info
      if (p.transport && p.transport.length > 0) {
        await tx.insert(transportInfo).values(
          p.transport.map(t => ({
            propertyId: id,
            name: t.name,
            type: t.type ?? "taxi",
            description: t.description,
            scheduleInfo: t.scheduleInfo,
            priceInfo: t.priceInfo
          }))
        );
      }

      return id;
    });

    revalidatePath("/dashboard/properties");
    return { success: true, id: propId };
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Create Property Error:", err);
    return { success: false, error: err.message };
  }
}


export async function updateProperty(id: number, data: PropertyFormData) {
  const result = PropertyFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  const p = result.data;

  try {
    await db.transaction(async (tx) => {
      // 1. Update basic property info
      await tx.update(properties).set({
        name: p.name,
        slug: p.slug,
        address: p.address,
        city: p.city,
        country: p.country,
        latitude: p.latitude,
        longitude: p.longitude,
        wifiSsid: p.wifiSsid,
        wifiPassword: p.wifiPassword,
        wifiQrCode: p.wifiQrCode,
        coverImageUrl: p.coverImageUrl,
        checkInTime: p.checkInTime,
        checkOutTime: p.checkOutTime,
        houseRules: JSON.stringify({
          text: p.houseRules || "",
          allowed: p.rulesAllowed?.map(r => r.value) || [],
          prohibited: p.rulesProhibited?.map(r => r.value) || [],
          host: {
            name: p.hostName,
            image: p.hostImage,
            phone: p.hostPhone
          }
        }),
        updatedAt: new Date(),
        status: p.status || "draft"
      }).where(eq(properties.id, id));

      // 2. Sync Categories (Optimized)
      const uniqueCategoryTypes = Array.from(new Set(p.recommendations?.map(r => r.categoryType) || []));
      
      // Fetch existing categories for this property only
      const existingCats = await tx.select().from(categories).where(eq(categories.propertyId, id));
      const existingCatMap = new Map(existingCats.map(c => [c.type, c.id]));

      // Identify missing categories
      const missingCatTypes = uniqueCategoryTypes.filter(t => !existingCatMap.has(t));
      
      if (missingCatTypes.length > 0) {
        const newCats = await tx.insert(categories).values(
          missingCatTypes.map(type => ({
            name: type.charAt(0).toUpperCase() + type.slice(1),
            type: type,
            propertyId: id
          }))
        ).returning();
        newCats.forEach(c => existingCatMap.set(c.type!, c.id));
      }

      // 3. Bulk Sync Recommendations
      await tx.delete(recommendations).where(eq(recommendations.propertyId, id));
      if (p.recommendations && p.recommendations.length > 0) {
        const recsToInsert = p.recommendations.map(rec => ({
          propertyId: id,
          categoryId: existingCatMap.get(rec.categoryType),
          title: rec.title,
          description: rec.description,
          formattedAddress: rec.formattedAddress,
          googleMapsLink: rec.googleMapsLink,
          rating: rec.rating ? Number(rec.rating) : null,
          userRatingsTotal: rec.userRatingsTotal ? Number(rec.userRatingsTotal) : null,
          googlePlaceId: rec.googlePlaceId,
          externalSource: rec.externalSource || "manual",
          geometry: rec.geometry || null,
        }));

        // Split into chunks of 50 if very large, but usually it is small
        await tx.insert(recommendations).values(recsToInsert);
      }

      // 4. Bulk Sync Emergency Contacts
      await tx.delete(emergencyContacts).where(eq(emergencyContacts.propertyId, id));
      if (p.emergencyContacts && p.emergencyContacts.length > 0) {
        await tx.insert(emergencyContacts).values(
          p.emergencyContacts.map(c => ({
            propertyId: id,
            name: c.name,
            phone: c.phone,
            type: c.type ?? "other"
          }))
        );
      }

      // 5. Bulk Sync Transport Info
      await tx.delete(transportInfo).where(eq(transportInfo.propertyId, id));
      if (p.transport && p.transport.length > 0) {
        await tx.insert(transportInfo).values(
          p.transport.map(t => ({
            propertyId: id,
            name: t.name,
            type: t.type ?? "taxi",
            description: t.description,
            scheduleInfo: t.scheduleInfo,
            priceInfo: t.priceInfo
          }))
        );
      }
    });

    // Revalidate paths
    revalidatePath(`/dashboard/properties`);
    revalidatePath(`/dashboard/properties/${id}/edit`);
    if (p.slug) {
      revalidatePath(`/es/stay/${p.slug}`);
      revalidatePath(`/en/stay/${p.slug}`);
      revalidatePath(`/[lang]/stay/${p.slug}`, 'page');
    }
    return { success: true };
  } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Update Error:", err);
    return { success: false, error: err.message };
  }
}
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

export async function getProperty(id: number) {
  try {
     // 1. Fetch Property Basic
     const prop = await db.query.properties.findFirst({
       where: eq(properties.id, id),
     });

     if (!prop) return { success: false, error: "Property not found" };

     // 2. Fetch Relations separately
     const [recs, emergency, transport, allCats] = await Promise.all([
         db.query.recommendations.findMany({
             where: eq(recommendations.propertyId, id),
             with: { category: true }
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

        hostName: (() => {
             try { return JSON.parse(prop.houseRules || "").host?.name || ""; } catch { return ""; }
        })(),
        hostImage: (() => {
             try { return JSON.parse(prop.houseRules || "").host?.image || ""; } catch { return ""; }
        })(),
        hostPhone: (() => {
             try { return JSON.parse(prop.houseRules || "").host?.phone || ""; } catch { return ""; }
        })(),
        // Status from DB prop
        status: (prop.status as "active" | "draft" | "archived") || "draft",
        
        houseRules: (() => {
             try {
                 const parsed = JSON.parse(prop.houseRules || "");
                 return parsed.text || prop.houseRules || "";
             } catch {
                 return prop.houseRules || "";
             }
        })(),
        rulesAllowed: (() => {
             try {
                 const parsed = JSON.parse(prop.houseRules || "");
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 return (parsed.allowed || []).map((v: any) => ({ value: v }));
             } catch {
                 return [];
             }
        })(),
        rulesProhibited: (() => {
             try {
                 const parsed = JSON.parse(prop.houseRules || "");
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 return (parsed.prohibited || []).map((v: any) => ({ value: v }));
             } catch {
                 return [];
             }
        })(),
        recommendations: recs.map(r => ({
           title: r.title,
           description: r.description || "",
           formattedAddress: r.formattedAddress || "",
           googleMapsLink: r.googleMapsLink || "",
           categoryType: r.category?.type || "sights", // Fallback
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
    console.error("Fetch Property Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getPropertyBySlug(slug: string) {
  try {
     // 1. Fetch Property Basic
     const prop = await db.query.properties.findFirst({
       where: eq(properties.slug, slug),
     });

     if (!prop) return { success: false, error: "Property not found" };

     // 2. Fetch Relations separately (More robust for poolers)
     const [recs, emergency, transport] = await Promise.all([
         db.query.recommendations.findMany({
             where: eq(recommendations.propertyId, prop.id),
             with: { category: true }
         }),
         db.query.emergencyContacts.findMany({
             where: eq(emergencyContacts.propertyId, prop.id)
         }),
         db.query.transportInfo.findMany({
             where: eq(transportInfo.propertyId, prop.id)
         })
     ]);

     if (!prop) return { success: false, error: "Property not found" };

     // Reuse similar return structure but maybe simpler for guest view? 
     // For now, returning same structure is fine or raw prop.
     // Let's stick to a clean object for the guest view component.
     
     return {
         success: true,
         data: {
             name: prop.name,
             address: prop.address || "",
             city: prop.city || "",
             country: prop.country || "",
             wifiSsid: prop.wifiSsid,
             wifiPassword: prop.wifiPassword,
             wifiQrCode: prop.wifiQrCode || "",
             // Handle House Rules parsing for Guest View (Object Structure)
             houseRules: (() => {
                 try {
                     const parsed = JSON.parse(prop.houseRules || "");
                     return { 
                        text: parsed.text || "", 
                        allowed: parsed.allowed || [], 
                        prohibited: parsed.prohibited || [] 
                     };
                 } catch {
                     return { text: prop.houseRules || "", allowed: [], prohibited: [] };
                 }
             })(),
             hostName: (() => {
                    try { return JSON.parse(prop.houseRules || "").host?.name || ""; } catch { return ""; }
             })(),
             hostImage: (() => {
                    try { return JSON.parse(prop.houseRules || "").host?.image || ""; } catch { return ""; }
             })(),
             hostPhone: (() => {
                    try { return JSON.parse(prop.houseRules || "").host?.phone || ""; } catch { return ""; }
             })(),
             image: prop.coverImageUrl,
             checkIn: prop.checkInTime,
             checkOut: prop.checkOutTime,
             latitude: prop.latitude,
             longitude: prop.longitude,
             recommendations: recs.map(r => ({
                 title: r.title,
                 description: r.description,
                 formattedAddress: r.formattedAddress,
                 googleMapsLink: r.googleMapsLink,
                 category: r.category?.name || "Other", // Use category name for display
                 categoryType: r.category?.type // Keep type for filtering/icons
             })),
             emergencyContacts: emergency,
             transport: transport
         }
     };

  } catch (error: any) {
    console.error("Fetch Property By Slug Error:", error);
    return { success: false, error: error.message };
  } 
}
