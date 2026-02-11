/**
 * Funciones auxiliares para ReservationDetailCard
 */

export function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getNightsCount(checkIn: string, checkOut: string): number {
  try {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  } catch {
    return 0;
  }
}

export function getBookingAdminUrl(reservationCode: string): string {
  return `https://admin.booking.com/hotel/hoteladmin/reservation.html?res_id=${reservationCode}`;
}

export function isActiveNow(checkIn: string, checkOut: string, status: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return (
    status === "confirmed" &&
    checkIn <= today &&
    checkOut >= today
  );
}

