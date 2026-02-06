"use server";

import { db } from "@/db";
import { guestTokens, reservations } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

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
 * Validate a guest token and return reservation/property info
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

    // Get reservation with property
    const reservation = await db.query.reservations.findFirst({
      where: eq(reservations.id, tokenRecord.reservationId),
      with: {
        property: true,
      },
    });

    if (!reservation || !reservation.property) {
      return { success: false, error: "Reservation or property not found" };
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
      reservation,
      property: reservation.property,
    };
  } catch (error) {
    console.error("Error validating guest token:", error);
    return { success: false, error: "Failed to validate token" };
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
