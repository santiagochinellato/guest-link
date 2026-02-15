import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties, reservations, syncLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Hostly-Sync-Key",
  "Access-Control-Max-Age": "86400",
} as const;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: NextRequest) {
  const corsHeaders = { ...CORS_HEADERS };
  console.log("[sync] POST /api/reservations/sync received");

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
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON body" },
        { status: 400, headers: corsHeaders }
      );
    }

    const raw = body && typeof body === "object" && "reservations" in body
      ? (body as { reservations: unknown }).reservations
      : null;

    if (!Array.isArray(raw)) {
      return NextResponse.json(
        { success: false, error: "Invalid data format: expected { reservations: [] }" },
        { status: 400, headers: corsHeaders }
      );
    }

    const platformMap: Record<string, "booking" | "airbnb"> = {
      booking: "booking",
      airbnb: "airbnb",
      vrbo: "airbnb",
    };

    const incomingReservations = raw
      .map((r: unknown) => {
        if (!r || typeof r !== "object") return null;
        const x = r as Record<string, unknown>;
        const code = typeof x.reservationCode === "string" ? x.reservationCode.trim() : String(x.reservationCode ?? "").trim();
        const guestName = typeof x.guestName === "string" ? x.guestName.trim() : String(x.guestName ?? "").trim();
        const checkIn = typeof x.checkIn === "string" ? x.checkIn.trim() : String(x.checkIn ?? "").trim();
        const checkOut = typeof x.checkOut === "string" ? x.checkOut.trim() : String(x.checkOut ?? "").trim();
        const status = typeof x.status === "string" && ["confirmed", "cancelled", "pending"].includes(x.status) ? x.status : "confirmed";
        const platform = platformMap[String(x.platform ?? "booking").toLowerCase()] ?? "booking";
        if (!code || !guestName || !checkIn || !checkOut) return null;
        return {
          reservationCode: code,
          guestName: guestName || "Unknown Guest",
          checkIn,
          checkOut,
          status,
          platform,
          totalPrice: typeof x.totalPrice === "number" && Number.isFinite(x.totalPrice) ? x.totalPrice : null,
          currency: typeof x.currency === "string" && x.currency.trim() ? x.currency.trim() : "USD",
          listingName: typeof x.listingName === "string" ? x.listingName.trim() || null : null,
          guestEmail: typeof x.guestEmail === "string" && x.guestEmail.trim() ? x.guestEmail.trim() : undefined,
          guestPhone: typeof x.guestPhone === "string" && x.guestPhone.trim() ? x.guestPhone.trim() : undefined,
        };
      })
      .filter(Boolean) as Array<{
        reservationCode: string;
        guestName: string;
        checkIn: string;
        checkOut: string;
        status: string;
        platform: "booking" | "airbnb";
        totalPrice: number | null;
        currency: string;
        listingName: string | null;
        guestEmail?: string;
        guestPhone?: string;
      }>;

    // 3. Upsert Reservations
    const results: { action: string; id: number }[] = [];
    for (const res of incomingReservations) {
      const existing = await db.query.reservations.findFirst({
        where: and(
          eq(reservations.reservationCode, res.reservationCode),
          eq(reservations.platform, res.platform),
          eq(reservations.propertyId, property.id)
        ),
      });

      const guestEmail = (res.guestEmail?.trim() || existing?.guestEmail) ?? null;
      const guestPhone = (res.guestPhone?.trim() || existing?.guestPhone) ?? null;
      const guestLanguage =
        (existing?.guestLanguage && ["es", "en", "pt"].includes(existing.guestLanguage))
          ? existing.guestLanguage
          : "es";

      if (existing) {
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
        const row = updated[0];
        if (row) results.push({ action: "updated", id: row.id });
      } else {
        const inserted = await db
          .insert(reservations)
          .values({
            propertyId: property.id,
            guestName: res.guestName,
            guestEmail,
            guestPhone,
            guestLanguage,
            reservationCode: res.reservationCode,
            checkIn: res.checkIn,
            checkOut: res.checkOut,
            status: res.status,
            totalPrice: res.totalPrice,
            currency: res.currency,
            platform: res.platform,
            listingName: res.listingName,
          })
          .returning();
        const row = inserted[0];
        if (row) results.push({ action: "created", id: row.id });
      }
    }

    // 4. Register success in sync_logs so dashboard SyncStatusCard shows lastSync
    try {
      await db.insert(syncLogs).values({
        propertyId: property.id,
        status: "success",
        triggeredBy: "extension",
        log: `Processed ${results.length} reservations.`,
        completedAt: new Date(),
      });
    } catch (logErr) {
      console.error("Sync log insert failed:", logErr);
      // Don't fail the request; sync succeeded
    }

    return NextResponse.json({
      success: true,
      data: {
        propertyId: property.id,
        processed: results.length,
        details: results,
      },
    }, { headers: corsHeaders });
  } catch (error: unknown) {
    let message = "Internal Server Error";
    try {
      message = error instanceof Error ? error.message : String(error ?? "Internal Server Error");
    } catch (_) {
      // fallback if reading error message throws
    }
    console.error("[sync] Error:", error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
