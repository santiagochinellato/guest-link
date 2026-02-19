"use server";

import { db } from "@/db";
import { reservations, properties, automationLogs } from "@/db/schema";
import { eq, and, gte, lte, or, ilike } from "drizzle-orm";
import type { Reservation } from "@/components/admin/ReservationDetailCard/types";

export interface GetReservationsFilters {
  propertyId?: number;
  from?: string;
  to?: string;
  status?: string;
  platform?: string;
  /** Búsqueda por huésped o código de reserva */
  search?: string;
}

function mapRowToReservation(
  row: {
    id: number;
    propertyId: number | null;
    guestName: string;
    guestEmail: string | null;
    guestPhone: string | null;
    guestLanguage: string | null;
    reservationCode: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalPrice: number | null;
    currency: string | null;
    platform: string;
    listingName: string | null;
    notes: string | null;
    amountPaid: number | null;
    propertyName: string | null;
    propertySlug: string | null;
  }
): Reservation {
  return {
    id: row.id,
    propertyId: row.propertyId,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone,
    guestLanguage: row.guestLanguage,
    reservationCode: row.reservationCode,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    status: row.status,
    totalPrice: row.totalPrice,
    currency: row.currency,
    platform: row.platform,
    listingName: row.listingName,
    propertyName: row.propertyName,
    propertySlug: row.propertySlug,
    notes: row.notes,
    amountPaid: row.amountPaid,
  };
}

export async function getReservations(filters?: GetReservationsFilters) {
  try {
    const conditions = [];
    if (filters?.propertyId != null) {
      conditions.push(eq(reservations.propertyId, filters.propertyId));
    }
    if (filters?.from) {
      conditions.push(gte(reservations.checkIn, filters.from));
    }
    if (filters?.to) {
      conditions.push(lte(reservations.checkOut, filters.to));
    }
    if (filters?.status) {
      conditions.push(eq(reservations.status, filters.status));
    }
    if (filters?.platform) {
      conditions.push(eq(reservations.platform, filters.platform));
    }
    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          ilike(reservations.guestName, term),
          ilike(reservations.reservationCode, term)
        )!
      );
    }

    const rows = await db
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
        notes: reservations.notes,
        amountPaid: reservations.amountPaid,
        propertyName: properties.name,
        propertySlug: properties.slug,
      })
      .from(reservations)
      .leftJoin(properties, eq(reservations.propertyId, properties.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(reservations.checkIn);

    const data = rows.map((r) =>
      mapRowToReservation({
        ...r,
        propertyName: r.propertyName ?? null,
        propertySlug: r.propertySlug ?? null,
      })
    );
    return { success: true as const, data };
  } catch (err) {
    console.error("[getReservations]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function getReservationById(id: number) {
  try {
    const rows = await db
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
        notes: reservations.notes,
        amountPaid: reservations.amountPaid,
        propertyName: properties.name,
        propertySlug: properties.slug,
      })
      .from(reservations)
      .leftJoin(properties, eq(reservations.propertyId, properties.id))
      .where(eq(reservations.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return { success: false as const, error: "Reservation not found" };

    const data = mapRowToReservation({
      ...row,
      propertyName: row.propertyName ?? null,
      propertySlug: row.propertySlug ?? null,
    });
    return { success: true as const, data };
  } catch (err) {
    console.error("[getReservationById]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateReservationContact(
  id: number,
  data: { guestEmail?: string; guestPhone?: string; guestLanguage?: string }
) {
  try {
    await db
      .update(reservations)
      .set({
        ...(data.guestEmail !== undefined && { guestEmail: data.guestEmail || null }),
        ...(data.guestPhone !== undefined && { guestPhone: data.guestPhone || null }),
        ...(data.guestLanguage !== undefined && { guestLanguage: data.guestLanguage || null }),
        updatedAt: new Date(),
      })
      .where(eq(reservations.id, id));
    return { success: true as const };
  } catch (err) {
    console.error("[updateReservationContact]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateReservationNotes(id: number, notes: string) {
  try {
    await db.update(reservations).set({ notes: notes || null, updatedAt: new Date() }).where(eq(reservations.id, id));
    return { success: true as const };
  } catch (err) {
    console.error("[updateReservationNotes]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function updateReservationPayment(id: number, amountPaid: number | null) {
  try {
    await db
      .update(reservations)
      .set({ amountPaid: amountPaid ?? null, updatedAt: new Date() })
      .where(eq(reservations.id, id));
    return { success: true as const };
  } catch (err) {
    console.error("[updateReservationPayment]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export async function deleteReservation(id: number) {
  try {
    await db.delete(automationLogs).where(eq(automationLogs.reservationId, id));
    await db.delete(reservations).where(eq(reservations.id, id));
    return { success: true as const };
  } catch (err) {
    console.error("[deleteReservation]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

export type CreateReservationInput = {
  propertyId: number;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
  totalPrice?: number | null;
  currency?: string | null;
  platform: string;
  listingName?: string | null;
};

export async function createReservation(data: CreateReservationInput) {
  try {
    const [row] = await db
      .insert(reservations)
      .values({
        propertyId: data.propertyId,
        guestName: data.guestName.trim(),
        guestEmail: data.guestEmail?.trim() || null,
        guestPhone: data.guestPhone?.trim() || null,
        reservationCode: data.reservationCode.trim(),
        checkIn: data.checkIn.trim(),
        checkOut: data.checkOut.trim(),
        status: data.status || "confirmed",
        totalPrice: data.totalPrice ?? null,
        currency: data.currency?.trim() || null,
        platform: data.platform || "manual",
        listingName: data.listingName?.trim() || null,
      })
      .returning({ id: reservations.id });
    if (!row) return { success: false as const, error: "No se creó la reserva" };
    return { success: true as const, data: { id: row.id } };
  } catch (err) {
    console.error("[createReservation]", err);
    return { success: false as const, error: (err as Error).message };
  }
}

/** Propiedad mínima para la card de reservas por propiedad */
export type PropertyOverview = {
  id: number;
  name: string;
  slug: string;
  address: string | null;
  coverImageUrl: string | null;
};

export type ReservationOverviewItem = Pick<
  Reservation,
  "id" | "guestName" | "platform" | "checkIn" | "checkOut" | "totalPrice" | "currency"
>;

export type ReservationsOverviewByPropertyItem = {
  property: PropertyOverview;
  currentReservation: ReservationOverviewItem | null;
  nextReservation: ReservationOverviewItem | null;
  nextReservations: ReservationOverviewItem[];
  platforms: ("booking" | "airbnb")[];
};

/** Normaliza un string de fecha a YYYY-MM-DD para comparar/ordenar. Acepta ISO o fecha parseable. */
function toYYYYMMDD(dateStr: string | null | undefined): string | null {
  if (dateStr == null || typeof dateStr !== "string") return null;
  const s = dateStr.trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getReservationsOverviewByProperty(): Promise<
  { success: true; data: ReservationsOverviewByPropertyItem[] } | { success: false; error: string }
> {
  try {
    const props = await db
      .select({
        id: properties.id,
        name: properties.name,
        slug: properties.slug,
        address: properties.address,
        coverImageUrl: properties.coverImageUrl,
      })
      .from(properties)
      .orderBy(properties.name);

    const now = new Date();
    const today =
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const rows = await db
      .select({
        id: reservations.id,
        propertyId: reservations.propertyId,
        guestName: reservations.guestName,
        checkIn: reservations.checkIn,
        checkOut: reservations.checkOut,
        status: reservations.status,
        totalPrice: reservations.totalPrice,
        currency: reservations.currency,
        platform: reservations.platform,
      })
      .from(reservations)
      .where(eq(reservations.status, "confirmed"))
      .orderBy(reservations.checkIn);

    const byProperty = new Map<number, typeof rows>();
    for (const r of rows) {
      const pid = r.propertyId ?? 0;
      if (!byProperty.has(pid)) byProperty.set(pid, []);
      byProperty.get(pid)!.push(r);
    }

    const data: ReservationsOverviewByPropertyItem[] = props.map((prop) => {
      const list = byProperty.get(prop.id) ?? [];
      const platforms = [...new Set(list.map((r) => r.platform.toLowerCase()))].filter(
        (p): p is "booking" | "airbnb" => p === "booking" || p === "airbnb"
      );

      const listWithDate = list
        .map((r) => ({ r, checkInNorm: toYYYYMMDD(r.checkIn), checkOutNorm: toYYYYMMDD(r.checkOut) }))
        .filter((x): x is typeof x & { checkInNorm: string; checkOutNorm: string } => x.checkInNorm != null && x.checkOutNorm != null);

      const sortedByCheckIn = [...listWithDate].sort(
        (a, b) => (a.checkInNorm > b.checkInNorm ? 1 : a.checkInNorm < b.checkInNorm ? -1 : 0)
      );

      const currentReservation =
        sortedByCheckIn.find(({ checkInNorm, checkOutNorm }) => today >= checkInNorm && today <= checkOutNorm) ?? null;
      const future = sortedByCheckIn.filter((x) => x.checkInNorm > today);
      const nextReservation = future[0] ?? null;
      const nextReservations = future.slice(1, 4);

      return {
        property: {
          id: prop.id,
          name: prop.name,
          slug: prop.slug,
          address: prop.address ?? null,
          coverImageUrl: prop.coverImageUrl ?? null,
        },
        currentReservation: currentReservation
          ? {
              id: currentReservation.r.id,
              guestName: currentReservation.r.guestName,
              platform: currentReservation.r.platform,
              checkIn: currentReservation.r.checkIn,
              checkOut: currentReservation.r.checkOut,
              totalPrice: currentReservation.r.totalPrice,
              currency: currentReservation.r.currency,
            }
          : null,
        nextReservation: nextReservation
          ? {
              id: nextReservation.r.id,
              guestName: nextReservation.r.guestName,
              platform: nextReservation.r.platform,
              checkIn: nextReservation.r.checkIn,
              checkOut: nextReservation.r.checkOut,
              totalPrice: nextReservation.r.totalPrice,
              currency: nextReservation.r.currency,
            }
          : null,
        nextReservations: nextReservations.map((x) => ({
          id: x.r.id,
          guestName: x.r.guestName,
          platform: x.r.platform,
          checkIn: x.r.checkIn,
          checkOut: x.r.checkOut,
          totalPrice: x.r.totalPrice,
          currency: x.r.currency,
        })),
        platforms,
      };
    });

    return { success: true, data };
  } catch (err) {
    console.error("[getReservationsOverviewByProperty]", err);
    return { success: false, error: (err as Error).message };
  }
}
