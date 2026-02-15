"use server";

import { db } from "@/db";
import { properties, recommendations, emergencyContacts, transportInfo, categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { PropertyFormData, PropertyFormSchema } from "@/lib/schemas";
import {
  defaultRecommendations,
  convertDefaultRecommendationsToSystemFormat,
  getDefaultCategoriesFromRecommendations,
} from "@/lib/default-recommendations";
import { buildHouseRules } from "./helpers";

/**
 * Crea una nueva propiedad con todas sus relaciones
 * 
 * @param data - Datos del formulario de propiedad
 * @returns Resultado con el ID de la propiedad creada
 */
export async function createProperty(data: PropertyFormData) {
  const result = PropertyFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }

  const p = result.data;

  try {
    const propId = await db.transaction(async (tx) => {
      // 1. Insert Property
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
      }).returning({ id: properties.id });

      const id = newProp.id;

      // 2. Bulk Insert Categories & Recommendations
      let recommendationsToInsert = p.recommendations || [];
      let categoriesToInsert: Array<{ type: string; name: string; icon: string; displayOrder: number; isSystemCategory: boolean }> = [];

      if (recommendationsToInsert.length === 0) {
        // Cargar recomendaciones base
        const defaultRecs = convertDefaultRecommendationsToSystemFormat(defaultRecommendations);
        recommendationsToInsert = defaultRecs;

        // Cargar categorías base
        categoriesToInsert = getDefaultCategoriesFromRecommendations(defaultRecommendations);
      } else {
        // Si hay recomendaciones proporcionadas, crear categorías basadas en ellas
        const uniqueCatTypes = Array.from(new Set(recommendationsToInsert.map(r => r.categoryType)));
        categoriesToInsert = uniqueCatTypes.map(type => ({
          type: type.toLowerCase(),
          name: type.charAt(0).toUpperCase() + type.slice(1),
          icon: "star", // Icono por defecto
          displayOrder: 0,
          isSystemCategory: false,
        }));
      }

      // Inserción masiva de categorías
      const insertedCats = await tx.insert(categories).values(
        categoriesToInsert.map(cat => ({
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          displayOrder: cat.displayOrder,
          isSystemCategory: cat.isSystemCategory,
          propertyId: id,
        }))
      ).returning();

      const catMap = new Map(insertedCats.map(c => [c.type, c.id]));

      // Inserción masiva de recomendaciones
      if (recommendationsToInsert.length > 0) {
        await tx.insert(recommendations).values(
          recommendationsToInsert.map(rec => ({
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
            description: t.description || null,
            phone: t.phone || null,
            website: t.website || null,
            scheduleInfo: t.scheduleInfo || null,
            priceInfo: t.priceInfo || null
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



