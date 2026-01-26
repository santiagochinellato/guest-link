"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq } from "drizzle-orm";
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
