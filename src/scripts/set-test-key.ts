
import { eq } from "drizzle-orm";
import { config } from "dotenv";

import fs from "fs";
import path from "path";

// Manual parsing because dotenv/tsx is acting up
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
  console.log("Generando API Key de prueba...");

  // Dynamic import after env vars are loaded
  const { db } = await import("../db/index");
  const { properties } = await import("../db/schema");

  const allProperties = await db.query.properties.findMany({
    limit: 1,
  });

  if (allProperties.length === 0) {
    console.log("No se encontraron propiedades.");
    return;
  }

  const prop = allProperties[0];
  const testKey = "prop_test_KEY_123";

  await db
    .update(properties)
    .set({ syncApiKey: testKey })
    .where(eq(properties.id, prop.id));

  console.log(`\n¡Éxito! Clave generada para la propiedad: ${prop.name}`);
  console.log(`SYNC KEY: ${testKey}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
