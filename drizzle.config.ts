import { defineConfig } from "drizzle-kit";

const rawUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
// Remove sslmode=require to let dbCredentials.ssl handle it without conflict
const baseUrl = rawUrl.replace(/[?&]sslmode=require/, "");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: baseUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
