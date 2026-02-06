import postgres from "postgres";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";
import crypto from "crypto";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing database connection string");
}

const queryClient = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
  max: 1,
});

const db = drizzle(queryClient);

// Drizzle calcula el hash como: sha256(migrationContent + "\n")
function calculateDrizzleHash(content: string): string {
  return crypto.createHash("sha256").update(content + "\n").digest("hex");
}

async function markMigrationsExecuted() {
  try {
    console.log("🔧 Marcando migraciones como ejecutadas...\n");

    // Leer el journal
    const journalPath = path.join(process.cwd(), "drizzle/meta/_journal.json");
    if (!fs.existsSync(journalPath)) {
      throw new Error("Journal file not found");
    }

    const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
    const entries = journal.entries;

    // Verificar qué migraciones ya están marcadas
    const existingMigrations = await db.execute(sql`
      SELECT hash FROM __drizzle_migrations;
    `);
    const existingHashes = new Set(existingMigrations.map((m: any) => m.hash));

    let markedCount = 0;
    let skippedCount = 0;

    // Procesar cada migración del journal
    for (const entry of entries) {
      const migrationFile = path.join(process.cwd(), `drizzle/${entry.tag}.sql`);
      
      if (!fs.existsSync(migrationFile)) {
        console.log(`⚠️  Archivo no encontrado: ${entry.tag}.sql`);
        continue;
      }

      const content = fs.readFileSync(migrationFile, "utf-8");
      const hash = calculateDrizzleHash(content);

      if (existingHashes.has(hash)) {
        console.log(`⏭️  ${entry.tag} ya está marcada (hash: ${hash.substring(0, 8)}...)`);
        skippedCount++;
        continue;
      }

      // Insertar en la tabla de migraciones
      await db.execute(sql`
        INSERT INTO __drizzle_migrations (hash, created_at)
        VALUES (${hash}, ${entry.when || Date.now()})
      `);

      console.log(`✅ ${entry.tag} marcada como ejecutada (hash: ${hash.substring(0, 8)}...)`);
      markedCount++;
    }

    // Verificar migración 0006 (no está en el journal todavía)
    const migration0006Path = path.join(process.cwd(), "drizzle/0006_reservation_notes_payments.sql");
    if (fs.existsSync(migration0006Path)) {
      const content = fs.readFileSync(migration0006Path, "utf-8");
      const hash = calculateDrizzleHash(content);

      if (!existingHashes.has(hash)) {
        // Verificar si las columnas ya existen
        const columns = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'reservations' 
          AND column_name IN ('notes', 'amount_paid');
        `);

        const hasNotes = columns.some((c: any) => c.column_name === "notes");
        const hasAmountPaid = columns.some((c: any) => c.column_name === "amount_paid");

        if (hasNotes && hasAmountPaid) {
          await db.execute(sql`
            INSERT INTO __drizzle_migrations (hash, created_at)
            VALUES (${hash}, ${Date.now()})
          `);
          console.log(`✅ 0006_reservation_notes_payments marcada como ejecutada (hash: ${hash.substring(0, 8)}...)`);
          markedCount++;
        } else {
          console.log(`⏭️  0006_reservation_notes_payments no aplicada aún (columnas faltantes)`);
        }
      } else {
        console.log(`⏭️  0006_reservation_notes_payments ya está marcada`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Marcadas: ${markedCount}`);
    console.log(`   - Omitidas: ${skippedCount}`);

    // Verificar estado final
    const finalMigrations = await db.execute(sql`
      SELECT COUNT(*) as count FROM __drizzle_migrations;
    `);
    console.log(`\n✅ Total de migraciones registradas: ${finalMigrations[0]?.count || 0}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

markMigrationsExecuted();
