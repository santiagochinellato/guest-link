
import { db } from "@/db";
import { properties } from "@/db/schema";

async function main() {
  console.log("Seeding database...");

  try {
    await db.insert(properties).values({
      name: "Departamento Centro Bariloche",
      slug: "san-martin-460",
      address: "San Martín 460",
      city: "San Carlos de Bariloche",
      country: "Argentina",
      latitude: "-41.133472", 
      longitude: "-71.310278",
      checkInTime: "15:00",
      checkOutTime: "11:00",
      status: "active",
      views: 0,
      wifiSsid: "Guest_WiFi",
      wifiPassword: "password123",
      houseRules: "No fumar. No fiestas.",
      coverImageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000"
    });

    console.log("Seed completed!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

main();
