
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const propertyId = parseInt(process.argv[2]);
  const category = process.argv[3];
  
  if (!propertyId) {
    console.error("Usage: npx tsx src/scripts/test-populate.ts <propertyId> [category]");
    process.exit(1);
  }

  const { populateRecommendations } = await import("../lib/actions/auto-populate");

  console.log(`🚀 Testing populateRecommendations for property ${propertyId}...`);
  if (category) console.log(`🎯 Filtering by category: ${category}`);

  try {
    const result = await populateRecommendations(propertyId, category);
    console.log("\n✅ Result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("\n❌ Error during population:", error);
  }
  process.exit(0);
}

main().catch(console.error);
