"use client";

import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "./helpers";
import type { Reservation } from "./types";

interface DatesCardProps {
  reservation: Reservation;
  nights: number;
}

export function DatesCard({ reservation, nights }: DatesCardProps) {
  return (
    <div
      className={cn(
        "xl:col-span-2 rounded-2xl p-6 flex flex-col",
        "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl",
        "border border-white/50 dark:border-slate-800",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl"
      )}
    >
      <div className="flex-1 flex flex-col">
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6 w-fit">
          <Calendar className="w-4 h-4" />
          {nights} {nights === 1 ? "noche" : "noches"}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              Check-in
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatDate(reservation.checkIn)}
            </p>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
              Check-out
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatDate(reservation.checkOut)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
        <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
          ID: #{reservation.reservationCode}
        </p>
      </div>
    </div>
  );
}

