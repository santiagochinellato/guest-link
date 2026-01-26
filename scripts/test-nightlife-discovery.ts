#!/usr/bin/env tsx
/**
 * Smart Discovery 2.0 - Nightlife Test
 * 
 * Usage: npx tsx scripts/test-nightlife-discovery.ts
 * 
 * Tests that the system can find popular nightlife venues like Manush and Blest
 * even when executed during daytime (when they're closed).
 */

import { findTopRatedPlaces } from "../src/lib/services/google-places";

// Test Coordinates: Bariloche Centro
const TEST_LAT = -41.1335;
const TEST_LNG = -71.3103;

async function main() {
  console.log("🌙 Smart Discovery 2.0 - Nightlife Test\n");
  console.log(`📍 Location: Bariloche Centro (${TEST_LAT}, ${TEST_LNG})`);
  console.log(`🕐 Current Time: ${new Date().toLocaleString()}\n`);

  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.error("❌ ERROR: GOOGLE_MAPS_API_KEY not found");
    process.exit(1);
  }

  const nightlifeKeywords = [
    "cervecería artesanal Bariloche",
    "Manush Bariloche",
    "Blest Bariloche",
    "Wesley Bariloche",
    "bar de tragos Bariloche",
    "wine bar Bariloche"
  ];

  console.log("🔍 Testing Nightlife Keywords:\n");

  let totalFound = 0;
  const foundVenues = new Set<string>();

  for (const keyword of nightlifeKeywords) {
    console.log(`\n📌 Searching: "${keyword}"`);
    console.time("  ⏱️  Response Time");
    
    try {
      const results = await findTopRatedPlaces(TEST_LAT, TEST_LNG, keyword);
      console.timeEnd("  ⏱️  Response Time");
      
      if (results.length > 0) {
        console.log(`  ✅ Found ${results.length} places:`);
        results.forEach((place, idx) => {
          console.log(`     ${idx + 1}. ${place.title} (⭐ ${place.rating || "N/A"})`);
          foundVenues.add(place.title.toLowerCase());
          totalFound++;
        });
      } else {
        console.log(`  ⚠️  No results`);
      }
    } catch (error) {
      console.timeEnd("  ⏱️  Response Time");
      console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
    }
  }

  console.log("\n\n📊 SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total venues found: ${totalFound}`);
  console.log(`Unique venues: ${foundVenues.size}`);
  
  // Check for target venues
  const targets = ["manush", "blest", "wesley"];
  const foundTargets = targets.filter(t => 
    Array.from(foundVenues).some(v => v.includes(t))
  );
  
  console.log(`\n🎯 Target Venues Found: ${foundTargets.length}/${targets.length}`);
  foundTargets.forEach(t => console.log(`   ✅ ${t.charAt(0).toUpperCase() + t.slice(1)}`));
  
  const missingTargets = targets.filter(t => !foundTargets.includes(t));
  if (missingTargets.length > 0) {
    console.log(`\n⚠️  Missing:`);
    missingTargets.forEach(t => console.log(`   ❌ ${t.charAt(0).toUpperCase() + t.slice(1)}`));
  }

  console.log("\n✨ Test Complete!\n");
  
  if (foundTargets.length >= 2) {
    console.log("✅ SUCCESS: Smart Discovery 2.0 is working correctly!");
    process.exit(0);
  } else {
    console.log("⚠️  WARNING: Some target venues were not found. Consider refining keywords.");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("💥 Fatal Error:", error);
  process.exit(1);
});
