import { db } from "./index";
import { properties, categories, recommendations, emergencyContacts, transportInfo } from "./schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Starting seed...");

  try {
    // 1. Limpiar datos existentes (Delete in reverse dependency order)
    console.log("🧹 Cleaning existing data...");
    await db.delete(recommendations);
    await db.delete(categories);
    await db.delete(emergencyContacts);
    await db.delete(transportInfo);
    await db.delete(properties);

    // 2. Crear Propiedad
    console.log("🏠 Creating Demo Property...");
    const [property] = await db.insert(properties).values({
        name: "Casa del Lago - Demo",
        slug: "casa-del-lago-demo",
        address: "Av. Bustillo Km 5, Bariloche",
        city: "San Carlos de Bariloche",
        country: "Argentina",
        wifiSsid: "CasaDelLago_Guest",
        wifiPassword: "disfrutadellago",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        status: "active",
        coverImageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80",
        houseRules: JSON.stringify({
            text: "Prohibido fumar en el interior. No se permiten fiestas ruidosas. Respetar el horario de silencio a partir de las 22hs.", 
            allowed: ["Mascotas (consultar)", "Fumar en el balcón"], 
            prohibited: ["Fiestas", "Drogas"]
        })
    }).returning();

    // 3. Crear Categorías
    console.log("📂 Creating Categories...");
    const catsData = [
        { name: "Restaurantes", type: "restaurants", icon: "Utensils", displayOrder: 1 },
        { name: "Vida Nocturna", type: "bars", icon: "Martini", displayOrder: 2 },
        { name: "Farmacias", type: "pharmacy", icon: "Pill", displayOrder: 3 },
    ];

    const insertedCats = await db.insert(categories).values(
        catsData.map(c => ({
            ...c,
            propertyId: property.id,
            isSystemCategory: false
        }))
    ).returning();

    const restaurantCat = insertedCats.find(c => c.type === "restaurants");
    const nightlifeCat = insertedCats.find(c => c.type === "bars");
    const pharmacyCat = insertedCats.find(c => c.type === "pharmacy");

    // 4. Crear Recomendaciones
    if (restaurantCat) {
        await db.insert(recommendations).values([
            {
                title: "El Boliche de Alberto",
                description: "La mejor parrilla de Bariloche. Carnes excelentes y porciones abundantes.",
                formattedAddress: "Villegas 347",
                googleMapsLink: "https://maps.google.com/?q=El+Boliche+de+Alberto",
                propertyId: property.id,
                categoryId: restaurantCat.id
            },
            {
                title: "Manush",
                description: "Cervecería artesanal con muy buena comida y ambiente acogedor.",
                formattedAddress: "Elflein 47", 
                googleMapsLink: "https://maps.google.com/?q=Manush",
                propertyId: property.id,
                categoryId: restaurantCat.id
            }
        ]);
    }

    if (nightlifeCat) {
        await db.insert(recommendations).values([
            {
                title: "Cervecería Patagonia",
                description: "Vista increíble al lago y cervezas premium. Ideal para el atardecer.",
                formattedAddress: "Ruta 77, Circuito Chico",
                googleMapsLink: "https://maps.google.com/?q=Cerveceria+Patagonia",
                propertyId: property.id,
                categoryId: nightlifeCat.id
            },
            {
                title: "Ice Bariloche",
                description: "Bar de hielo, una experiencia única en el centro.",
                formattedAddress: "España 476",
                googleMapsLink: "https://maps.google.com/?q=Ice+Bariloche",
                propertyId: property.id,
                categoryId: nightlifeCat.id
            }
        ]);
    }
    
    if (pharmacyCat) {
         await db.insert(recommendations).values([
            {
                title: "Farmacia Del Centro",
                description: "Abierto 24hs. Atención rápida.",
                formattedAddress: "Mitre 123",
                googleMapsLink: "https://maps.google.com/?q=Farmacia+Del+Centro",
                propertyId: property.id,
                categoryId: pharmacyCat.id
            }
        ]);
    }

    // 5. Crear Emergencia
    console.log("🚨 Creating Emergency Contacts...");
    await db.insert(emergencyContacts).values({
        name: "Policía",
        phone: "911",
        type: "police",
        propertyId: property.id
    });

    // 6. Crear Transporte
    console.log("🚕 Creating Transport Info...");
    await db.insert(transportInfo).values({
        name: "Remises Bariloche",
        type: "taxi",
        phone: "+54 294 444 4444",
        description: "Servicio de taxi confiable 24hs. Aceptan pagos con tarjeta.",
        scheduleInfo: "24hs",
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
