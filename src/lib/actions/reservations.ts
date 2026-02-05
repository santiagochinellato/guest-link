"use server";

import { db } from "@/db";
import { reservations, properties } from "@/db/schema";
import { desc, eq, like, or } from "drizzle-orm";

export async function getReservations(search?: string) {
  try {
    const query = db
      .select({
        id: reservations.id,
        guestName: reservations.guestName,
        reservationCode: reservations.reservationCode,
        checkIn: reservations.checkIn,
        checkOut: reservations.checkOut,
        status: reservations.status,
        totalPrice: reservations.totalPrice,
        currency: reservations.currency,
        platform: reservations.platform,
        listingName: reservations.listingName,
        propertyName: properties.name,
      })
      .from(reservations)
      .leftJoin(properties, eq(reservations.propertyId, properties.id))
      .orderBy(desc(reservations.checkIn));

    if (search) {
      // @ts-expect-error - Drizzle dynamic query logic
      query.where(
        or(
          like(reservations.guestName, `%${search}%`),
          like(reservations.reservationCode, `%${search}%`),
          like(reservations.listingName, `%${search}%`)
        )
      );
    }

    const data = await query;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { success: false, error: "Failed to fetch reservations" };
  }
}
