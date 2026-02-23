import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

const LOCAL_DEFAULT = "postgresql://postgres:postgres@localhost:5434/guestlink";
const rawUrl =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL ||
  LOCAL_DEFAULT;
// Remove sslmode=require to let dbCredentials.ssl handle it without conflict
const baseUrl = rawUrl.replace(/[?&]sslmode=require/, "");

const isLocalDefault = baseUrl === LOCAL_DEFAULT || baseUrl.startsWith("postgresql://postgres:postgres@localhost:");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: baseUrl,
    ...(isLocalDefault ? {} : { ssl: { rejectUnauthorized: false } }),
  },
});
