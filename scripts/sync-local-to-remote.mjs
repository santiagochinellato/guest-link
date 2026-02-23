/**
 * Copia los datos de la base LOCAL al Supabase remoto (nuevo proyecto).
 * - ORIGEN: DATABASE_URL (local, p. ej. Docker)
 * - DESTINO: SUPABASE_TARGET_URL o POSTGRES_URL (Supabase donde quieres subir)
 *
 * Requisitos:
 * 1. En el remoto ya debe estar el esquema (npm run db:push con POSTGRES_URL apuntando al nuevo Supabase).
 * 2. Define SUPABASE_TARGET_URL en .env.local con la connection string del nuevo proyecto.
 * Ejecutar: npm run db:sync-to-supabase
 */

import dotenv from "dotenv";
import postgres from "postgres";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

const LOCAL_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5434/guestlink";
const TARGET_URL =
  process.env.SUPABASE_TARGET_URL ||
  process.env.POSTGRES_URL;

if (!TARGET_URL) {
  console.error("❌ Define SUPABASE_TARGET_URL o POSTGRES_URL en .env.local (URL del nuevo Supabase).");
  process.exit(1);
}

const TABLE_ORDER = [
  "user",
  "account",
  "session",
  "verificationToken",
  "properties",
  "categories",
  "recommendations",
  "emergency_contacts",
  "transport_info",
  "reservations",
  "guest_tokens",
  "automation_logs",
  "bus_stops",
  "bus_lines",
  "bus_route_stops",
];

function quoteTable(name) {
  return name === "user" ? '"user"' : name;
}

async function getTargetColumnInfo(client, tableName) {
  const tableForSchema = tableName === "user" ? "user" : tableName;
  const r = await client.unsafe(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [tableForSchema]
  );
  return r;
}

async function run() {
  console.log("📤 Sincronizando local → Supabase (remoto)\n");
  console.log("  Origen (local):  ", LOCAL_URL.replace(/:[^:@]+@/, ":***@"));
  console.log("  Destino (Supabase):", TARGET_URL.replace(/:[^:@]+@/, ":***@"));
  console.log("");

  const source = postgres(LOCAL_URL, { max: 1, ssl: false, onnotice: () => {} });
  const target = postgres(TARGET_URL, { max: 1, ssl: "require", onnotice: () => {} });

  try {
    for (const table of TABLE_ORDER) {
      const q = quoteTable(table);
      let rows;
      try {
        rows = await source.unsafe(`SELECT * FROM ${q}`);
      } catch (e) {
        console.log(`  ⚠️  ${table}: no existe en origen o error: ${e.message}`);
        continue;
      }
      if (rows.length === 0) {
        console.log(`  ⏭️  ${table}: 0 filas`);
        continue;
      }
      let targetInfo;
      try {
        targetInfo = await getTargetColumnInfo(target, table);
        if (targetInfo.length === 0) {
          console.log(`  ⚠️  ${table}: no existe en destino (ejecuta antes db:push con POSTGRES_URL del nuevo Supabase).`);
          continue;
        }
        await target.unsafe(`TRUNCATE TABLE ${q} CASCADE`);
      } catch (e) {
        console.log(`  ⚠️  ${table}: error en destino: ${e.message}`);
        continue;
      }
      const targetColumns = targetInfo.map((c) => c.column_name);
      const quotedCols = targetColumns.map((c) => (c.toLowerCase() !== c ? `"${c}"` : c)).join(", ");
      const placeholders = targetColumns.map((_, i) => `$${i + 1}`).join(", ");
      const insertSql = `INSERT INTO ${q} (${quotedCols}) VALUES (${placeholders})`;
      const lowerToOriginal = (row) => {
        const out = {};
        for (const k of Object.keys(row)) out[k.toLowerCase()] = k;
        return out;
      };
      let inserted = 0;
      for (const row of rows) {
        const keys = lowerToOriginal(row);
        const vals = targetColumns.map((col) => {
          const key = keys[col.toLowerCase()] ?? keys[col];
          return key !== undefined ? row[key] : null;
        });
        try {
          await target.unsafe(insertSql, vals);
          inserted++;
        } catch (e) {
          console.log(`  ⚠️  ${table}: error al insertar: ${e.message}`);
        }
      }
      console.log(`  ✅ ${table}: ${inserted} filas`);
    }
    console.log("\n✅ Subida completada. El Supabase remoto ya tiene los datos de tu entorno local.");
  } finally {
    await source.end();
    await target.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
