/**
 * Re-exportaciones de todas las acciones de propiedades
 * Mantiene compatibilidad hacia atrás con imports existentes
 * 
 * Nota: Este archivo NO tiene "use server" porque Next.js no permite
 * re-exportar funciones en archivos con "use server". Cada módulo individual
 * (get.ts, create.ts, delete.ts, update.ts) ya tiene su propio "use server".
 */

// Delete
export { deleteProperty } from "./properties/delete";

// Create
export { createProperty } from "./properties/create";

// Update
export { updateProperty } from "./properties/update";
export { updatePropertyQuick } from "./properties/update";

// Get
export { getProperties } from "./properties/get";
export { getProperty } from "./properties/get";
export { getPropertyBySlug } from "./properties/get";
export { getPropertyForGuest } from "./properties/get";

// Note: Helpers (safeJsonParse, buildHouseRules) are not server actions
// and should be imported directly from "./properties/helpers" if needed
