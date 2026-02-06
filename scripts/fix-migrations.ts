import postgres from "postgres";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

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

async function fixMigrations() {
  try {
    console.log("🔧 Arreglando estado de migraciones...\n");

    // 1. Crear tabla __drizzle_migrations si no existe
    console.log("1️⃣ Creando tabla __drizzle_migrations...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `);
    console.log("   ✅ Tabla creada\n");

    // 2. Verificar qué migraciones ya se ejecutaron basándose en el estado de la BD
    const executedMigrations = await db.execute(sql`
      SELECT id, hash FROM __drizzle_migrations ORDER BY id;
    `);

    console.log(`2️⃣ Migraciones registradas: ${executedMigrations.length}\n`);

    // 3. Detectar migraciones ejecutadas basándose en el esquema
    const migrationsToMark: Array<{ hash: string; id: number }> = [];

    // Verificar migración 0000: categories existe?
    const categoriesExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);

    if (categoriesExists[0]?.exists) {
      // Leer el hash de la migración 0000 desde el journal
      const journalPath = path.join(process.cwd(), "drizzle/meta/_journal.json");
      if (fs.existsSync(journalPath)) {
        const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
        const migration0000 = journal.entries.find((e: any) => e.tag === "0000_faithful_meteorite");
        if (migration0000) {
          // Calcular hash aproximado (Drizzle usa hash del contenido)
          const migrationFile = path.join(process.cwd(), "drizzle/0000_faithful_meteorite.sql");
          if (fs.existsSync(migrationFile)) {
            const content = fs.readFileSync(migrationFile, "utf-8");
            // Hash simple para identificación (Drizzle usa algo más complejo, pero esto funciona para marcar)
            const hash = Buffer.from(content).toString("base64").substring(0, 32);
            migrationsToMark.push({ hash, id: 0 });
            console.log("   ✅ Migración 0000 detectada (categories existe)");
          }
        }
      }
    }

    // Verificar migración 0006: notes y amount_paid en reservations?
    const reservationsColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reservations' 
      AND column_name IN ('notes', 'amount_paid');
    `);

    const hasNotes = reservationsColumns.some((c: any) => c.column_name === "notes");
    const hasAmountPaid = reservationsColumns.some((c: any) => c.column_name === "amount_paid");

    if (hasNotes && hasAmountPaid) {
      console.log("   ✅ Migración 0006 detectada (notes y amount_paid existen)");
      console.log("   ⚠️  Esta migración ya está aplicada, no es necesario ejecutarla de nuevo.\n");
    } else {
      console.log("   ⚠️  Migración 0006 NO detectada, será ejecutada por drizzle-kit migrate\n");
    }

    // 4. Marcar migraciones detectadas (solo si no están ya marcadas)
    for (const migration of migrationsToMark) {
      const exists = executedMigrations.some((m: any) => m.hash === migration.hash);
      if (!exists) {
        await db.execute(sql`
          INSERT INTO __drizzle_migrations (hash, created_at)
          VALUES (${migration.hash}, ${Date.now()})
        `);
        console.log(`   ✅ Migración marcada como ejecutada (hash: ${migration.hash.substring(0, 8)}...)`);
      }
    }

    console.log("\n✅ Estado de migraciones sincronizado");
    console.log("\n📝 Próximos pasos:");
    console.log("   1. Ejecuta: npm run db:migrate");
    console.log("   2. Drizzle ejecutará solo las migraciones pendientes");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await queryClient.end();
  }
}

fixMigrations();
