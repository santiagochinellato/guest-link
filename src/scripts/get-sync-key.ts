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

  const allProperties = await db.query.properties.findMany();


  if (allProperties.length === 0) {
    console.log("No existen propiedades en la base de datos.");
    return;
  }

  const property = allProperties[0];
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
