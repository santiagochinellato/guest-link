/**
 * Parsea guestName que viene en formato "Nombre Apellido2 adultos" o
 * "Nombre Apellido1 adulto y 1 niño (6 años)" y separa nombre de la cantidad de huéspedes.
 */
export interface ParsedGuestInfo {
  /** Nombre del huésped sin la cantidad */
  name: string;
  /** Texto de cantidad: "2 adultos", "1 adulto y 1 niño (6 años)", etc. */
  guestCountText: string | null;
}

/**
 * Separa el nombre del huésped de la cantidad de huéspedes.
 * Ejemplos:
 * - "Candela Rodríguez Bottaro2 adultos" → { name: "Candela Rodríguez Bottaro", guestCountText: "2 adultos" }
 * - "Cecilia Paula Montoya1 adulto y 1 niño (6 años)" → { name: "Cecilia Paula Montoya", guestCountText: "1 adulto y 1 niño (6 años)" }
 */
export function parseGuestInfo(guestName: string): ParsedGuestInfo {
  if (!guestName || typeof guestName !== "string") {
    return { name: guestName || "", guestCountText: null };
  }

  const trimmed = guestName.trim();
  // Patrón: nombre + número + "adulto(s)" o "guest(s)" o "niño(s)" etc.
  const match = trimmed.match(
    /^(.+?)(\d+\s*(?:adulto[s]?|guest[s]?|niño[s]?|niña[s]?|persona[s]?).*)$/i
  );

  if (match) {
    return {
      name: match[1].trim(),
      guestCountText: match[2].trim(),
    };
  }

  return { name: trimmed, guestCountText: null };
}
