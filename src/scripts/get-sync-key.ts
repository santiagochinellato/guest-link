import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv'; // Try to use dotenv if available, or manual parse

// Manually load .env.local because tsx doesn't do it automatically for nextjs apps usually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
      const val = values.join('=').trim().replace(/^["'](.*)["']$/, '$1'); // removing quotes
      process.env[key.trim()] = val;
    }
  });
}

// Don't import db statically to avoid init before env vars
// import { db } from "@/db"; 
// import { properties } from "@/db/schema";
// import { eq } from "drizzle-orm";
// import crypto from 'crypto';

import crypto from 'crypto';

async function main() {
  const { db } = await import("@/db");
  const { properties } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  // Usar select explícito para evitar columnas que no existen en la DB
  const allProperties = await db
    .select({
      id: properties.id,
      name: properties.name,
      syncApiKey: properties.syncApiKey,
    })
    .from(properties);

  if (allProperties.length === 0) {
    console.log("No existen propiedades en la base de datos.");
    return;
  }

  // Priorizar San Martín 460 si existe, sino usar la primera
  const property =
    allProperties.find(
      (p) =>
        p.name?.toLowerCase().includes("san martin") ||
        p.name?.toLowerCase().includes("san martín") ||
        p.name?.toLowerCase().includes("460")
    ) ?? allProperties[0];

  console.log(`Propiedad encontrada: ${property.name} (ID: ${property.id})`);

  if (property.syncApiKey) {
    console.log(`\n🔑 TU CLAVE DE SINCRONIZACIÓN ES:\n`);
    console.log(`${property.syncApiKey}`);
  } else {
    console.log("No tiene clave generada. Generando una nueva...");
    const newKey = `sk_${crypto.randomUUID().replace(/-/g, '')}`;
    
    await db.update(properties)
      .set({ syncApiKey: newKey })
      .where(eq(properties.id, property.id));

    console.log(`\n🔑 TU NUEVA CLAVE DE SINCRONIZACIÓN ES:\n`);
    console.log(`${newKey}`);
  }
}

main().catch(console.error).finally(() => process.exit(0));
