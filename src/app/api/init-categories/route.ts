import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  {
    type: "gastronomy",
    name: "Restaurantes",
    icon: "utensils",
    displayOrder: 1,
    searchKeywords: "restaurantes recomendados, parrilla argentina, comida regional"
  },
  {
    type: "sights",
    name: "Turismo",
    icon: "camera",
    displayOrder: 2,
    searchKeywords: "atracciones turísticas, mirador panorámico, museo, puntos de interés"
  },
  {
    type: "shopping",
    name: "Compras",
    icon: "shopping-bag",
    displayOrder: 3,
    searchKeywords: "tienda de souvenirs, productos regionales, artesanías, centro comercial"
  },
  {
    type: "trails",
    name: "Senderos",
    icon: "mountain",
    displayOrder: 4,
    searchKeywords: "senderos, trekking, caminatas, rutas de montaña"
  },
  {
    type: "kids",
    name: "Kids",
    icon: "baby",
    displayOrder: 5,
    searchKeywords: "actividades para niños, parque infantil, heladería artesanal, juegos"
  },
  {
    type: "bars",
    name: "Bares",
    icon: "beer",
    displayOrder: 6,
    searchKeywords: "cervecería artesanal, bar de tragos, wine bar vinoteca, pub"
  },
  {
    type: "outdoors",
    name: "Outdoors",
    icon: "mountain",
    displayOrder: 7,
    searchKeywords: null
  }
];

export async function POST(request: Request) {
  try {
    const { propertyId } = await request.json();

    console.log(`\n🏗️  Creating default categories for property ${propertyId}...\n`);

    const created = [];
    const skipped = [];

    for (const cat of DEFAULT_CATEGORIES) {
      // Check if category already exists
      const existing = await db.query.categories.findFirst({
        where: and(
          eq(categories.propertyId, propertyId),
          eq(categories.type, cat.type)
        )
      });

      if (existing) {
        console.log(`⏭️  Skipping ${cat.name} (already exists)`);
        skipped.push(cat.name);
        continue;
      }

      // Create category
      await db.insert(categories).values({
        propertyId,
        type: cat.type,
        name: cat.name,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        isSystemCategory: true,
        searchKeywords: cat.searchKeywords
      });

      console.log(`✅ Created ${cat.name}`);
      created.push(cat.name);
    }

    console.log(`\n✨ Done! Created ${created.length} categories, skipped ${skipped.length}.\n`);

    return NextResponse.json({
      success: true,
      created,
      skipped,
      message: `Created ${created.length} categories`
    });
  } catch (error) {
    console.error("💥 Error creating categories:", error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
