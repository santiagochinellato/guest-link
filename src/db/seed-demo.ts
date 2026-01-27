import "dotenv/config";
import { db } from "./index";
import { properties, categories, recommendations, emergencyContacts, transportInfo } from "./schema";


async function main() {
  console.log("🌱 Starting seed (Supabase Edition)...");

  try {
    // 1. Limpiar datos existentes (Delete in reverse dependency order)
    console.log("🧹 Cleaning existing data...");
    await db.delete(recommendations);
    await db.delete(categories);
    await db.delete(emergencyContacts);
    await db.delete(transportInfo);
    await db.delete(properties);

    // 2. Crear Propiedad
    console.log("🏠 Creating Main Property: Sunset Villa - Demo...");
    const [property] = await db.insert(properties).values({
        name: "Sunset Villa - Demo",
        slug: "sunset-villa-demo",
        address: "Av. Del Sol 450",
        city: "Mendoza",
        country: "Argentina",
        wifiSsid: "SunsetVilla_Guest",
        wifiPassword: "sunsetexperience",
        checkInTime: "14:00",
        checkOutTime: "10:00",
        status: "active",
        coverImageUrl: "https://images.unsplash.com/photo-1613490493576-2f508152fca9?auto=format&fit=crop&q=80",
        houseRules: JSON.stringify({
            text: "Relax and enjoy the view. No loud music after 10 PM. No smoking inside.",
            allowed: ["Pets (small)", "Barbecue"],
            prohibited: ["Smoking inside", "Parties"]
        })
    }).returning();

    // 3. Crear Categorías
    console.log("📂 Creating Categories...");
    const catsData = [
        { name: "Gastronomy", type: "restaurants", icon: "Utensils", displayOrder: 1 },
        { name: "Nightlife", type: "bars", icon: "Martini", displayOrder: 2 },
        { name: "Services", type: "pharmacy", icon: "Briefcase", displayOrder: 3 },
    ];

    const insertedCats = await db.insert(categories).values(
        catsData.map(c => ({
            ...c,
            propertyId: property.id,
            isSystemCategory: false
        }))
    ).returning();

    const gastroCat = insertedCats.find(c => c.type === "restaurants");
    const nightCat = insertedCats.find(c => c.type === "bars");
    const servicesCat = insertedCats.find(c => c.type === "pharmacy");

    // 4. Crear Recomendaciones
    if (gastroCat) {
        await db.insert(recommendations).values([
            {
                title: "La Parrilla de Don Julio",
                description: "World famous steakhouse. Reservation required.",
                formattedAddress: "Guatemala 4699",
                googleMapsLink: "https://maps.google.com/?q=Don+Julio+Parrilla",
                propertyId: property.id,
                categoryId: gastroCat.id
            },
            {
                title: "Azafrán",
                description: "Contemporary Argentine cuisine with a great wine cellar.",
                formattedAddress: "Sarmiento 765",
                googleMapsLink: "https://maps.google.com/?q=Azafran+Resto",
                propertyId: property.id,
                categoryId: gastroCat.id
            },
             {
                title: "Casa Vigil",
                description: "Winery lunch experience. Top rated.",
                formattedAddress: "Videla Aranda 7008",
                googleMapsLink: "https://maps.google.com/?q=Casa+Vigil",
                propertyId: property.id,
                categoryId: gastroCat.id
            }
        ]);
    }

    if (nightCat) {
        await db.insert(recommendations).values([
            {
                title: "Blue Velvet Bar",
                description: "Jazz and cocktails in a speakeasy atmosphere.",
                formattedAddress: "Av. Aristides Villanueva 234",
                googleMapsLink: "https://maps.google.com/?q=Blue+Velvet",
                propertyId: property.id,
                categoryId: nightCat.id
            },
            {
                title: "Gingger",
                description: "Trendy bar with DJ sets.",
                formattedAddress: "Av. Aristides Villanueva 400",
                googleMapsLink: "https://maps.google.com/?q=Gingger+Bar",
                propertyId: property.id,
                categoryId: nightCat.id
            },
             {
                title: "The Beer Club",
                description: "Craft beer heaven.",
                formattedAddress: "Lencinas 45",
                googleMapsLink: "https://maps.google.com/?q=The+Beer+Club",
                propertyId: property.id,
                categoryId: nightCat.id
            }
        ]);
    }

    if (servicesCat) {
         await db.insert(recommendations).values([
            {
                title: "Central Hospital",
                description: "General hospital, 24/7 ER.",
                formattedAddress: "Alem 123",
                googleMapsLink: "https://maps.google.com/?q=Hospital+Central",
                propertyId: property.id,
                categoryId: servicesCat.id
            },
             {
                title: "Police Station #3",
                description: "Nearest police station.",
                formattedAddress: "San Martin 345",
                googleMapsLink: "https://maps.google.com/?q=Comisaria+3",
                propertyId: property.id,
                categoryId: servicesCat.id
            },
            {
                title: "Super Market Vea",
                description: "Grocery store nearby.",
                formattedAddress: "Las Heras 234",
                googleMapsLink: "https://maps.google.com/?q=Super+Vea",
                propertyId: property.id,
                categoryId: servicesCat.id
            }
        ]);
    }

    // 5. Crear Emergencia
    console.log("🚨 Creating Emergency Contacts...");
    await db.insert(emergencyContacts).values({
        name: "Emergency (General)",
        phone: "911",
        type: "police",
        propertyId: property.id
    });

    // 6. Crear Transporte
    console.log("🚕 Creating Transport Info...");
    await db.insert(transportInfo).values({
        name: "Uber / Cabify",
        type: "taxi",
        phone: "App",
        description: "Recommended for getting around the city. Reliable and trackable.",
        scheduleInfo: "24/7",
        propertyId: property.id
    });

    console.log("✅ Seed completed successfully!");
    console.log(`🌍 Demo URL: /en/stay/${property.slug}`);
    process.exit(0);

  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

main();
