"use client";

import { LogIn, LogOut } from "lucide-react";
import { AccessDetailsDrawer } from "./AccessDetailsDrawer";
import { cn } from "@/lib/utils";

// Función para convertir diferentes formatos de fecha a Date
function parseDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return null;
  }
  
  const cleanDate = dateStr.trim();
  
  // Intentar diferentes formatos
  let date: Date | null = null;
  
  // Formato ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanDate)) {
    const dateString = cleanDate.includes("T") ? cleanDate : cleanDate + "T12:00:00";
    date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Formato: DD MMM YYYY (ej: "09 mar 2026")
  const ddmmyyyyMatch = cleanDate.match(/^(\d{1,2})\s+([a-z]{3})\s+(\d{4})$/i);
  if (ddmmyyyyMatch) {
    const [, day, monthStr, year] = ddmmyyyyMatch;
    const monthMap: Record<string, number> = {
      'ene': 0, 'jan': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'apr': 3,
      'may': 4, 'jun': 5, 'jul': 6, 'ago': 7, 'aug': 7,
      'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11, 'dec': 11
    };
    const month = monthMap[monthStr.toLowerCase()];
    if (month !== undefined) {
      date = new Date(parseInt(year), month, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Intentar parseo directo
  date = new Date(cleanDate);
  if (!isNaN(date.getTime())) return date;
  
  return null;
}

function formatReservationDate(iso: string | null | undefined): string {
  if (!iso || typeof iso !== "string" || iso.trim() === "") {
    return "Fecha inválida";
  }
  
  try {
    const d = parseDate(iso);
    
    if (!d || isNaN(d.getTime())) {
      console.warn("Fecha inválida recibida:", iso);
      return "Fecha inválida";
    }
    
    const formatted = d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    
    // Verificar que el formato no sea "Invalid Date" (por si acaso)
    if (formatted === "Invalid Date" || formatted.includes("Invalid")) {
      console.warn("toLocaleDateString devolvió Invalid Date para:", iso);
      return "Fecha inválida";
    }
    
    return formatted;
  } catch (error) {
    console.error("Error formateando fecha:", iso, error);
    return "Fecha inválida";
  }
}

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

// Función auxiliar para validar si una fecha es válida
function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return false;
  }
  const d = parseDate(dateStr);
  return d !== null && !isNaN(d.getTime());
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
  // Debug: verificar qué valores están llegando
  if (typeof window !== "undefined" && (checkInDate || checkOutDate)) {
    console.log("CheckInAccess - Fechas recibidas:", {
      checkInDate,
      checkOutDate,
      checkInDateType: typeof checkInDate,
      checkOutDateType: typeof checkOutDate,
    });
  }
  
  const hasDates = isValidDateString(checkInDate) && isValidDateString(checkOutDate);
  
  // Debug: verificar si hasDates es true
  if (typeof window !== "undefined" && (checkInDate || checkOutDate)) {
    console.log("CheckInAccess - hasDates:", hasDates, {
      checkInValid: isValidDateString(checkInDate),
      checkOutValid: isValidDateString(checkOutDate),
    });
  }

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

        {/* Helper Badge */}
        {/* <div className="mt-2 mb-2 flex justify-center">
          <span className="text-[14px] font-medium text-brand-copper bg-brand-copper/30 px-4 py-2 rounded-lg">
            Toca para más información
          </span>
        </div> */}
      </button>
    </AccessDetailsDrawer>
  );
}
