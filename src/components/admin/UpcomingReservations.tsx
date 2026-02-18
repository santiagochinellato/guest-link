"use client";

import { CalendarCheck, CalendarX, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday, isTomorrow, addDays, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { parseGuestInfo } from "@/lib/utils/guest-info";

interface Reservation {
  id: number;
  guestName: string;
  reservationCode: string;
  checkIn: string;
  checkOut: string;
  status: string;
  propertyName: string | null;
}

interface UpcomingReservationsProps {
  reservations: Reservation[];
  lang: string;
}

/** Parsea string a fecha a medianoche local. Acepta ISO (YYYY-MM-DD o con hora) para evitar desfases por timezone. */
function parseDateToLocalMidnight(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  try {
    const parsed = parseISO(trimmed);
    if (!isValid(parsed)) return null;
    const d = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function formatDate(dateStr: string): string {
  const date = parseDateToLocalMidnight(dateStr);
  if (!date) return dateStr;
  if (isToday(date)) return "Hoy";
  if (isTomorrow(date)) return "Mañana";
  return format(date, "d MMM", { locale: es });
}

function formatTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? format(date, "HH:mm") : "";
  } catch {
    return "";
  }
}

function getReservationType(checkIn: string, checkOut: string): "checkin" | "checkout" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = parseDateToLocalMidnight(checkIn);
  const checkOutDate = parseDateToLocalMidnight(checkOut);
  if (!checkInDate || !checkOutDate) return "checkin";

  if (checkInDate.getTime() === today.getTime()) return "checkin";
  if (checkOutDate.getTime() === today.getTime()) return "checkout";

  const daysToCheckIn = Math.floor((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysToCheckOut = Math.floor((checkOutDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysToCheckIn < daysToCheckOut ? "checkin" : "checkout";
}

export function UpcomingReservations({
  reservations,
  lang,
}: UpcomingReservationsProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = addDays(today, 7);

  const upcoming = reservations
    .filter((r) => {
      if (r.status !== "confirmed") return false;
      const checkIn = parseDateToLocalMidnight(r.checkIn);
      const checkOut = parseDateToLocalMidnight(r.checkOut);
      if (!checkIn || !checkOut) return false;
      const todayTime = today.getTime();
      const nextWeekTime = nextWeek.getTime();
      const checkInTime = checkIn.getTime();
      const checkOutTime = checkOut.getTime();
      const isCurrentStay = todayTime >= checkInTime && todayTime <= checkOutTime;
      const checkInInWindow = checkInTime >= todayTime && checkInTime <= nextWeekTime;
      const checkOutInWindow = checkOutTime >= todayTime && checkOutTime <= nextWeekTime;
      return isCurrentStay || checkInInWindow || checkOutInWindow;
    })
    .sort((a, b) => {
      const typeA = getReservationType(a.checkIn, a.checkOut);
      const typeB = getReservationType(b.checkIn, b.checkOut);
      const dateA = parseDateToLocalMidnight(typeA === "checkin" ? a.checkIn : a.checkOut);
      const dateB = parseDateToLocalMidnight(typeB === "checkin" ? b.checkIn : b.checkOut);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Próximas Reservas</CardTitle>
          {upcoming.length > 0 && (
            <Link href={`/${lang}/dashboard/reservations#properties-heading`}>
              <Button variant="ghost" size="sm" className="text-xs">
                Ver reservas
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CalendarCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay reservas próximas</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((reservation) => {
              const type = getReservationType(reservation.checkIn, reservation.checkOut);
              const date = type === "checkin" ? reservation.checkIn : reservation.checkOut;
              const time = formatTime(date);

              return (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Badge
                      variant={type === "checkin" ? "default" : "secondary"}
                      className={cn(
                        type === "checkin"
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-blue-500 hover:bg-blue-600"
                      )}
                    >
                      {type === "checkin" ? (
                        <CalendarCheck className="w-3 h-3 mr-1" />
                      ) : (
                        <CalendarX className="w-3 h-3 mr-1" />
                      )}
                      {type === "checkin" ? "Check-in" : "Check-out"}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {formatDate(date)} {time}
                        </span>
                      </div>
                      {(() => {
                        const { name, guestCountText } = parseGuestInfo(reservation.guestName);
                        return (
                          <>
                            <p className="text-sm font-semibold text-brand-void dark:text-white truncate mt-0.5">
                              {name}
                            </p>
                            {guestCountText && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {guestCountText}
                              </p>
                            )}
                          </>
                        );
                      })()}
                      {reservation.propertyName && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {reservation.propertyName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
