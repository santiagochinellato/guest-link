import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, reservations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Hostly-Sync-Key",
    },
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Hostly-Sync-Key",
  };

  try {
    const apiKey = req.headers.get("X-Hostly-Sync-Key");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Missing API Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 1. Validate Property via API Key
    const property = await db.query.properties.findFirst({
      where: eq(properties.syncApiKey, apiKey),
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Invalid API Key" },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Parse Body
    const body = await req.json();
    const { reservations: incomingReservations } = body;

    if (!Array.isArray(incomingReservations)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format" },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Upsert Reservations
    const results = [];
    for (const res of incomingReservations) {
      // Check if reservation exists for this platform and code
      const existing = await db.query.reservations.findFirst({
        where: and(
          eq(reservations.reservationCode, res.reservationCode),
          eq(reservations.platform, res.platform),
          eq(reservations.propertyId, property.id)
        ),
      });

      const guestEmail = "guestEmail" in res
        ? (typeof res.guestEmail === "string" && res.guestEmail.trim() ? res.guestEmail.trim() : null)
        : existing?.guestEmail ?? null;
      const guestPhone = "guestPhone" in res
        ? (typeof res.guestPhone === "string" && res.guestPhone.trim() ? res.guestPhone.trim() : null)
        : existing?.guestPhone ?? null;
      const validLang = (l: unknown): l is "es" | "en" | "pt" =>
        typeof l === "string" && ["es", "en", "pt"].includes(l);
      const guestLanguage =
        "guestLanguage" in res && validLang(res.guestLanguage)
          ? res.guestLanguage
          : (existing?.guestLanguage && validLang(existing.guestLanguage)
              ? existing.guestLanguage
              : "es");

      if (existing) {
        // Update
        const updated = await db
          .update(reservations)
          .set({
            guestName: res.guestName,
            guestEmail,
            guestPhone,
            guestLanguage,
            checkIn: res.checkIn,
            checkOut: res.checkOut,
            status: res.status,
            totalPrice: res.totalPrice,
            currency: res.currency,
            listingName: res.listingName,
            updatedAt: new Date(),
          })
          .where(eq(reservations.id, existing.id))
          .returning();
        results.push({ action: "updated", id: updated[0].id });
      } else {
        // Insert
        const inserted = await db
          .insert(reservations)
          .values({
            propertyId: property.id,
            guestName: res.guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
            guestLanguage,
            reservationCode: res.reservationCode,
            checkIn: res.checkIn,
            checkOut: res.checkOut,
            status: res.status,
            totalPrice: res.totalPrice,
            currency: res.currency || "USD",
            platform: res.platform,
            listingName: res.listingName,
          })
          .returning();
        results.push({ action: "created", id: inserted[0].id });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        propertyId: property.id,
        processed: results.length,
        details: results,
      },
    }, { headers: corsHeaders });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
