/**
 * Copia los datos de la base de producción (Supabase/Vercel) a la base local (Docker).
 * - ORIGEN: POSTGRES_URL (la que tienes en .env.local, misma que Vercel)
 * - DESTINO: DATABASE_URL o postgresql://postgres:postgres@localhost:5434/guestlink
 *
 * Requisitos: base local con tablas creadas (npm run db:push).
 * Ejecutar: node scripts/sync-production-to-local.mjs
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
const SOURCE_URL =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

if (!SOURCE_URL) {
  console.error("❌ Define POSTGRES_URL en .env.local (URL de Supabase/Vercel).");
  process.exit(1);
}

// Orden por dependencias (FK): primero las que no referencian a otras
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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Obtener columnas del destino con tipo y si acepta NULL
async function getTargetColumnInfo(targetClient, tableName) {
  const tableForSchema = tableName === "user" ? "user" : tableName;
  const r = await targetClient.unsafe(
    `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
    [tableForSchema]
  );
  return r;
}

// Mapear fila del origen a valores para el destino; si hay incompatibilidad (UUID -> integer) usar null o marcar skip
function mapRowToTargetValues(sourceRow, targetInfo) {
  const lowerToOriginal = {};
  for (const k of Object.keys(sourceRow)) {
    lowerToOriginal[k.toLowerCase()] = k;
  }
  const vals = [];
  let skipRow = false;
  for (const col of targetInfo) {
    const name = col.column_name;
    const sourceKey = lowerToOriginal[name.toLowerCase()] ?? lowerToOriginal[name];
    let val = sourceKey !== undefined ? sourceRow[sourceKey] : null;
    const isInt = col.data_type === "integer" || col.data_type === "bigint" || col.data_type === "smallint" || col.data_type === "serial" || col.data_type === "bigserial";
    const isUuidVal = typeof val === "string" && UUID_REGEX.test(val);
    if (isInt && isUuidVal) {
      if (col.is_nullable === "YES") {
        val = null;
      } else {
        skipRow = true;
        break;
      }
    }
    vals.push(val);
  }
  return skipRow ? null : vals;
}

async function run() {
  console.log("📥 Sincronizando producción → local\n");
  console.log("  Origen (Supabase/Vercel):", SOURCE_URL.replace(/:[^:@]+@/, ":***@"));
  console.log("  Destino (local):         ", LOCAL_URL.replace(/:[^:@]+@/, ":***@"));
  console.log("");

  const source = postgres(SOURCE_URL, { max: 1, ssl: "require" });
  const target = postgres(LOCAL_URL, { max: 1, ssl: false, onnotice: false });

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
          console.log(`  ⚠️  ${table}: no existe en destino`);
          continue;
        }
        await target.unsafe(`TRUNCATE TABLE ${q} CASCADE`);
      } catch (e) {
        console.log(`  ⚠️  ${table}: no existe en destino (¿ejecutaste db:push?). ${e.message}`);
        continue;
      }
      const targetColumns = targetInfo.map((c) => c.column_name);
      const quotedCols = targetColumns.map((c) => (c.toLowerCase() !== c ? `"${c}"` : c)).join(", ");
      const placeholders = targetColumns.map((_, i) => `$${i + 1}`).join(", ");
      const insertSql = `INSERT INTO ${q} (${quotedCols}) VALUES (${placeholders})`;
      let inserted = 0;
      let skipped = 0;
      for (const row of rows) {
        const vals = mapRowToTargetValues(row, targetInfo);
        if (vals === null) {
          skipped++;
          continue;
        }
        try {
          await target.unsafe(insertSql, vals);
          inserted++;
        } catch (e) {
          console.log(`  ⚠️  ${table}: error al insertar fila: ${e.message}`);
          skipped++;
        }
      }
      if (skipped > 0) {
        console.log(`  ✅ ${table}: ${inserted} filas (${skipped} omitidas por tipos incompatibles UUID↔integer)`);
      } else {
        console.log(`  ✅ ${table}: ${inserted} filas`);
      }
    }
    console.log("\n✅ Sincronización completada.");
  } finally {
    await source.end();
    await target.end();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
