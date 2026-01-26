import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, recommendations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { propertyId, categoryType } = await request.json();

    console.log(`\n🧹 Limpiando duplicados de "${categoryType}" para propiedad ${propertyId}...\n`);

    // Find all categories of this type for this property
    const allCategories = await db.query.categories.findMany({
      where: and(
        eq(categories.propertyId, propertyId),
        eq(categories.type, categoryType)
      ),
      orderBy: (categories, { asc }) => [asc(categories.id)]
    });

    console.log(`📊 Encontradas ${allCategories.length} categorías "${categoryType}"`);

    if (allCategories.length <= 1) {
      return NextResponse.json({
        success: true,
        message: "No hay duplicados para eliminar",
        deleted: 0
      });
    }

    // Keep the first one, delete the rest
    const toKeep = allCategories[0];
    const toDelete = allCategories.slice(1);

    console.log(`✅ Manteniendo: ID ${toKeep.id} - "${toKeep.name}"`);
    console.log(`🗑️  Eliminando ${toDelete.length} duplicados`);

    for (const cat of toDelete) {
      // First delete recommendations for this category
      await db.delete(recommendations).where(eq(recommendations.categoryId, cat.id));
      // Then delete the category
      await db.delete(categories).where(eq(categories.id, cat.id));
      console.log(`   ✓ Eliminado ID ${cat.id}`);
    }

    console.log(`\n✨ Limpieza completada!\n`);

    return NextResponse.json({
      success: true,
      message: `Eliminados ${toDelete.length} duplicados`,
      deleted: toDelete.length,
      kept: toKeep.id
    });
  } catch (error) {
    console.error("💥 Error limpiando duplicados:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
