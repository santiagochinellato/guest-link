/**
 * Marca las migraciones 0000–0006 como ya aplicadas en drizzle.__drizzle_migrations
 * para que `npm run db:migrate` solo ejecute 0007_sync_logs (y futuras).
 *
 * Uso: node scripts/seed-migration-history.mjs
 * Requiere: .env.local con POSTGRES_URL_NON_POOLING o POSTGRES_URL o DATABASE_URL
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
config({ path: path.join(root, ".env.local") });
const drizzleDir = path.join(root, "drizzle");
const journalPath = path.join(drizzleDir, "meta", "_journal.json");

if (!fs.existsSync(journalPath)) {
  console.error("No se encontró drizzle/meta/_journal.json");
  process.exit(1);
}

const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));
const entriesToSeed = journal.entries.slice(0, -1); // Todas menos la última (0007)

const migrations = [];
for (const entry of entriesToSeed) {
  const sqlPath = path.join(drizzleDir, `${entry.tag}.sql`);
  if (!fs.existsSync(sqlPath)) {
    console.error("No se encontró:", sqlPath);
    process.exit(1);
  }
  const query = fs.readFileSync(sqlPath, "utf8");
  const hash = crypto.createHash("sha256").update(query).digest("hex");
  migrations.push({ hash, created_at: entry.when });
}

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Falta POSTGRES_URL_NON_POOLING, POSTGRES_URL o DATABASE_URL en el entorno");
  process.exit(1);
}

const { default: postgres } = await import("postgres");
const sql = postgres(connectionString, {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

try {
  await sql.unsafe(`
    CREATE SCHEMA IF NOT EXISTS drizzle;
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `);

  const existing = await sql`
    SELECT 1 FROM drizzle.__drizzle_migrations LIMIT 1
  `;
  if (existing.length > 0) {
    console.log("La tabla de migraciones ya tiene registros. No se insertó nada.");
    console.log("Ejecuta: npm run db:migrate");
    await sql.end();
    process.exit(0);
  }

  for (const m of migrations) {
    await sql`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      VALUES (${m.hash}, ${m.created_at})
    `;
  }

  console.log(`Listo: ${migrations.length} migraciones marcadas como aplicadas.`);
  console.log("Ejecuta: npm run db:migrate");
} catch (e) {
  console.error(e);
  process.exit(1);
} finally {
  await sql.end();
}
