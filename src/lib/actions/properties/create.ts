"use server";

import { db } from "@/db";
import {
  properties,
  categories,
  recommendations,
  emergencyContacts,
  transportInfo,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { PropertyFormData, PropertyFormSchema } from "@/lib/schemas";
import { buildHouseRules } from "./helpers";

export async function createProperty(data: PropertyFormData) {
  const result = PropertyFormSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.message };
  }
  const p = result.data;

  try {
    const [inserted] = await db.transaction(async (tx) => {
      const [prop] = await tx
        .insert(properties)
        .values({
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
        })
        .returning();

      if (!prop) throw new Error("Insert property failed");

      const uniqueCategoryTypes = Array.from(new Set(p.recommendations?.map((r) => r.categoryType) || []));
      const existingCatMap = new Map<string, number>();

      if (uniqueCategoryTypes.length > 0) {
        const newCats = await tx
          .insert(categories)
          .values(
            uniqueCategoryTypes.map((type) => ({
              name: type.charAt(0).toUpperCase() + type.slice(1),
              type,
              propertyId: prop.id,
            }))
          )
          .returning();
        newCats.forEach((c) => {
          if (c.type) existingCatMap.set(c.type, c.id);
        });
      }

      if (p.recommendations && p.recommendations.length > 0) {
        await tx.insert(recommendations).values(
          p.recommendations.map((rec) => ({
            propertyId: prop.id,
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
          }))
        );
      }

      if (p.emergencyContacts && p.emergencyContacts.length > 0) {
        await tx.insert(emergencyContacts).values(
          p.emergencyContacts.map((c) => ({
            propertyId: prop.id,
            name: c.name,
            phone: c.phone,
            type: c.type ?? "other",
          }))
        );
      }

      if (p.transport && p.transport.length > 0) {
        await tx.insert(transportInfo).values(
          p.transport.map((t) => ({
            propertyId: prop.id,
            name: t.name,
            type: t.type ?? "taxi",
            description: t.description || null,
            phone: t.phone || null,
            website: t.website || null,
            scheduleInfo: t.scheduleInfo || null,
            priceInfo: t.priceInfo || null,
          }))
        );
      }

      return [prop];
    });

    revalidatePath("/dashboard/properties");
    if (inserted?.slug) {
      revalidatePath(`/es/stay/${inserted.slug}`);
      revalidatePath(`/en/stay/${inserted.slug}`);
      revalidatePath(`/[lang]/stay/${inserted.slug}`, "page");
    }
    return { success: true, data: { id: inserted!.id } };
  } catch (err) {
    console.error("[createProperty]", err);
    return {
      success: false,
      error: (err as Error).message,
    };
  }
}
