import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { eq } from "drizzle-orm";

async function createMockProperty() {
  const { db } = await import("@/db");
  const { properties, emergencyContacts, transportInfo } = await import("@/db/schema");
  console.log("🏗️ Creating Mock Property 'Mitre Loft'...");

  const mockSlug = "mitre-loft-vip";

  // 1. Clean up existing mock if it exists to ensure freshness
  const existing = await db.query.properties.findFirst({
    where: eq(properties.slug, mockSlug),
  });

  if (existing) {
    console.log("♻️ Deleting existing mock property...");
    await db.delete(properties).where(eq(properties.id, existing.id));
  }

  // 2. Insert Property with Premium Details
  const [newProperty] = await db.insert(properties).values({
    name: "Mitre Loft | Premium City Stay",
    slug: mockSlug,
    address: "Mitre 550, Piso 3, Dpto 4",
    city: "San Carlos de Bariloche",
    country: "Argentina",
    // Coordinates for Mitre 550
    latitude: "-41.1342",
    longitude: "-71.3085",
    
    // Connectivity
    wifiSsid: "MitreLoft_5G",
    wifiPassword: "experienciabariloche",
    wifiQrCode: "WIFI:S:MitreLoft_5G;T:WPA;P:experienciabariloche;;", // Mock QR string

    // House Rules (Premium Code Style)
    houseRules: JSON.stringify({
      text: "Bienvenido a Mitre Loft. Diseñado para parejas y viajeros exigentes.\n\n1. Check-out puntual a las 11:00 AM.\n2. No fumar dentro del loft (usar balcón).\n3. Respetar el descanso de los vecinos después de las 22:00.\n4. Cuidar el mobiliario de diseño.",
      allowed: ["Parejas", "Adultos", "Mascotas pequeñas (con depósito)"],
      prohibited: ["Fiestas", "Fumar en interiores", "Más de 2 huéspedes"]
    }),

    // Check-in/out
    checkInTime: "15:00",
    checkOutTime: "11:00",
    
    status: "active",
    
    // Premium Image (Interior/Loft style)
    coverImageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=2080&auto=format&fit=crop",
  }).returning();

  console.log(`✅ Property Created: ${newProperty.name} (ID: ${newProperty.id})`);

  // 3. Insert Emergency Contacts
  console.log("🚑 Adding Emergency Contacts...");
  await db.insert(emergencyContacts).values([
    {
      propertyId: newProperty.id,
      type: "hospital",
      name: "Hospital Zonal Bariloche",
      phone: "+54 294 442-6100",
      address: "Moreno 601",
      isDefault: true
    },
    {
      propertyId: newProperty.id,
      type: "police",
      name: "Comisaría 2da - Centro Cívico",
      phone: "+54 294 442-2772",
      address: "Centro Cívico",
      isDefault: true
    },
    {
      propertyId: newProperty.id,
      type: "ambulance",
      name: "Emergencias Médicas",
      phone: "107",
      isDefault: true
    },
    {
      propertyId: newProperty.id,
      type: "host",
      name: "Concierge 24/7",
      phone: "+54 9 294 444-4444"
    }
  ]);

  // 4. Insert Transport Info
  console.log("te🚖 Adding Transport Info...");
  await db.insert(transportInfo).values([
    {
      propertyId: newProperty.id,
      type: "taxi",
      name: "Radio Taxi Bariloche",
      phone: "+54 294 442-2111",
      description: "Servicio de taxi 24 horas. Parada en la puerta del edificio.",
      priceInfo: "Bajada de bandera aprox $1500 ARS"
    },
    {
      propertyId: newProperty.id,
      type: "bus",
      name: "Tarjeta SUBE",
      description: "Es necesaria para usar el transporte público. Kiosco de recarga a 50 metros (Mitre y Frey).",
    },
    {
      propertyId: newProperty.id,
      type: "transfer",
      name: "Transfer Aeropuerto",
      phone: "+54 9 294 455-5555",
      description: "Servicio privado de remis/traffic. Reservar con 24hs de antelación.",
      priceInfo: "~$25.000 ARS por tramo"
    }
  ]);

  console.log("\n🎉 Full Mock Setup Complete!");
  console.log("Name:", newProperty.name);
  console.log("Slug:", newProperty.slug);
  console.log(`Link: http://localhost:3000/guest/${newProperty.slug} (Nota: La URL correcta en la app es /stay/${newProperty.slug})`);
}

createMockProperty()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error creating mock property:", err);
    process.exit(1);
  });
