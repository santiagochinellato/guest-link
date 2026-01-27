import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const propertyId = 5;
  console.log(`🎬 Testing populateRecommendations for Property ${propertyId}...`);
  
  const { populateRecommendations } = await import("../src/lib/actions/auto-populate");
  
  try {
      // Test only transit first
      console.log("\n🎯 Testing category: transit");
      const result = await populateRecommendations(propertyId, "transit");
      console.log("Result:", JSON.stringify(result, null, 2));
      
      // Check the DB again
      const { db } = await import("../src/db");
      const { recommendations, categories } = await import("../src/db/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const transitCat = await db.select().from(categories).where(
        and(eq(categories.propertyId, propertyId), eq(categories.type, "transit"))
      ).limit(1);
      
      if (transitCat.length > 0) {
          const recs = await db.select().from(recommendations).where(
            eq(recommendations.categoryId, transitCat[0].id)
          );
          console.log(`📊 Number of transit recommendations after populate: ${recs.length}`);
          recs.forEach((r: any) => console.log(`  - ${r.title} (Source: ${r.externalSource}, ID: ${r.googlePlaceId})`));
      }
      
  } catch (error) {
      console.error("💥 Integration Test Failed:", error);
  }
  
  process.exit(0);
}

main().catch(console.error);
