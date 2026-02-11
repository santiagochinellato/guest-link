/**
 * Utilidades centralizadas para el manejo de fechas
 * Soporta múltiples formatos: ISO (YYYY-MM-DD), DD MMM YYYY, etc.
 */

/**
 * Mapa de meses en español/inglés a índice de mes (0-11)
 */
const MONTH_MAP: Record<string, number> = {
  'ene': 0, 'jan': 0,
  'feb': 1,
  'mar': 2,
  'abr': 3, 'apr': 3,
  'may': 4,
  'jun': 5,
  'jul': 6,
  'ago': 7, 'aug': 7,
  'sep': 8,
  'oct': 9,
  'nov': 10,
  'dic': 11, 'dec': 11,
};

/**
 * Convierte diferentes formatos de fecha a Date
 * 
 * Formatos soportados:
 * - ISO: YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss
 * - DD MMM YYYY (ej: "09 mar 2026")
 * - Cualquier formato que Date.parse pueda manejar
 * 
 * @param dateStr - String de fecha en cualquier formato soportado
 * @returns Date object o null si no se puede parsear
 */
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return null;
  }

  const cleanDate = dateStr.trim();
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
    const month = MONTH_MAP[monthStr.toLowerCase()];
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

/**
 * Valida si un string de fecha es válido
 * 
 * @param dateStr - String de fecha a validar
 * @returns true si la fecha es válida, false en caso contrario
 */
export function isValidDateString(dateStr: string | null | undefined): boolean {
  if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") {
    return false;
  }
  const d = parseDate(dateStr);
  return d !== null && !isNaN(d.getTime());
}

/**
 * Formatea una fecha de reserva a formato legible en español
 * 
 * @param iso - String de fecha (ISO o DD MMM YYYY)
 * @returns String formateado (ej: "9 mar 2026") o "Fecha inválida" si no se puede parsear
 */
export function formatReservationDate(iso: string | null | undefined): string {
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

    // Verificar que el formato no sea "Invalid Date"
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

/**
 * Obtiene un saludo basado en la hora del día
 * 
 * @param hour - Hora del día (0-23). Si no se proporciona, usa la hora actual
 * @returns "Buenos días" (5-11), "Buenas tardes" (12-18), "Buenas noches" (19-4)
 */
export function getTimeBasedGreeting(hour?: number): string {
  const currentHour = hour ?? new Date().getHours();

  if (currentHour >= 5 && currentHour < 12) {
    return "Buenos días";
  }
  if (currentHour >= 12 && currentHour < 19) {
    return "Buenas tardes";
  }
  // 19:00 - 5:00
  return "Buenas noches";
}



