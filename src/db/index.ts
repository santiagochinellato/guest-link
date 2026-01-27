import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Supabase/Vercel provee POSTGRES_URL.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

// postgres.js maneja mejor SSL con Supabase que node-postgres
// ssl: 'require' funciona correctamente con certificados de Supabase
const queryClient = postgres(connectionString, {
  ssl: 'require',
  max: process.env.NODE_ENV === "production" ? 20 : 1,
  prepare: false, // Requerido para connection pooling de Supabase
});

export const db = drizzle(queryClient, { schema });


