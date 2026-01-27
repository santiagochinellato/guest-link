import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const propertyId = 5;
  
  console.log("🧐 Examining Transit category for Property 5...");
  
  const { db } = await import("../src/db");
  const { recommendations, categories } = await import("../src/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const transitCat = await db.select().from(categories).where(
    and(eq(categories.propertyId, propertyId), eq(categories.type, "transit"))
  ).limit(1);

  if (transitCat.length === 0) {
    console.log("❌ No transit category found.");
  } else {
    console.log(`✅ Transit category found (ID: ${transitCat[0].id})`);
    
    const recs = await db.select().from(recommendations).where(
      eq(recommendations.categoryId, transitCat[0].id)
    );
    
    console.log(`📊 Number of transit recommendations: ${recs.length}`);
    recs.forEach((r: any, i: number) => {
      console.log(`  ${i+1}. ${r.title}`);
      console.log(`     Source: ${r.externalSource}, PlaceID: ${r.googlePlaceId}`);
    });
  }
  
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
