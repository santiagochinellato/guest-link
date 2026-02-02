import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
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
    searchKeywords: null // Usa Overpass API
  }
];

async function createDefaultCategories(propertyId: number) {
  const { db } = await import("@/db");
  const { categories } = await import("@/db/schema");

  console.log(`\n🏗️  Creating default categories for property ${propertyId}...\n`);

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
  }

  console.log(`\n✨ Done! All default categories created.\n`);
}

// Get propertyId from command line
const propertyId = parseInt(process.argv[2]);

if (!propertyId || isNaN(propertyId)) {
  console.error("❌ Error: Please provide a valid property ID");
  console.log("Usage: npx tsx scripts/create-default-categories.ts <propertyId>");
  process.exit(1);
}

createDefaultCategories(propertyId)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error:", err);
    process.exit(1);
  });
