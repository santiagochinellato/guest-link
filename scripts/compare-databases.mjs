/**
 * Compara la base de datos local con la remota (producción).
 * Uso:
 *   LOCAL: DATABASE_URL o por defecto postgresql://postgres:postgres@localhost:5434/guestlink
 *   REMOTA: POSTGRES_URL_REMOTE (o POSTGRES_URL / POSTGRES_URL_NON_POOLING en .env.local)
 *
 * Ejecutar: node scripts/compare-databases.mjs
 */

import dotenv from "dotenv";
import postgres from "postgres";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
dotenv.config({ path: path.join(root, ".env") });
dotenv.config({ path: path.join(root, ".env.local") });

const LOCAL_DEFAULT = "postgresql://postgres:postgres@localhost:5434/guestlink";
const localUrl =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING || LOCAL_DEFAULT;
const remoteUrl =
  process.env.POSTGRES_URL_REMOTE ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;

// Tablas del schema (nombre en PostgreSQL)
const TABLES = [
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

function maskUrl(url) {
  if (!url) return "(no configurada)";
  return url.replace(/:[^:@]*@/, ":***@");
}

async function getCount(client, table) {
  const quoted = table === "user" ? '"user"' : table;
  try {
    const r = await client.unsafe(`SELECT count(*)::int as c FROM ${quoted}`);
    return r[0]?.c ?? null;
  } catch (e) {
    return e.message;
  }
}

async function run() {
  console.log("📊 Comparación: base LOCAL vs REMOTA\n");
  console.log("  LOCAL:  ", maskUrl(localUrl));
  console.log("  REMOTA: ", maskUrl(remoteUrl));
  console.log("");

  if (!remoteUrl) {
    console.log("⚠️  No hay URL remota configurada.");
    console.log("   Para comparar con producción, define en .env.local una de:");
    console.log("   - POSTGRES_URL_REMOTE (recomendado: copia la URL de Vercel/Supabase)");
    console.log("   - POSTGRES_URL (si es la de producción)");
    console.log("");
    console.log("   Solo se mostrarán los datos de la base LOCAL.\n");
  }

  const localClient = postgres(localUrl, { max: 1, ssl: false });
  let remoteClient = null;
  if (remoteUrl) {
    remoteClient = postgres(remoteUrl, { max: 1, ssl: "require" });
  }

  // Comprobar conexión local
  try {
    await localClient.unsafe("SELECT 1");
  } catch (e) {
    console.log("❌ No se pudo conectar a la base LOCAL. ¿Está Docker levantado?");
    console.log("   Ejecuta: docker compose up -d\n");
    console.log("   Error:", e.message);
    await localClient.end();
    process.exit(1);
  }

  const results = [];
  let firstLocalError = null;
  for (const table of TABLES) {
    const localCount = await getCount(localClient, table);
    if (typeof localCount === "string" && !firstLocalError) firstLocalError = localCount;
    let remoteCount = null;
    if (remoteClient) {
      remoteCount = await getCount(remoteClient, table);
    }
    results.push({ table, localCount, remoteCount });
  }

  await localClient.end();
  if (remoteClient) await remoteClient.end();

  // Tabla de resultados
  console.log("  Tabla                  |  LOCAL  | REMOTA  | ¿Igual?");
  console.log("  -----------------------|--------|--------|--------");
  let allEqual = true;
  for (const { table, localCount, remoteCount } of results) {
    const localStr =
      typeof localCount === "number"
        ? String(localCount).padStart(6)
        : localCount && typeof localCount === "string" && localCount.length > 20
          ? " error"
          : String(localCount ?? "—").padStart(6);
    const remoteStr =
      remoteCount === null
        ? "   —"
        : typeof remoteCount === "number"
          ? String(remoteCount).padStart(6)
          : " error";
    const equal =
      remoteCount === null
        ? " (solo local)"
        : typeof localCount === "number" && typeof remoteCount === "number" && localCount === remoteCount
          ? " ✅"
          : " ❌";
    if (remoteCount !== null && (typeof localCount !== "number" || typeof remoteCount !== "number" || localCount !== remoteCount)) {
      allEqual = false;
    }
    console.log(`  ${table.padEnd(22)} | ${localStr} | ${remoteStr} | ${equal}`);
  }

  console.log("");
  if (firstLocalError && results.every((r) => typeof r.localCount !== "number")) {
    console.log("❌ La base LOCAL no tiene las tablas creadas (o la conexión falló).");
    console.log("   Error:", firstLocalError);
    console.log("   Crea el schema con: npm run db:push   o   npm run db:migrate");
    console.log("   Y asegúrate de que Docker esté levantado: docker compose up -d");
  } else if (remoteUrl) {
    if (allEqual) {
      console.log("✅ Las dos bases tienen los mismos conteos por tabla.");
    } else {
      console.log("❌ Hay diferencias en los conteos. La base local NO tiene los mismos datos que la remota.");
    }
  } else {
    console.log("(Define POSTGRES_URL_REMOTE en .env.local para comparar con producción.)");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
