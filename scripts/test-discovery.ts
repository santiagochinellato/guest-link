#!/usr/bin/env tsx
/**
 * Integration Test Script for Auto-Discovery Services
 * 
 * Usage: npx tsx scripts/test-discovery.ts
 * 
 * This script tests the Google Places and Overpass APIs in isolation
 * to measure response times and verify resilience.
 */

import { findTopRatedPlaces, findNearbyTransit } from "../src/lib/services/google-places";
import { fetchNearbyPlaces } from "../src/lib/actions/overpass";

// Test Coordinates: Bariloche Centro
const TEST_LAT = -41.1335;
const TEST_LNG = -71.3103;

async function main() {
  console.log("🧪 Auto-Discovery Integration Test\n");
  console.log(`📍 Test Location: Bariloche Centro (${TEST_LAT}, ${TEST_LNG})\n`);

  // Check Environment Variables
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    console.warn("⚠️  WARNING: GOOGLE_MAPS_API_KEY not found in environment");
    console.warn("   Google Places tests will fail.\n");
  } else {
    console.log("✅ GOOGLE_MAPS_API_KEY found\n");
  }

  // Test 1: Google Places - Restaurants
  console.log("🔍 Test 1: Google Places - Restaurants");
  console.time("  ⏱️  Response Time");
  try {
    const restaurants = await findTopRatedPlaces(TEST_LAT, TEST_LNG, "restaurants");
    console.timeEnd("  ⏱️  Response Time");
    console.log(`  ✅ Found ${restaurants.length} restaurants`);
    if (restaurants.length > 0) {
      console.log(`  📌 Sample: ${restaurants[0].title} (Rating: ${restaurants[0].rating})`);
    }
  } catch (error) {
    console.timeEnd("  ⏱️  Response Time");
    console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
  }
  console.log("");

  // Test 2: Google Places - Supermarkets
  console.log("🔍 Test 2: Google Places - Supermarkets");
  console.time("  ⏱️  Response Time");
  try {
    const supermarkets = await findTopRatedPlaces(TEST_LAT, TEST_LNG, "supermarket");
    console.timeEnd("  ⏱️  Response Time");
    console.log(`  ✅ Found ${supermarkets.length} supermarkets`);
  } catch (error) {
    console.timeEnd("  ⏱️  Response Time");
    console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
  }
  console.log("");

  // Test 3: Google Transit
  console.log("🔍 Test 3: Google Transit Stations");
  console.time("  ⏱️  Response Time");
  try {
    const transit = await findNearbyTransit(TEST_LAT, TEST_LNG);
    console.timeEnd("  ⏱️  Response Time");
    console.log(`  ✅ Found ${transit.length} transit stations`);
  } catch (error) {
    console.timeEnd("  ⏱️  Response Time");
    console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
  }
  console.log("");

  // Test 4: Overpass - Outdoors (Most Complex Query)
  console.log("🔍 Test 4: Overpass API - Outdoors (5km radius)");
  console.time("  ⏱️  Response Time");
  try {
    const outdoors = await fetchNearbyPlaces(TEST_LAT, TEST_LNG, "outdoors");
    console.timeEnd("  ⏱️  Response Time");
    
    if (outdoors.success && outdoors.data) {
      console.log(`  ✅ Found ${outdoors.data.length} outdoor locations`);
      if (outdoors.data.length > 0) {
        console.log(`  📌 Sample: ${outdoors.data[0].title}`);
      }
    } else {
      console.log(`  ⚠️  No data returned (success: ${outdoors.success})`);
    }
  } catch (error) {
    console.timeEnd("  ⏱️  Response Time");
    console.error(`  ❌ Error:`, error instanceof Error ? error.message : error);
  }
  console.log("");

  // Test 5: Resilience Test - Promise.allSettled Simulation
  console.log("🔍 Test 5: Resilience Test (Promise.allSettled)");
  console.time("  ⏱️  Total Time");
  
  const promises = [
    findTopRatedPlaces(TEST_LAT, TEST_LNG, "restaurants"),
    findTopRatedPlaces(TEST_LAT, TEST_LNG, "supermarket"),
    findNearbyTransit(TEST_LAT, TEST_LNG),
    fetchNearbyPlaces(TEST_LAT, TEST_LNG, "outdoors"),
  ];

  const results = await Promise.allSettled(promises);
  console.timeEnd("  ⏱️  Total Time");

  let successCount = 0;
  let failureCount = 0;
  let totalItems = 0;

  for (const result of results) {
    if (result.status === "fulfilled") {
      successCount++;
      const value = result.value;
      if (Array.isArray(value)) {
        totalItems += value.length;
      } else if (value && "data" in value && Array.isArray(value.data)) {
        totalItems += value.data.length;
      }
    } else {
      failureCount++;
    }
  }

  console.log(`  ✅ Successful: ${successCount}/${promises.length}`);
  console.log(`  ❌ Failed: ${failureCount}/${promises.length}`);
  console.log(`  📊 Total Items: ${totalItems}`);
  
  if (failureCount > 0) {
    console.log(`  ⚠️  Note: ${failureCount} service(s) failed, but partial results were still obtained`);
  }

  console.log("\n✨ Test Complete!\n");
}

main().catch((error) => {
  console.error("💥 Fatal Error:", error);
  process.exit(1);
});
