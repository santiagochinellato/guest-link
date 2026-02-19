"use server";

import { db } from "@/db";
import {
  properties,
  categories,
  recommendations,
  emergencyContacts,
  transportInfo,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { safeJsonParse } from "./helpers";
import { mapPropertyToGuestDTO } from "@/lib/mappers";
import type { PropertyFormData } from "@/lib/schemas";

function mapHouseRulesToForm(houseRules: string | null) {
  const parsed = safeJsonParse(houseRules, {
    text: "",
    allowed: [],
    prohibited: [],
    access: {},
    preCheckIn: {},
    host: {},
  });
  const access = parsed.access || {};
  const preCheckIn = parsed.preCheckIn || {};
  const host = parsed.host || {};
  return {
    houseRules: parsed.text || "",
    rulesAllowed: (parsed.allowed || []).map((v: string) => ({ value: v })),
    rulesProhibited: (parsed.prohibited || []).map((v: string) => ({ value: v })),
    accessInstructions: access.instructions || "",
    accessCode: access.accessCode || "",
    alarmCode: access.alarmCode || "",
    accessSteps: (access.accessSteps || []).map((s: string | { text: string }) =>
      typeof s === "string" ? { text: s } : s
    ),
    hasParking: access.hasParking || false,
    parkingDetails: access.parkingDetails || "",
    preCheckInSteps: (preCheckIn.steps || []).map((s: string | { text: string }) =>
      typeof s === "string" ? { text: s } : s
    ),
    preCheckInNotes: preCheckIn.notes || "",
    hostName: host.name || "",
    hostImage: host.image || "",
    hostPhone: host.phone || "",
    showHostInEmergency: host.showInEmergency ?? true,
  };
}

async function loadPropertyWithRelations(propertyId: number) {
  const [prop] = await db.select().from(properties).where(eq(properties.id, propertyId));
  if (!prop) return null;

  const [cats, recs, emergency, transport] = await Promise.all([
    db.select().from(categories).where(eq(categories.propertyId, propertyId)),
    db.select().from(recommendations).where(eq(recommendations.propertyId, propertyId)),
    db.select().from(emergencyContacts).where(eq(emergencyContacts.propertyId, propertyId)),
    db.select().from(transportInfo).where(eq(transportInfo.propertyId, propertyId)),
  ]);

  const catMap = new Map(cats.map((c) => [c.id, c]));
  const formData: PropertyFormData & { id: number } = {
    id: prop.id,
    name: prop.name,
    slug: prop.slug,
    address: prop.address || "",
    city: prop.city || "",
    country: prop.country || "",
    latitude: prop.latitude || "",
    longitude: prop.longitude || "",
    checkInTime: prop.checkInTime || "",
    checkOutTime: prop.checkOutTime || "",
    coverImageUrl: prop.coverImageUrl || "",
    wifiSsid: prop.wifiSsid || "",
    wifiPassword: prop.wifiPassword || "",
    wifiQrCode: prop.wifiQrCode || "",
    status: (prop.status as "active" | "draft" | "archived") || "draft",
    autoSendGuide: prop.autoSendGuide ?? true,
    autoCheckoutReminder: prop.autoCheckoutReminder ?? true,
    autoReviewRequest: prop.autoReviewRequest ?? true,
    ...mapHouseRulesToForm(prop.houseRules),
    recommendations: recs.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description || "",
      formattedAddress: r.formattedAddress || "",
      googleMapsLink: r.googleMapsLink || "",
      categoryType: catMap.get(r.categoryId!)?.type || "other",
      isAutoSuggested: r.isAutoSuggested ?? false,
      rating: r.rating ?? undefined,
      userRatingsTotal: r.userRatingsTotal ?? undefined,
      googlePlaceId: r.googlePlaceId || undefined,
      externalSource: (r.externalSource as "manual" | "google" | "osm") || "manual",
      geometry: r.geometry ?? undefined,
      latitude: r.latitude || undefined,
      longitude: r.longitude || undefined,
      website: r.website || undefined,
      phone: r.phone || undefined,
    })),
    emergencyContacts: emergency.map((e) => ({
      id: e.id,
      name: e.name || "",
      phone: e.phone,
      type: e.type || "other",
    })),
    transport: transport.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type || "taxi",
      description: t.description || undefined,
      website: t.website || undefined,
      scheduleInfo: t.scheduleInfo || undefined,
      priceInfo: t.priceInfo || undefined,
      phone: t.phone || undefined,
    })),
  };
  return { prop, cats, recs, emergency, transport, formData };
}

export async function getProperties() {
  try {
    const rows = await db
      .select({
        id: properties.id,
        name: properties.name,
        slug: properties.slug,
        address: properties.address,
        status: properties.status,
        coverImageUrl: properties.coverImageUrl,
        wifiSsid: properties.wifiSsid,
        wifiPassword: properties.wifiPassword,
        houseRules: properties.houseRules,
        checkInTime: properties.checkInTime,
        checkOutTime: properties.checkOutTime,
      })
      .from(properties)
      .orderBy(properties.name);
    return { success: true as const, data: rows };
  } catch (err) {
    console.error("[getProperties]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function getProperty(id: number) {
  try {
    const out = await loadPropertyWithRelations(id);
    if (!out) return { success: false as const, error: "Property not found" };
    return { success: true as const, data: out.formData };
  } catch (err) {
    console.error("[getProperty]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function getPropertyBySlug(slug: string) {
  try {
    const [prop] = await db.select().from(properties).where(eq(properties.slug, slug));
    if (!prop) return { success: false as const, error: "Property not found" };
    const out = await loadPropertyWithRelations(prop.id);
    if (!out) return { success: false as const, error: "Property not found" };
    return { success: true as const, data: out.formData };
  } catch (err) {
    console.error("[getPropertyBySlug]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function getPropertyForGuest(propertyId: number) {
  try {
    const out = await loadPropertyWithRelations(propertyId);
    if (!out) return { success: false as const, error: "Property not found" };
    const guestDto = mapPropertyToGuestDTO(
      out.prop,
      out.recs.map((r) => ({
        ...r,
        categoryName: out.cats.find((c) => c.id === r.categoryId)?.name ?? "Other",
        categoryType: out.cats.find((c) => c.id === r.categoryId)?.type ?? "other",
      })),
      out.emergency,
      out.transport
    );
    return { success: true as const, data: guestDto };
  } catch (err) {
    console.error("[getPropertyForGuest]", err);
    return { success: false as const, error: (err as Error).message };
  }
}
