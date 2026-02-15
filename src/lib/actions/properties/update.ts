"use server";

import { db } from "@/db";
import { properties, recommendations, emergencyContacts, transportInfo, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PropertyFormData, PropertyFormSchema } from "@/lib/schemas";
import { buildHouseRules } from "./helpers";

/**
 * Actualiza una propiedad existente y todas sus relaciones
 * 
 * @param id - ID de la propiedad a actualizar
 * @param data - Datos del formulario de propiedad
 * @returns Resultado de la operación
 */
export async function updateProperty(id: number, data: PropertyFormData) {
  const result = PropertyFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  const p = result.data;

  try {
    await db.transaction(async (tx) => {
      // 1. Update basic property info
      // Normalize empty strings to null for optional fields
      await tx.update(properties).set({
        name: p.name,
        slug: p.slug,
        address: p.address || null,
        city: p.city || null,
        country: p.country || null,
        latitude: p.latitude || null,
        longitude: p.longitude || null,
        wifiSsid: p.wifiSsid || null,
        wifiPassword: p.wifiPassword || null,
        wifiQrCode: p.wifiQrCode || null,
        coverImageUrl: p.coverImageUrl || null,
        checkInTime: p.checkInTime || null,
        checkOutTime: p.checkOutTime || null,
        houseRules: buildHouseRules({
          houseRules: p.houseRules,
          rulesAllowed: p.rulesAllowed,
          rulesProhibited: p.rulesProhibited,
          accessInstructions: p.accessInstructions,
          hasParking: p.hasParking,
          parkingDetails: p.parkingDetails,
          accessCode: p.accessCode,
          alarmCode: p.alarmCode,
          accessSteps: p.accessSteps,
          preCheckInSteps: p.preCheckInSteps,
          preCheckInNotes: p.preCheckInNotes,
          hostName: p.hostName,
          hostImage: p.hostImage,
          hostPhone: p.hostPhone,
          showHostInEmergency: p.showHostInEmergency,
        }),
        updatedAt: new Date(),
        status: (p.status as "active" | "draft" | "archived") || "draft",
        autoSendGuide: p.autoSendGuide ?? true,
        autoCheckoutReminder: p.autoCheckoutReminder ?? true,
        autoReviewRequest: p.autoReviewRequest ?? true,
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
            description: t.description || null,
            phone: t.phone || null,
            website: t.website || null,
            scheduleInfo: t.scheduleInfo || null,
            priceInfo: t.priceInfo || null
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
    // Extract PostgreSQL error details
    const pgError = err?.code ? {
      code: err.code,
      detail: err.detail,
      hint: err.hint,
      position: err.position,
      internalPosition: err.internalPosition,
      internalQuery: err.internalQuery,
      where: err.where,
      schema: err.schema,
      table: err.table,
      column: err.column,
      dataType: err.dataType,
      constraint: err.constraint,
      file: err.file,
      line: err.line,
      routine: err.routine,
    } : null;

    console.error("[updateProperty] Error updating property:", err);
    console.error("[updateProperty] Error message:", err?.message);
    if (pgError) {
      console.error("[updateProperty] PostgreSQL error details:", pgError);
    }
    console.error("[updateProperty] Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    // Build a more informative error message
    let errorMessage = err?.message || "Error desconocido";
    if (pgError) {
      if (pgError.detail) {
        errorMessage = `${errorMessage}: ${pgError.detail}`;
      }
      if (pgError.hint) {
        errorMessage = `${errorMessage} (${pgError.hint})`;
      }
      if (pgError.constraint) {
        errorMessage = `${errorMessage} [Constraint: ${pgError.constraint}]`;
      }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}


