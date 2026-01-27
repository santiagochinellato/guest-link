import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL or POSTGRES_URL is missing");
}

const globalForDb = globalThis as unknown as { conn: Pool | undefined };

const pool = globalForDb.conn ?? new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined, // Necessary for some cloud providers like Vercel/Neon
  max: process.env.NODE_ENV === "production" ? 10 : 1, // Limit connections in serverless to prevent exhaustion
});

if (process.env.NODE_ENV !== "production") globalForDb.conn = pool;

export const db = drizzle(pool, { schema });
