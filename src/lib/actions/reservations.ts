"use server";

import { db } from "@/db";
import { reservations, properties, GUEST_LANGUAGES } from "@/db/schema";
import { desc, asc, eq, like, or, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const UpdateContactSchema = z.object({
  guestEmail: z
    .string()
    .optional()
    .refine((s) => !s || s === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "Email inválido"),
  guestPhone: z.string().optional(),
  guestLanguage: z.enum(GUEST_LANGUAGES).optional(),
});

export interface GetReservationsFilters {
  search?: string;
  status?: string;
  platform?: string;
  propertyId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getReservations(filters?: GetReservationsFilters | string) {
  try {
    // Backward compatibility: if filters is a string, treat it as search
    const search = typeof filters === "string" ? filters : filters?.search;
    const status = typeof filters === "object" ? filters.status : undefined;
    const platform = typeof filters === "object" ? filters.platform : undefined;
    const propertyId = typeof filters === "object" ? filters.propertyId : undefined;
    const dateFrom = typeof filters === "object" ? filters.dateFrom : undefined;
    const dateTo = typeof filters === "object" ? filters.dateTo : undefined;

    const conditions = [];

    // Search filter
    if (search) {
      conditions.push(
        or(
          like(reservations.guestName, `%${search}%`),
          like(reservations.reservationCode, `%${search}%`),
          like(reservations.listingName, `%${search}%`)
        )!
      );
    }

    // Status filter
    if (status) {
      conditions.push(eq(reservations.status, status));
    }

    // Platform filter
    if (platform) {
      conditions.push(eq(reservations.platform, platform));
    }

    // Property filter
    if (propertyId) {
      conditions.push(eq(reservations.propertyId, parseInt(propertyId)));
    }

    // Date filters
    if (dateFrom) {
      conditions.push(gte(reservations.checkIn, dateFrom));
    }
    if (dateTo) {
      conditions.push(lte(reservations.checkOut, dateTo));
    }

    // Función SQL para convertir fecha de texto a fecha real para ordenamiento
    // Maneja formatos: "DD MMM YYYY" (ej: "09 mar 2026") y "YYYY-MM-DD" (ISO)
    // Convierte meses en español a inglés para TO_DATE
    const parseCheckInDate = sql`CASE 
      WHEN ${reservations.checkIn} ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN 
        ${reservations.checkIn}::date
      WHEN ${reservations.checkIn} ~ '^[0-9]{1,2}\\s+[a-z]{3}\\s+[0-9]{4}' THEN
        TO_DATE(
          REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
            REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
              LOWER(${reservations.checkIn}),
              'ene', 'jan'), 'feb', 'feb'), 'mar', 'mar'), 
              'abr', 'apr'), 'may', 'may'), 'jun', 'jun'),
            'jul', 'jul'), 'ago', 'aug'), 'sep', 'sep'), 
            'oct', 'oct'), 'nov', 'nov'), 'dic', 'dec'),
          'DD Mon YYYY'
        )
      ELSE 
        NULL
    END`;

    const query = db
      .select({
        id: reservations.id,
        guestName: reservations.guestName,
        guestEmail: reservations.guestEmail,
        guestPhone: reservations.guestPhone,
        guestLanguage: reservations.guestLanguage,
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
      .orderBy(sql`${parseCheckInDate} ASC NULLS LAST`);

    if (conditions.length > 0) {
      query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const data = await query;
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return { success: false, error: "Failed to fetch reservations" };
  }
}

/**
 * Get reservation counts grouped by property (for main reservations page)
 */
export async function getReservationCountsByProperty() {
  try {
    const allReservations = await db
      .select({
        propertyId: reservations.propertyId,
        propertyName: properties.name,
        propertySlug: properties.slug,
        status: reservations.status,
        checkIn: reservations.checkIn,
        checkOut: reservations.checkOut,
      })
      .from(reservations)
      .leftJoin(properties, eq(reservations.propertyId, properties.id));

    const today = new Date().toISOString().split("T")[0];

    const byProperty = new Map<
      number,
      {
        id: number;
        name: string;
        slug: string;
        total: number;
        active: number;
        upcoming: number;
        checkInsToday: number;
      }
    >();

    for (const r of allReservations) {
      const propId = r.propertyId ?? 0;
      const propName = r.propertyName ?? "Sin propiedad";
      const propSlug = r.propertySlug ?? "";

      if (!byProperty.has(propId)) {
        byProperty.set(propId, {
          id: propId,
          name: propName,
          slug: propSlug,
          total: 0,
          active: 0,
          upcoming: 0,
          checkInsToday: 0,
        });
      }

      const entry = byProperty.get(propId)!;
      entry.total++;

      const isActive =
        r.checkIn <= today &&
        r.checkOut >= today &&
        r.status === "confirmed";
      const isUpcoming = r.checkIn > today && r.status === "confirmed";
      const isCheckInToday = r.checkIn === today && r.status === "confirmed";

      if (isActive) entry.active++;
      if (isUpcoming) entry.upcoming++;
      if (isCheckInToday) entry.checkInsToday++;
    }

    return {
      success: true,
      data: Array.from(byProperty.values()).filter((p) => p.id > 0),
    };
  } catch (error) {
    console.error("Error fetching reservation counts:", error);
    return { success: false, error: "Failed to fetch counts", data: [] };
  }
}

/**
 * Get a single reservation by ID with property info
 */
export async function getReservationById(reservationId: number) {
  try {
    const [res] = await db
      .select({
        id: reservations.id,
        propertyId: reservations.propertyId,
        guestName: reservations.guestName,
        guestEmail: reservations.guestEmail,
        guestPhone: reservations.guestPhone,
        guestLanguage: reservations.guestLanguage,
        reservationCode: reservations.reservationCode,
        checkIn: reservations.checkIn,
        checkOut: reservations.checkOut,
        status: reservations.status,
        totalPrice: reservations.totalPrice,
        currency: reservations.currency,
        platform: reservations.platform,
        listingName: reservations.listingName,
        propertyName: properties.name,
        propertySlug: properties.slug,
        notes: reservations.notes,
        amountPaid: reservations.amountPaid,
      })
      .from(reservations)
      .leftJoin(properties, eq(reservations.propertyId, properties.id))
      .where(eq(reservations.id, reservationId))
      .limit(1);

    return res ? { success: true, data: res } : { success: false, error: "Not found" };
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return { success: false, error: "Failed to fetch reservation" };
  }
}

export async function updateReservationContact(
  reservationId: number,
  data: { guestEmail?: string; guestPhone?: string; guestLanguage?: "es" | "en" | "pt" }
) {
  const parsed = UpdateContactSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  const guestEmail = parsed.data.guestEmail?.trim() || null;
  const guestPhone = parsed.data.guestPhone?.trim() || null;
  const guestLanguage = parsed.data.guestLanguage;

  try {
    await db
      .update(reservations)
      .set({
        guestEmail,
        guestPhone,
        ...(guestLanguage !== undefined && { guestLanguage }),
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, reservationId));

    revalidatePath("/dashboard/reservations");
    revalidatePath("/es/dashboard/reservations");
    revalidatePath("/en/dashboard/reservations");
    revalidatePath(`/es/dashboard/reservations/${reservationId}`);
    revalidatePath(`/en/dashboard/reservations/${reservationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating reservation contact:", error);
    return { success: false, error: "Failed to update contact" };
  }
}

export async function updateReservationNotes(reservationId: number, notes: string | null) {
  try {
    await db
      .update(reservations)
      .set({ notes: notes?.trim() || null, updatedAt: new Date() })
      .where(eq(reservations.id, reservationId));

    revalidatePath(`/es/dashboard/reservations/${reservationId}`);
    revalidatePath(`/en/dashboard/reservations/${reservationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating notes:", error);
    return { success: false, error: "Failed to update notes" };
  }
}

export async function updateReservationAmountPaid(reservationId: number, amountPaid: number | null) {
  try {
    await db
      .update(reservations)
      .set({ amountPaid, updatedAt: new Date() })
      .where(eq(reservations.id, reservationId));

    revalidatePath(`/es/dashboard/reservations/${reservationId}`);
    revalidatePath(`/en/dashboard/reservations/${reservationId}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating amount paid:", error);
    return { success: false, error: "Failed to update amount" };
  }
}
