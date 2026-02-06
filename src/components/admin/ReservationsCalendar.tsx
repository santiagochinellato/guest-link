"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { parseGuestInfo } from "@/lib/utils/guest-info";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { es } from "date-fns/locale";

interface Reservation {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  propertyName: string | null;
}

interface ReservationsCalendarProps {
  reservations: Reservation[];
}

export function ReservationsCalendar({ reservations }: ReservationsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month
  const firstDayOfWeek = monthStart.getDay();
  const daysBeforeMonth = Array.from({ length: firstDayOfWeek }, (_, i) => null);

  const getReservationsForDay = (date: Date) => {
    return reservations.filter((res) => {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);
      return date >= checkIn && date <= checkOut;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="bg-white dark:bg-brand-void border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {/* Empty cells before month start */}
        {daysBeforeMonth.map((_, index) => (
          <div key={`empty-${index}`} className="p-2" />
        ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const dayReservations = getReservationsForDay(day);
          const isCurrentDay = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[80px] p-1 border border-gray-100 dark:border-gray-800 rounded ${
                isCurrentDay ? "bg-brand-copper/10 border-brand-copper" : ""
              }`}
            >
              <div
                className={`text-xs font-medium mb-1 ${
                  isCurrentDay
                    ? "text-brand-copper font-bold"
                    : isSameMonth(day, currentMonth)
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400"
                }`}
              >
                {format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayReservations.slice(0, 2).map((res) => {
                  const { name, guestCountText } = parseGuestInfo(res.guestName);
                  const displayText = guestCountText ? `${name} (${guestCountText})` : name;
                  return (
                    <div
                      key={res.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        res.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : res.status === "cancelled"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      }`}
                      title={`${displayText} - ${res.propertyName || ""}`}
                    >
                      {displayText}
                    </div>
                  );
                })}
                {dayReservations.length > 2 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    +{dayReservations.length - 2} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-100 dark:bg-emerald-900/30 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-amber-100 dark:bg-amber-900/30 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Cancelada</span>
        </div>
      </div>
    </div>
  );
}
