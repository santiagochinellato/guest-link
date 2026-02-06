/**
 * Aplica la migración guest_language directamente.
 * Usar cuando db:migrate falla por migraciones previas ya aplicadas.
 *
 * Ejecutar: npx tsx scripts/apply-guest-language-migration.ts
 */
import { config } from "dotenv";
import { Pool } from "pg";

config({ path: ".env.local" });

const url =
  process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!url) {
  console.error("Falta DATABASE_URL o POSTGRES_URL en .env.local");
  process.exit(1);
}

async function main() {
  const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
});
  try {
    await pool.query(
      `ALTER TABLE "reservations" ADD COLUMN IF NOT EXISTS "guest_language" text DEFAULT 'es';`
    );
    console.log("✅ Columna guest_language agregada correctamente.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
