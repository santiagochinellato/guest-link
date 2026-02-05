
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm"; // drizzle-orm itself is fine to import statically

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
  console.log("Iniciando prueba de DB...");

  // 1. Dynamic Import of DB (now that env is set)
  const { db } = await import("../db/index");
  const { reservations, properties } = await import("../db/schema");

  // 2. Get first property
  const prop = await db.query.properties.findFirst();
  if (!prop) {
    console.error("❌ No se encontró ninguna propiedad.");
    return;
  }
  console.log(`✅ Propiedad encontrada: ${prop.name} (ID: ${prop.id})`);

  // 3. Try simple insert
  try {
    console.log("Intentando insertar reserva de prueba...");
    const result = await db.insert(reservations).values({
      propertyId: prop.id,
      guestName: "Debug User",
      reservationCode: "DEBUG_" + Date.now(),
      checkIn: "2024-01-01",
      checkOut: "2024-01-05",
      status: "confirmed",
      totalPrice: 100,
      currency: "USD",
      platform: "debug",
      listingName: "Debug Listing"
    }).returning();
    
    console.log("✅ Reserva insertada correctamente:", result[0]);
  } catch (error) {
    console.error("❌ Error al insertar reserva:");
    console.error(error);
  }

  process.exit(0);
}

main().catch(console.error);
