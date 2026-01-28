import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { busLines, busStops, busRouteStops } from "../src/db/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

// Mask password for safety
const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]*@/, ":***@");
console.log(`🔌 Seeding Initialized. Target DB: ${maskedUrl}`);

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding Bariloche Transit Data (All Lines + Pilot Stops)...");
  
  // 1. Clear tables
  await db.execute(sql`TRUNCATE TABLE bus_route_stops, bus_lines, bus_stops RESTART IDENTITY CASCADE`);

  // 2. Insert ALL Bus Lines (From CSV + Manual metadata)
  // CSV Lines: 10, 13, 13-22, 20, 21, 22, 31, 40, 41, 50, 51, 55, 60, 61, 70, 71-81, 72, 80, 81, 82, 84
  const linesToInsert = [
    { num: "10", name: "Terminal - Colonia Suiza", color: "#009B3A", attr: "Colonia Suiza, Cerro López" },
    { num: "13", name: "Centro - Lago Gutierrez", color: "#000000", attr: "Lago Gutierrez, Villa Los Coihues" },
    { num: "20", name: "Terminal - Llao Llao", color: "#E11D23", attr: "Llao Llao, Puerto Pañuelo, Teleférico Otto" },
    { num: "21", name: "Terminal - Covisal / 2 de Agosto", color: "#000000", attr: null },
    { num: "22", name: "Terminal - Peninsula San Pedro", color: "#000000", attr: "Peninsula San Pedro" },
    { num: "50", name: "Centro - Villa Los Coihues", color: "#000000", attr: "Villa Los Coihues, Lago Gutierrez" },
    { num: "51", name: "Centro - Bo. Don Orione", color: "#000000", attr: null },
    { num: "55", name: "Centro - Cerro Catedral", color: "#F58220", attr: "Cerro Catedral (Ski center)" },
    { num: "60", name: "Centro - San Francisco", color: "#000000", attr: null },
    { num: "61", name: "Centro - San Francisco (x Barrio)", color: "#000000", attr: null },
    { num: "70", name: "Centro - Universidad", color: "#000000", attr: "Universidad Nacional del Comahue" },
    { num: "71/81", name: "Terminal - Aduana", color: "#000000", attr: null },
    { num: "72", name: "Centro - Aeropuerto", color: "#005CAB", attr: "Aeropuerto Internacional" },
    { num: "80", name: "Centro - Malvinas", color: "#000000", attr: null },
    { num: "81", name: "Centro - Aldea del Este", color: "#000000", attr: null },
    { num: "82", name: "Centro - Los Boulevares", color: "#000000", attr: null },
    { num: "84", name: "Centro - Nahuel Hue", color: "#000000", attr: null },
  ];

  const insertedLines = await db
    .insert(busLines)
    .values(
      linesToInsert.map((l) => ({
        lineNumber: l.num,
        name: l.name,
        color: l.color,
        mainAttractions: l.attr,
      }))
    )
    .returning();

  console.log(`✅ ${insertedLines.length} Bus Lines inserted`);

  // Helper to get line ID
  const getLineId = (num: string) => insertedLines.find((l) => l.lineNumber === num)?.id;

  // 3. Insert Strategic Stops (Expanded Pilot Set)
  const stops = await db.insert(busStops).values([
    // Centro - Nodos Clave
    { name: "Centro Cívico (Independencia)", latitude: -41.1334, longitude: -71.3103, isHub: true }, // Libertad
    { name: "Moreno y Beschedt", latitude: -41.1345, longitude: -71.3085, isHub: true },       // Salida hacia Oeste
    { name: "Terminal de Ómnibus", latitude: -41.1365, longitude: -71.2760, isHub: true },     // Hub principal
    
    // Centro - Cobertura Fina (Requested by User)
    // Near San Martin 460
    { name: "San Martín 400 (Plaza Belgrano)", latitude: -41.1339, longitude: -71.3150, isHub: false }, // Casi al frente
    { name: "Moreno y Villegas", latitude: -41.1342, longitude: -71.3130, isHub: false },
    { name: "Elflein y Quaglia", latitude: -41.1355, longitude: -71.3120, isHub: false },

    // Av. Bustillo (Corredor Turístico)
    { name: "Km 1.0 (Museo Chocolate)", latitude: -41.1301, longitude: -71.3195, isHub: false },
    { name: "Km 4.0 (Teleférico)", latitude: -41.1255, longitude: -71.3480, isHub: false },
    { name: "Km 5.0 (Pasaje Gutierrez)", latitude: -41.1240, longitude: -71.3580, isHub: false },
    { name: "Km 8.0 (Playa Bonita)", latitude: -41.1210, longitude: -71.3905, isHub: false },
    { name: "Puerto Pañuelo (Llao Llao)", latitude: -41.0556, longitude: -71.5303, isHub: true },

    // Destinos Clave
    { name: "Base Cerro Catedral", latitude: -41.1705, longitude: -71.4377, isHub: true },
    { name: "Aeropuerto Bariloche", latitude: -41.1512, longitude: -71.1578, isHub: true },
    { name: "Colonia Suiza (Centro)", latitude: -41.0955, longitude: -71.5098, isHub: true },
    { name: "Villa Los Coihues", latitude: -41.1680, longitude: -71.4200, isHub: false },
  ]).returning();

  console.log(`✅ ${stops.length} Stops inserted`);
  
  const getStopId = (namePart: string) => stops.find(s => s.name.includes(namePart))?.id;

  // 4. Connect Routes (Pilot Triangulation)
  const routes = [];

  // Line 20
  const id20 = getLineId("20");
  if (id20) {
    routes.push(
        { lineId: id20, stopId: getStopId("Terminal"), order: 1 },
        { lineId: id20, stopId: getStopId("Centro Cívico"), order: 2 },
        { lineId: id20, stopId: getStopId("San Martín 400"), order: 3 }, // New Stop
        { lineId: id20, stopId: getStopId("Km 1.0"), order: 4 },
        { lineId: id20, stopId: getStopId("Km 4.0"), order: 5 },
        { lineId: id20, stopId: getStopId("Km 5.0"), order: 6 },
        { lineId: id20, stopId: getStopId("Km 8.0"), order: 7 },
        { lineId: id20, stopId: getStopId("Puerto Pañuelo"), order: 8 }
    );
  }

  // Line 55
  const id55 = getLineId("55");
  if (id55) {
     routes.push(
        { lineId: id55, stopId: getStopId("Terminal"), order: 1 },
        { lineId: id55, stopId: getStopId("Moreno y Villegas"), order: 2 }, // Link to new stop
        { lineId: id55, stopId: getStopId("Basé Cerro Catedral"), order: 5 }
     );
  }

  // Line 72
  const id72 = getLineId("72");
  if (id72) {
    routes.push(
      { lineId: id72, stopId: getStopId("Centro Cívico"), order: 1 },
      { lineId: id72, stopId: getStopId("San Martín 400"), order: 2 }, // Also stops here
      { lineId: id72, stopId: getStopId("Aeropuerto"), order: 3 }
    );
  }

  // Line 10
  const id10 = getLineId("10");
  if (id10) {
    routes.push(
        { lineId: id10, stopId: getStopId("Terminal"), order: 1 },
        { lineId: id10, stopId: getStopId("Colonia Suiza"), order: 10 }
    );
  }

  const validRoutes = routes.filter(r => r.lineId && r.stopId);
  if (validRoutes.length > 0) {
      await db.insert(busRouteStops).values(validRoutes as any);
  }

  console.log(`✅ ${validRoutes.length} Connections created`);
  console.log("🚀 Seed Finished");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
