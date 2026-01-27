import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { fetchNearbyTransitStops } from "../src/lib/actions/overpass";

async function main() {
  console.log("🚌 Testing Smart Transit (Overpass)...");
  
  // Bariloche Centro
  const lat = -41.1335;
  const lng = -71.3103;
  
  console.log(`📍 Location: Bariloche Centro (${lat}, ${lng})`);
  
  try {
      console.log("\n🔍 Fetching transit stops...");
      const stops = await fetchNearbyTransitStops(lat, lng);
      
      console.log(`✅ Found ${stops.length} results`);
      
      if (stops.length > 0) {
          stops.forEach((stop: any, i: number) => {
              console.log(`  ${i+1}. ${stop.title}`);
              console.log(`     Description: ${stop.description}`);
              console.log(`     Lat/Lng: ${stop.geometry.lat}, ${stop.geometry.lng}`);
          });
      } else {
          console.log("⚠️  No transit stops found. Check the Overpass query.");
      }
      
  } catch (error) {
      console.error("❌ Transit Test Failed:", error);
  }
}

main().catch(console.error);
