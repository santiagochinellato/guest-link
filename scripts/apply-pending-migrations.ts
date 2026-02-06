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

async function applyPendingMigrations() {
  try {
    console.log("🔧 Aplicando migraciones pendientes...\n");

    // Verificar migración 0006: notes y amount_paid en reservations
    const reservationsColumns = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reservations' 
      AND column_name IN ('notes', 'amount_paid');
    `);

    const hasNotes = reservationsColumns.some((c: any) => c.column_name === "notes");
    const hasAmountPaid = reservationsColumns.some((c: any) => c.column_name === "amount_paid");

    if (hasNotes && hasAmountPaid) {
      console.log("✅ Migración 0006 ya aplicada (notes y amount_paid existen)");
      console.log("   No es necesario ejecutarla de nuevo.\n");
    } else {
      console.log("📝 Aplicando migración 0006 (reservation_notes_payments)...");
      
      const migrationPath = path.join(process.cwd(), "drizzle/0006_reservation_notes_payments.sql");
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, "utf-8");
        
        // Ejecutar la migración
        await db.execute(sql.raw(migrationSQL));
        
        console.log("   ✅ Migración 0006 aplicada exitosamente\n");
      } else {
        console.log("   ❌ Archivo de migración no encontrado\n");
      }
    }

    // Verificar estado final
    const finalCheck = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reservations' 
      AND column_name IN ('notes', 'amount_paid');
    `);

    const finalHasNotes = finalCheck.some((c: any) => c.column_name === "notes");
    const finalHasAmountPaid = finalCheck.some((c: any) => c.column_name === "amount_paid");

    console.log("📊 Estado final:");
    console.log(`   - notes: ${finalHasNotes ? "✅" : "❌"}`);
    console.log(`   - amount_paid: ${finalHasAmountPaid ? "✅" : "❌"}`);

    if (finalHasNotes && finalHasAmountPaid) {
      console.log("\n✅ Todas las migraciones pendientes aplicadas correctamente");
    } else {
      console.log("\n⚠️  Algunas migraciones no se aplicaron correctamente");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

applyPendingMigrations();
