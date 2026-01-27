import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Supabase/Vercel provides POSTGRES_URL.
// We use "rejectUnauthorized: false" because Supabase self-signed certs often require it in serverless contexts.
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL or DATABASE_URL");
}

const globalForDb = globalThis as unknown as { conn: Pool | undefined };

const pool = globalForDb.conn ?? new Pool({
  connectionString,
  // Disable SSL for local dev or if env var explicitly says so
  ssl: process.env.POSTGRES_URL?.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
  max: process.env.NODE_ENV === "production" ? 20 : 1,
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, { schema });
