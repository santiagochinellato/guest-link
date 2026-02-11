"use server";

import { db } from "@/db";
import { properties, recommendations, emergencyContacts, transportInfo, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Elimina una propiedad y todas sus relaciones
 * 
 * @param id - ID de la propiedad a eliminar
 * @returns Resultado de la operación
 */
export async function deleteProperty(id: number) {
  try {
    await db.transaction(async (tx) => {
      // 1. Delete Recommendations first (FK to Category + Property)
      await tx.delete(recommendations).where(eq(recommendations.propertyId, id));

      // 2. Delete Categories (FK to Property)
      await tx.delete(categories).where(eq(categories.propertyId, id));

      // 3. Delete other weak entities
      await tx.delete(emergencyContacts).where(eq(emergencyContacts.propertyId, id));
      await tx.delete(transportInfo).where(eq(transportInfo.propertyId, id));

      // 4. Finally Delete Property
      await tx.delete(properties).where(eq(properties.id, id));
    });

    revalidatePath("/dashboard/properties");
    return { success: true };
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}



