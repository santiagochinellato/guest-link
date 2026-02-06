"use server";

import { getReservations } from "./reservations";
import type { GetReservationsFilters } from "./reservations";
import { parseGuestInfo } from "@/lib/utils/guest-info";

/**
 * Export reservations as CSV
 */
export async function exportReservationsCSV(filters?: GetReservationsFilters) {
  const result = await getReservations(filters);

  if (!result.success || !result.data) {
    return { success: false, error: "Failed to fetch reservations" };
  }

  const headers = [
    "Nombre",
    "Cantidad huéspedes",
    "Email",
    "Teléfono",
    "Código Reserva",
    "Check-in",
    "Check-out",
    "Estado",
    "Plataforma",
    "Propiedad",
    "Total",
    "Moneda",
  ];

  const rows = result.data.map((res) => {
    const { name, guestCountText } = parseGuestInfo(res.guestName);
    return [
      name,
      guestCountText || "",
    res.guestEmail || "",
    res.guestPhone || "",
    res.reservationCode,
    res.checkIn,
    res.checkOut,
    res.status,
    res.platform,
    res.propertyName || res.listingName || "",
    res.totalPrice?.toString() || "",
    res.currency || "",
  ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  return { success: true, csv: csvContent };
}

/**
 * Generate PDF content (simplified - returns data for client-side PDF generation)
 */
export async function exportReservationsPDF(filters?: GetReservationsFilters) {
  const result = await getReservations(filters);

  if (!result.success || !result.data) {
    return { success: false, error: "Failed to fetch reservations" };
  }

  // Return data for client-side PDF generation
  return {
    success: true,
    data: result.data,
    generatedAt: new Date().toISOString(),
  };
}
