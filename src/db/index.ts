import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// En desarrollo: si DATABASE_URL apunta a localhost, usarla (más rápido que Supabase remoto).
// En producción o si no hay local: POSTGRES_URL / Supabase.
const localUrl = "postgresql://postgres:postgres@localhost:5434/guestlink";
const preferLocal =
  process.env.NODE_ENV !== "production" &&
  (process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL === localUrl);
const connectionString = preferLocal
  ? process.env.DATABASE_URL || localUrl
  : process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    (process.env.NODE_ENV !== "production" ? localUrl : "");

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL or DATABASE_URL");
}

// Supabase y otros hosts remotos requieren SSL; localhost no
const isLocalDb =
  connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const queryClient = postgres(connectionString, {
  ssl: isLocalDb ? false : "require",
  max: process.env.NODE_ENV === "production" ? 10 : 1,
  prepare: false, // Requerido para connection pooling de Supabase
  idle_timeout: 20,
  connect_timeout: 8,
});

export const db = drizzle(queryClient, { schema });


