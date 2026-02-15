/**
 * Helpers compartidos para las acciones de propiedades
 */

/**
 * Helper para parsear JSON de forma segura
 * 
 * @param str - String JSON a parsear
 * @param fallback - Valor por defecto si falla el parseo
 * @returns Objeto parseado o fallback
 */
export function safeJsonParse(str: string | null | undefined, fallback = {}) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Construye el objeto houseRules para guardar en la base de datos
 */
export function buildHouseRules(data: {
  houseRules?: string;
  rulesAllowed?: Array<{ value: string }>;
  rulesProhibited?: Array<{ value: string }>;
  accessInstructions?: string;
  hasParking?: boolean;
  parkingDetails?: string;
  accessCode?: string;
  alarmCode?: string;
  accessSteps?: Array<{ text: string }>;
  preCheckInSteps?: Array<{ text: string }>;
  preCheckInNotes?: string;
  hostName?: string;
  hostImage?: string;
  hostPhone?: string;
  showHostInEmergency?: boolean;
}) {
  return JSON.stringify({
    text: data.houseRules || "",
    allowed: data.rulesAllowed?.map(r => r.value) || [],
    prohibited: data.rulesProhibited?.map(r => r.value) || [],
    access: {
      instructions: data.accessInstructions || "",
      hasParking: data.hasParking || false,
      parkingDetails: data.parkingDetails || "",
      accessCode: data.accessCode || "",
      alarmCode: data.alarmCode || "",
      accessSteps: data.accessSteps?.map(s => s.text) || []
    },
    preCheckIn: {
      steps: data.preCheckInSteps?.map(s => s.text) || [],
      notes: data.preCheckInNotes || ""
    },
    host: {
      name: data.hostName || "",
      image: data.hostImage || "",
      phone: data.hostPhone || "",
      showInEmergency: data.showHostInEmergency ?? true
    }
  });
}


