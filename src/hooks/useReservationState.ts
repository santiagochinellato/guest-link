import { useMemo } from "react";

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

export type ReservationState = 
  | "BEFORE_CHECKIN" 
  | "CHECKIN_DAY" 
  | "DURING_STAY" 
  | "AFTER_CHECKOUT" 
  | "NO_RESERVATION";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

interface UseReservationStateProps {
  checkInDate?: string | null;
  checkOutDate?: string | null;
  checkInTime?: string | null;
  /** Override para forzar una hora del día específica (útil para desarrollo/preview) */
  timeOfDayOverride?: TimeOfDay;
  /** Override para forzar un estado específico (útil para desarrollo/preview) */
  stateOverride?: ReservationState;
}

export function useReservationState({
  checkInDate,
  checkOutDate,
  checkInTime,
  timeOfDayOverride,
  stateOverride,
}: UseReservationStateProps) {
  const now = useMemo(() => new Date(), []);
  
  const checkIn = useMemo(() => {
    if (!checkInDate) return null;
    const date = parseDate(checkInDate);
    if (!date) return null;
    
    // Si hay hora de check-in, aplicarla
    if (checkInTime) {
      const [hours, minutes] = checkInTime.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        date.setHours(hours, minutes, 0, 0);
      }
    } else {
      // Default: 15:00
      date.setHours(15, 0, 0, 0);
    }
    
    return date;
  }, [checkInDate, checkInTime]);
  
  const checkOut = useMemo(() => {
    if (!checkOutDate) return null;
    const date = parseDate(checkOutDate);
    if (!date) return null;
    
    // Default: 11:00
    date.setHours(11, 0, 0, 0);
    
    return date;
  }, [checkOutDate]);
  
  const state = useMemo((): ReservationState => {
    // Si hay override, usarlo directamente
    if (stateOverride) {
      return stateOverride;
    }
    
    if (!checkIn || !checkOut) {
      return "NO_RESERVATION";
    }
    
    // Calcular 12 horas antes del check-in
    const twelveHoursBeforeCheckIn = new Date(checkIn);
    twelveHoursBeforeCheckIn.setHours(twelveHoursBeforeCheckIn.getHours() - 12);
    
    if (now < twelveHoursBeforeCheckIn) {
      return "BEFORE_CHECKIN";
    }
    
    if (now >= twelveHoursBeforeCheckIn && now < checkIn) {
      return "CHECKIN_DAY";
    }
    
    if (now >= checkIn && now < checkOut) {
      return "DURING_STAY";
    }
    
    return "AFTER_CHECKOUT";
  }, [now, checkIn, checkOut, stateOverride]);
  
  const shouldShowAccessCodes = useMemo(() => {
    if (!checkIn) return false;
    
    const twelveHoursBeforeCheckIn = new Date(checkIn);
    twelveHoursBeforeCheckIn.setHours(twelveHoursBeforeCheckIn.getHours() - 12);
    
    return now >= twelveHoursBeforeCheckIn;
  }, [now, checkIn]);
  
  const timeOfDay = useMemo((): TimeOfDay => {
    // Si hay override, usarlo directamente
    if (timeOfDayOverride) {
      return timeOfDayOverride;
    }
    
    const hour = now.getHours();
    
    if (hour >= 5 && hour < 12) {
      return "morning";
    }
    if (hour >= 12 && hour < 19) {
      return "afternoon";
    }
    if (hour >= 19 && hour < 24) {
      return "evening";
    }
    // 0:00 - 5:00
    return "night";
  }, [now, timeOfDayOverride]);
  
  return {
    state,
    shouldShowAccessCodes,
    timeOfDay,
    checkIn,
    checkOut,
    now,
  };
}

