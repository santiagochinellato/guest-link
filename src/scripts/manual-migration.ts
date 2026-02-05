
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

// 0. Load Env Vars FIRST
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf-8");
  envConfig.split("\n").forEach((line) => {
    const [key, ...value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.join("=").trim().replace(/"/g, "");
    }
  });
}

async function main() {
  console.log("Iniciando migración manual...");

  // Dynamic import
  const { db } = await import("../db/index");

  try {
    console.log("Agregando Columna sync_api_key...");
    await db.execute(sql`
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'sync_api_key') THEN
              ALTER TABLE "properties" ADD COLUMN "sync_api_key" TEXT UNIQUE;
          END IF;
      END
      $$;
    `);
    console.log("✅ Columna sync_api_key verificada.");

    console.log("Creando tabla reservations...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "reservations" (
        "id" SERIAL PRIMARY KEY,
        "property_id" INTEGER REFERENCES "properties"("id"),
        "guest_name" TEXT NOT NULL,
        "reservation_code" TEXT NOT NULL,
        "check_in" TEXT NOT NULL,
        "check_out" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "total_price" REAL,
        "currency" TEXT,
        "platform" TEXT NOT NULL,
        "listing_name" TEXT,
        "created_at" TIMESTAMP DEFAULT now(),
        "updated_at" TIMESTAMP DEFAULT now()
      );
    `);
    console.log("✅ Tabla reservations verificada.");

  } catch (error) {
    console.error("❌ Error en migración:");
    console.error(error);
  }

  process.exit(0);
}

main().catch(console.error);
