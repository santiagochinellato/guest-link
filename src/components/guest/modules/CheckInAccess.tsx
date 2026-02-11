"use client";

import { LogIn, LogOut } from "lucide-react";
import { AccessDetailsDrawer } from "./AccessDetailsDrawer";
import { cn } from "@/lib/utils";
import { parseDate, formatReservationDate, isValidDateString } from "@/lib/utils/dates";

interface CheckInAccessProps {
  checkInTime?: string | null;
  checkOutTime?: string | null;
  /** Fecha de check-in (ISO string) - solo cuando viene de reserva por token */
  checkInDate?: string | null;
  /** Fecha de check-out (ISO string) - solo cuando viene de reserva por token */
  checkOutDate?: string | null;
  // Access Details Props
  accessCode?: string;
  alarmCode?: string;
  hasParking?: boolean;
  parkingDetails?: string;
  accessSteps?: { text: string }[];
  /** Si es false, no muestra los códigos de acceso */
  showCodes?: boolean;
}


export function CheckInAccess({
  checkInTime,
  checkOutTime,
  checkInDate,
  checkOutDate,
  accessCode,
  alarmCode,
  hasParking,
  parkingDetails,
  accessSteps,
  showCodes = true,
}: CheckInAccessProps) {
  const hasDates = isValidDateString(checkInDate) && isValidDateString(checkOutDate);

  return (
    <AccessDetailsDrawer
      accessCode={accessCode}
      alarmCode={alarmCode}
      hasParking={hasParking}
      parkingDetails={parkingDetails}
      accessSteps={accessSteps}
      showCodes={showCodes}
    >
      <button className="w-full group outline-none">
        <div className="grid grid-cols-2 gap-px bg-zinc-100 dark:bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
          {/* Check In */}
          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 flex flex-col items-center justify-center gap-1 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <LogIn className="w-4 h-4 text-brand-copper" strokeWidth={1.5} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500">
                Ingreso
              </span>
            </div>
            {hasDates ? (
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                  {formatReservationDate(checkInDate!)}
                </p>
                <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
                  {checkInTime || "15:00"}
                </p>
              </div>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                {checkInTime || "15:00"}
              </span>
            )}
          </div>

          {/* Check Out */}
          <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 flex flex-col items-center justify-center gap-1 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800/50 transition-colors">
            <div className="flex items-center gap-2 mb-1 opacity-70">
              <LogOut className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500">
                Salida
              </span>
            </div>
            {hasDates ? (
              <div className="text-center">
                <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                  {formatReservationDate(checkOutDate!)}
                </p>
                <p className="text-xl font-bold text-zinc-700 dark:text-zinc-300">
                  {checkOutTime || "11:00"}
                </p>
              </div>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white font-sans tracking-tight">
                {checkOutTime || "11:00"}
              </span>
            )}
          </div>
        </div>
      </button>
    </AccessDetailsDrawer>
  );
}
