import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Script para eliminar categorías duplicadas de "boliches"
 * Mantiene solo la primera y elimina las demás
 */

async function cleanDuplicateBoliches() {
  console.log("\n🧹 Limpiando categorías duplicadas de Boliches...\n");

  // Find all boliches categories for property 1
  const allBoliches = await db.query.categories.findMany({
    where: and(
      eq(categories.propertyId, 1),
      eq(categories.type, "boliches")
    ),
    orderBy: (categories, { asc }) => [asc(categories.id)]
  });

  console.log(`📊 Encontradas ${allBoliches.length} categorías "Boliches"`);

  if (allBoliches.length <= 1) {
    console.log("✅ No hay duplicados para eliminar");
    return;
  }

  // Keep the first one, delete the rest
  const toKeep = allBoliches[0];
  const toDelete = allBoliches.slice(1);

  console.log(`✅ Manteniendo: ID ${toKeep.id} - "${toKeep.name}"`);
  console.log(`🗑️  Eliminando ${toDelete.length} duplicados:`);

  for (const cat of toDelete) {
    console.log(`   - ID ${cat.id} - "${cat.name}"`);
    await db.delete(categories).where(eq(categories.id, cat.id));
  }

  console.log(`\n✨ Limpieza completada! Quedan ${allBoliches.length - toDelete.length} categoría(s)\n`);
}

cleanDuplicateBoliches()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error:", err);
    process.exit(1);
  });
