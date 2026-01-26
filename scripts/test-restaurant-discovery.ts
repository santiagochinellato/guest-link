import { populateRecommendations } from "@/lib/actions/auto-populate";

/**
 * Test script para diagnosticar Auto-Discovery de restaurantes
 * 
 * Uso:
 * npx tsx scripts/test-restaurant-discovery.ts
 */

async function testRestaurantDiscovery() {
  console.log("🔍 Testing Restaurant Auto-Discovery...\n");

  // Usar una propiedad existente (ajustar el ID según tu DB)
  const testPropertyId = 1; // Cambiar por un ID válido de tu DB
  const testCategory = "restaurants"; // o "gastronomy" según tu schema

  console.log(`📍 Property ID: ${testPropertyId}`);
  console.log(`🏷️  Category: ${testCategory}\n`);

  try {
    console.log("⏳ Calling populateRecommendations...\n");
    
    const result = await populateRecommendations(testPropertyId, testCategory);

    console.log("\n📊 RESULT:");
    console.log("─".repeat(50));
    console.log(JSON.stringify(result, null, 2));
    console.log("─".repeat(50));

    if (result.success) {
      console.log(`\n✅ SUCCESS: Found ${result.count || 0} recommendations`);
    } else {
      console.log(`\n❌ FAILED: ${result.error}`);
    }

  } catch (error) {
    console.error("\n💥 EXCEPTION:", error);
  }
}

// Run test
testRestaurantDiscovery()
  .then(() => {
    console.log("\n✨ Test completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n💥 Fatal error:", err);
    process.exit(1);
  });
