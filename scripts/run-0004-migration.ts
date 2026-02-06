/**
 * Run 0004_automations migration directly.
 * Use when drizzle-kit migrate fails due to journal/state issues.
 */
import { config } from "dotenv";
config({ path: ".env.local" });
import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing POSTGRES_URL or DATABASE_URL");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", max: 1 });

async function run() {
  const migrationPath = join(process.cwd(), "drizzle", "0004_automations.sql");
  const content = readFileSync(migrationPath, "utf-8");
  const statements = content
    .split(/;[\s\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    if (stmt) {
      console.log("Running:", stmt.slice(0, 60) + "...");
      await sql.unsafe(stmt + ";");
    }
  }
  console.log("Migration 0004 applied successfully.");
  await sql.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
