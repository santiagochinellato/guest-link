import { defineConfig } from "drizzle-kit";

// Construir URL con compatibilidad libpq para evitar errores SSL de self-signed certs
const baseUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
const urlWithCompat = baseUrl.includes("uselibpqcompat") 
  ? baseUrl 
  : baseUrl + (baseUrl.includes("?") ? "&" : "?") + "uselibpqcompat=true";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: urlWithCompat,
    ssl: {
      rejectUnauthorized: false, // Permitir certificados self-signed de Supabase
    },
  },
});
