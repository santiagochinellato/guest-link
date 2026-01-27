import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Supabase/Vercel provee POSTGRES_URL.
// Usamos "rejectUnauthorized: false" porque los certificados self-signed de Supabase lo requieren.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

const globalForDb = globalThis as unknown as { conn: Pool | undefined };

// Siempre usar SSL con rejectUnauthorized: false para Supabase (certificados self-signed)
// El pool solo se crea si no existe ya (singleton pattern para dev)
const pool = globalForDb.conn ?? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Necesario para certificados self-signed de Supabase
  },
  max: process.env.NODE_ENV === "production" ? 20 : 1,
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, { schema });

