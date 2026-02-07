"use server";

import { db } from "@/db";
import { guestTokens, reservations } from "@/db/schema";
import { eq, and, gt, inArray } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { getPropertyForGuest } from "@/lib/actions/properties";

/**
 * Generate a unique guest token for a reservation
 */
export async function generateGuestToken(reservationId: number) {
  try {
    // Get reservation to check check-out date
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });

    if (!reservation) {
      return { success: false, error: "Reservation not found" };
    }

    // Check if token already exists and is valid
    const existingToken = await db.query.guestTokens.findFirst({
      where: and(
        eq(guestTokens.reservationId, reservationId),
        gt(guestTokens.expiresAt, new Date())
      ),
    });

    if (existingToken) {
      return {
        success: true,
        token: existingToken.token,
        expiresAt: existingToken.expiresAt,
        message: "Token already exists",
      };
    }

    // Generate unique token (32 bytes = 64 hex chars)
    const token = randomBytes(32).toString("hex");

    // Set expiration to check-out date + 1 day (grace period)
    const checkOutDate = new Date(reservation.checkOut);
    const expiresAt = new Date(checkOutDate);
    expiresAt.setDate(expiresAt.getDate() + 1); // Add 1 day grace period

    const [newToken] = await db
      .insert(guestTokens)
      .values({
        token,
        reservationId,
        expiresAt,
      })
      .returning();

    revalidatePath("/dashboard/reservations");
    return {
      success: true,
      token: newToken.token,
      expiresAt: newToken.expiresAt,
    };
  } catch (error) {
    console.error("Error generating guest token:", error);
    return { success: false, error: "Failed to generate token" };
  }
}

/**
 * Validate a guest token and return reservation/property info.
 * Uses raw SQL for reservation lookup and getPropertyForGuest to avoid
 * schema/DB column mismatch (e.g. when migrations 0004-0006 aren't applied).
 */
export async function validateGuestToken(token: string) {
  try {
    const [tokenRecord] = await db
      .select()
      .from(guestTokens)
      .where(eq(guestTokens.token, token))
      .limit(1);

    if (!tokenRecord) {
      return { success: false, error: "Invalid token" };
    }

    // Check expiration
    if (new Date() > tokenRecord.expiresAt) {
      return { success: false, error: "Token expired" };
    }

    // Raw SQL: property_id and dates to avoid schema/DB column mismatch
    const rows = await db.execute(
      sql`SELECT property_id, check_in, check_out FROM reservations WHERE id = ${tokenRecord.reservationId} LIMIT 1`
    );
    const row = Array.isArray(rows) ? rows[0] : (rows as { rows?: unknown[] }).rows?.[0];
    const resRow = row as { property_id?: number; check_in?: string; check_out?: string };
    const propertyId = resRow?.property_id;
    if (!propertyId) {
      return { success: false, error: "Reservation or property not found" };
    }

    const propertyResult = await getPropertyForGuest(propertyId);
    if (!propertyResult.success || !propertyResult.data) {
      return { success: false, error: "Property not found" };
    }

    // Mark token as used (optional, for analytics)
    if (!tokenRecord.usedAt) {
      await db
        .update(guestTokens)
        .set({ usedAt: new Date() })
        .where(eq(guestTokens.id, tokenRecord.id));
    }

    return {
      success: true,
      reservation: {
        id: tokenRecord.reservationId,
        propertyId,
        checkIn: resRow.check_in ?? null,
        checkOut: resRow.check_out ?? null,
      },
      property: propertyResult.data,
    };
  } catch (error) {
    console.error("Error validating guest token:", error);
    return { success: false, error: "Failed to validate token" };
  }
}

/**
 * Get the active (non-expired) token for a reservation
 */
export async function getActiveTokenForReservation(reservationId: number) {
  try {
    const token = await db.query.guestTokens.findFirst({
      where: and(
        eq(guestTokens.reservationId, reservationId),
        gt(guestTokens.expiresAt, new Date())
      ),
    });
    return token ? { success: true, token: token.token, expiresAt: token.expiresAt } : { success: true, token: null, expiresAt: null };
  } catch (error) {
    console.error("Error fetching active token:", error);
    return { success: false, error: "Failed to fetch token", token: null, expiresAt: null };
  }
}

/**
 * Regenerate guest token: revoke existing and create new
 */
export async function regenerateGuestToken(reservationId: number) {
  try {
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, reservationId),
    });
    if (!reservation) {
      return { success: false, error: "Reservation not found" };
    }

    await db
      .update(guestTokens)
      .set({ expiresAt: new Date() })
      .where(eq(guestTokens.reservationId, reservationId));

    return generateGuestToken(reservationId);
  } catch (error) {
    console.error("Error regenerating token:", error);
    return { success: false, error: "Failed to regenerate token" };
  }
}

/**
 * Get which reservations have active tokens (for list views)
 */
export async function getReservationsTokenStatus(reservationIds: number[]) {
  try {
    if (reservationIds.length === 0) return { success: true, status: {} as Record<number, boolean> };
    const rows = await db
      .select({ reservationId: guestTokens.reservationId })
      .from(guestTokens)
      .where(
        and(
          inArray(guestTokens.reservationId, reservationIds),
          gt(guestTokens.expiresAt, new Date())
        )
      );
    const status: Record<number, boolean> = {};
    reservationIds.forEach((id) => (status[id] = false));
    rows.forEach((r) => { if (r.reservationId != null) status[r.reservationId] = true; });
    return { success: true, status };
  } catch (error) {
    console.error("Error fetching token status:", error);
    return { success: false, status: {} as Record<number, boolean> };
  }
}

/**
 * Get all tokens for a reservation
 */
export async function getReservationTokens(reservationId: number) {
  try {
    const tokens = await db
      .select()
      .from(guestTokens)
      .where(eq(guestTokens.reservationId, reservationId))
      .orderBy(guestTokens.createdAt);

    return { success: true, tokens };
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return { success: false, error: "Failed to fetch tokens", tokens: [] };
  }
}

/**
 * Revoke a token (mark as expired immediately)
 */
export async function revokeGuestToken(tokenId: number) {
  try {
    await db
      .update(guestTokens)
      .set({ expiresAt: new Date() })
      .where(eq(guestTokens.id, tokenId));

    revalidatePath("/dashboard/reservations");
    return { success: true };
  } catch (error) {
    console.error("Error revoking token:", error);
    return { success: false, error: "Failed to revoke token" };
  }
}
