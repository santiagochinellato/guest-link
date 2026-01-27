import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🧪 Testing Foursquare Integration...");
  
  if (!process.env.FOURSQUARE_API_KEY) {
      console.error("❌ FOURSQUARE_API_KEY missing in .env.local");
      process.exit(1);
  }

  // Importación dinámica para asegurar que dotenv cargó las variables antes de leerlas en el servicio
  const { searchFoursquarePlaces } = await import("../src/lib/services/foursquare");
  
  const lat = -41.1335;
  const lng = -71.3103;
  
  console.log("📍 Location: Bariloche Centro");
  
  try {
      console.log("\n🔍 Searching for Gastronomy (Parrilla)...");
      const restaurants = await searchFoursquarePlaces(lat, lng, "Restaurant Parrilla Steakhouse");
      console.log(`✅ Found ${restaurants.length} places`);
      restaurants.slice(0, 3).forEach((p: any, i: number) => {
          console.log(`  ${i+1}. ${p.title} - ${p.rating}⭐ (${p.userRatingsTotal} ratings)`);
          console.log(`     Address: ${p.formattedAddress}`);
      });
      
      console.log("\n🔍 Searching for Nightlife (Brewery)...");
      const breweries = await searchFoursquarePlaces(lat, lng, "Cervecería Brewery Bar Pub");
      console.log(`✅ Found ${breweries.length} places`);
      breweries.slice(0, 3).forEach((p: any, i: number) => {
          console.log(`  ${i+1}. ${p.title} - ${p.rating}⭐`);
      });
      
  } catch (error) {
      console.error("❌ Test failed:", error);
  }
}

main().catch(console.error);
