import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Supabase/Vercel provee POSTGRES_URL.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

const globalForDb = globalThis as unknown as { conn: Pool | undefined };

// SSL con rejectUnauthorized: false para certificados self-signed de Supabase
// Las opciones del Pool override el sslmode del connection string
const pool = globalForDb.conn ?? new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: process.env.NODE_ENV === "production" ? 20 : 1,
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, { schema });

