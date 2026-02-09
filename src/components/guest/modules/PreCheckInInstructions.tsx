"use client";

import { ListTodo, Clock, MapPin, Info, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

// Función para convertir diferentes formatos de fecha a Date
function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return null;
  }
  
  const cleanDate = dateStr.trim();
  
  // Formato ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanDate)) {
    const dateString = cleanDate.includes("T") ? cleanDate : cleanDate + "T12:00:00";
    const date = new Date(dateString);
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
      const date = new Date(parseInt(year), month, parseInt(day));
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Intentar parseo directo
  const date = new Date(cleanDate);
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
      return "Fecha inválida";
    }
    
    const formatted = d.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    
    if (formatted === "Invalid Date" || formatted.includes("Invalid")) {
      return "Fecha inválida";
    }
    
    return formatted;
  } catch (error) {
    return "Fecha inválida";
  }
}

interface PreCheckInInstructionsProps {
  accessSteps?: { text: string }[];
  preCheckInNotes?: string;
  checkInDate?: string | null;
  checkInTime?: string | null;
  hostPhone?: string | null;
  hostName?: string | null;
  address?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export function PreCheckInInstructions({
  accessSteps,
  preCheckInNotes,
  checkInDate,
  checkInTime,
  hostPhone,
  hostName,
  address,
  latitude,
  longitude,
}: PreCheckInInstructionsProps) {
  const hasSteps = accessSteps && accessSteps.length > 0;
  
  const handleOpenLocation = () => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank",
      );
    } else if (address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
        "_blank",
      );
    }
  };
  
  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">
              Instrucciones de Acceso
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tu check-in: {checkInDate ? formatReservationDate(checkInDate) : "—"} a las {checkInTime || "15:00"}
            </p>
          </div>
        </div>
        
        {/* Info Message */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-start gap-3">
            {/* <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" /> */}
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Las instrucciones de acceso y códigos estarán disponibles <strong>12 horas antes</strong> de tu check-in.
            </p>
          </div>
        </div>
        
  
        
        {/* Access Steps Timeline */}
        {hasSteps && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-zinc-500" />
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Pasos de Acceso
              </h4>
            </div>
            
            <div className="relative pl-4">
              {/* Línea conectora */}
              {accessSteps.length > 0 && (
                <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-zinc-200 via-zinc-200 to-transparent dark:from-zinc-800 dark:via-zinc-800" />
              )}
              
              <div className="space-y-4">
                {accessSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    {/* Círculo numérico */}
                    <div className="relative z-10 flex-shrink-0 mt-1">
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-500 shadow-sm">
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Texto del paso */}
                    <div className="flex-1 pt-0.5">
                      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {!hasSteps && (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <p className="text-sm">
              Las instrucciones detalladas estarán disponibles próximamente.
            </p>
          </div>
        )}

 <div className="flex flex-col gap-4">
           {/* Contacto del Propietario */}
           {hostPhone && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-3 pl-2">
              <Phone className="w-4 h-4 text-zinc-500" />
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
               Datos de Contacto
              </h4>
            </div>
            <a
              href={`tel:${hostPhone}`}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-copper/10 flex items-center justify-center text-brand-copper group-hover:bg-brand-copper/20 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {hostName || "Propietario"}
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {hostPhone}
                </p>
              </div>
            </a>
          </div>
        )}

        {/* Ubicación de la Propiedad */}
        {(address || (latitude && longitude)) && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {/* <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Ubicación
              </h4>
            </div> */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-[0.98] group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mb-0.5">
                  Dirección de la propiedad
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {address || "Ver en mapa"}
                </p>
              </div>
            </a>
          </div>
        )}
 </div>
       {/* Pre Check-in Notes */}
       {preCheckInNotes && (
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {preCheckInNotes}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

