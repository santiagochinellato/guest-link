"use client";

import { CalendarCheck, CalendarX, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, parseISO, isToday, isTomorrow, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    return format(date, "d MMM", { locale: es });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "HH:mm");
  } catch {
    return "";
  }
}

function getReservationType(checkIn: string, checkOut: string): "checkin" | "checkout" {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = parseISO(checkIn);
  checkInDate.setHours(0, 0, 0, 0);
  const checkOutDate = parseISO(checkOut);
  checkOutDate.setHours(0, 0, 0, 0);

  if (checkInDate.getTime() === today.getTime()) return "checkin";
  if (checkOutDate.getTime() === today.getTime()) return "checkout";
  
  // Si check-in es más cercano, es check-in
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
      try {
        const checkIn = parseISO(r.checkIn);
        const checkOut = parseISO(r.checkOut);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);
        return (
          (checkIn >= today && checkIn <= nextWeek) ||
          (checkOut >= today && checkOut <= nextWeek)
        );
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        const dateA = getReservationType(a.checkIn, a.checkOut) === "checkin"
          ? parseISO(a.checkIn)
          : parseISO(a.checkOut);
        const dateB = getReservationType(b.checkIn, b.checkOut) === "checkin"
          ? parseISO(b.checkIn)
          : parseISO(b.checkOut);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0;
      }
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">Próximas Reservas</CardTitle>
          {upcoming.length > 0 && (
            <Link href={`/${lang}/dashboard/reservations`}>
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas
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
                      <p className="text-sm font-semibold text-brand-void dark:text-white truncate mt-0.5">
                        {reservation.guestName}
                      </p>
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
