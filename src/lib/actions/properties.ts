"use server";

/**
 * Re-exportaciones de todas las acciones de propiedades
 * Mantiene compatibilidad hacia atrás con imports existentes
 */

// Delete
export { deleteProperty } from "./properties/delete";

// Create
export { createProperty } from "./properties/create";

// Update
export { updateProperty } from "./properties/update";

// Get
export {
  getProperties,
  getProperty,
  getPropertyBySlug,
  getPropertyForGuest,
} from "./properties/get";

// Helpers (exportados si se necesitan externamente)
export { safeJsonParse, buildHouseRules } from "./properties/helpers";
