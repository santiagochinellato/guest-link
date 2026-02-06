import postgres from "postgres";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as dotenv from "dotenv";
import path from "path";

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

async function checkMigrations() {
  try {
    console.log("🔍 Verificando estado de migraciones...\n");

    // Verificar si existe la tabla de migraciones de Drizzle
    const migrationsTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '__drizzle_migrations'
      );
    `);

    const exists = migrationsTableExists[0]?.exists;

    if (!exists) {
      console.log("❌ La tabla __drizzle_migrations NO existe");
      console.log("   Esto significa que las migraciones no están siendo rastreadas.\n");
      return;
    }

    console.log("✅ La tabla __drizzle_migrations existe\n");

    // Obtener migraciones ejecutadas
    const executedMigrations = await db.execute(sql`
      SELECT id, hash, created_at 
      FROM __drizzle_migrations 
      ORDER BY created_at;
    `);

    console.log(`📋 Migraciones ejecutadas (${executedMigrations.length}):`);
    executedMigrations.forEach((m: any) => {
      console.log(`   - ${m.id} (hash: ${m.hash?.substring(0, 8)}...)`);
    });

    // Verificar si existe la tabla categories
    const categoriesExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);

    console.log(`\n📊 Estado de tablas:`);
    console.log(`   - categories: ${categoriesExists[0]?.exists ? "✅ Existe" : "❌ No existe"}`);

    // Verificar columnas de reservations
    const reservationsColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reservations' 
      AND column_name IN ('notes', 'amount_paid')
      ORDER BY column_name;
    `);

    console.log(`\n📋 Columnas en reservations:`);
    const columnNames = reservationsColumns.map((c: any) => c.column_name);
    console.log(`   - notes: ${columnNames.includes("notes") ? "✅ Existe" : "❌ Falta"}`);
    console.log(`   - amount_paid: ${columnNames.includes("amount_paid") ? "✅ Existe" : "❌ Falta"}`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await queryClient.end();
  }
}

checkMigrations();
