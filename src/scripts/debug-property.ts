
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { eq } from "drizzle-orm";

async function main() {
  const propertyId = parseInt(process.argv[2]);
  if (!propertyId) {
    console.error("Usage: npx tsx src/scripts/debug-property.ts <id>");
    process.exit(1);
  }

  const { db } = await import("../db");
  const { properties, categories } = await import("../db/schema");

  console.log(`🔍 Checking Property ID: ${propertyId}...`);
  
  try {
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
      with: {
        categories: true,
        recommendations: true
      }
    });

    if (!property) {
      console.error("❌ Property not found");
      process.exit(1);
    }

    console.log("📊 Property Data:", JSON.stringify({
      id: property.id,
      name: property.name,
      slug: property.slug,
      latitude: property.latitude,
      longitude: property.longitude,
      categoryCount: property.categories?.length || 0,
      categories: property.categories?.map(c => ({ id: c.id, type: c.type, name: c.name })),
      recommendationCount: property.recommendations?.length || 0
    }, null, 2));

  } catch (e) {
    console.error("❌ Error querying property:", e);
  }
  process.exit(0);
}

main().catch(console.error);
