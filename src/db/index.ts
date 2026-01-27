import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase/Vercel provee POSTGRES_URL.
// Para Auth.js, necesitamos la conexión directa (NON_POOLING)
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL or DATABASE_URL");
}

// postgres.js maneja mejor SSL con Supabase que node-postgres
// ssl: 'require' funciona correctamente con certificados de Supabase
const queryClient = postgres(connectionString, {
  ssl: 'require',
  max: process.env.NODE_ENV === "production" ? 10 : 1, // Reducido para evitar MaxClientsInSessionMode
  prepare: false, // Requerido para connection pooling de Supabase
  idle_timeout: 20, // Cerrar conexiones inactivas tras 20s
  connect_timeout: 10, // Timeout de conexión de 10s
});

export const db = drizzle(queryClient, { schema });


