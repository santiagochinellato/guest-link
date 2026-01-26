"use server";

import { db } from "@/db";
import { categories, recommendations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateCategoryKeywords(categoryId: number, keywords: string) {
  try {
    await db.update(categories)
      .set({ searchKeywords: keywords.trim() || null })
      .where(eq(categories.id, categoryId));

    revalidatePath("/dashboard/properties");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating category keywords:", error);
    return { success: false, error: "Failed to update keywords" };
  }
}

/**
 * Create a new custom category for a property
 */
export async function createCategory(
  propertyId: number,
  categoryType: string,
  categoryName: string,
  searchKeywords?: string
) {
  try {
    // Check if category already exists for this property
    const existing = await db.query.categories.findFirst({
      where: and(
        eq(categories.propertyId, propertyId),
        eq(categories.type, categoryType)
      )
    });

    if (existing) {
      return { 
        success: false, 
        error: "Esta categoría ya existe para esta propiedad" 
      };
    }

    const [newCategory] = await db
      .insert(categories)
      .values({
        propertyId,
        type: categoryType,
        name: categoryName,
        icon: "tag",
        displayOrder: 99, // Custom categories go at the end
        isSystemCategory: false,
        searchKeywords: searchKeywords || null
      })
      .returning();

    revalidatePath("/dashboard/properties");

    return { success: true, category: newCategory };
  } catch (error) {
    console.error("Failed to create category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

/**
 * Delete a category and all its recommendations
 */
export async function deleteCategory(categoryId: number) {
  try {
    await db.transaction(async (tx) => {
      // First delete all recommendations for this category
      await tx.delete(recommendations).where(eq(recommendations.categoryId, categoryId));
      
      // Then delete the category
      await tx.delete(categories).where(eq(categories.id, categoryId));
    });

    revalidatePath("/dashboard/properties");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
