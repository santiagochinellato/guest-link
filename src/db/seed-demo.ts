/**
 * SEED USUARIO DEMO — Hostly
 *
 * Crea (o re-crea) un usuario demo con 2 propiedades completamente configuradas,
 * reservas con fechas relativas a hoy y métricas hardcodeadas para mostrar casos de uso.
 *
 * Ejecutar: npm run db:seed
 *
 * Usa la misma DB que la app en dev: carga .env.local (igual que next dev y drizzle.config).
 * Si no existe .env.local, usa .env.
 *
 * CREDENCIALES:
 *   Email:    demo@hostly.app
 *   Password: hostly2024
 *
 * ESCENARIO:
 *   - 2 propiedades ACTIVAS con reservas actuales → "Ocupadas hoy: 2" en el KPI bar
 *   - Prop 1 (Buenos Aires): 8/8 secciones completas, 5 recomendaciones, 312 vistas
 *   - Prop 2 (Córdoba): 5/8 secciones completas (sin emergencias, sin acceso, sin transporte), 189 vistas
 *   - Reservas de Airbnb + Booking en distintos estados (actual, próxima, futuras, pasadas)
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Misma prioridad que Next.js en dev: .env como base, .env.local sobreescribe
const envPath = path.resolve(process.cwd(), ".env");
const envLocalPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath });

// Comprobar env antes de importar db (db/index.ts exige la URL)
if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error("❌ Falta POSTGRES_URL_NON_POOLING, POSTGRES_URL o DATABASE_URL.");
  console.error("   Asegúrate de tener .env o .env.local en la raíz del proyecto (misma que para npm run dev).");
  process.exit(1);
}

import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "./index";
import {
  users,
  properties,
  categories,
  recommendations,
  emergencyContacts,
  transportInfo,
  reservations,
} from "./schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function houseRulesJson(opts: {
  text: string;
  allowed?: string[];
  prohibited?: string[];
  accessInstructions?: string;
  accessCode?: string;
  accessSteps?: string[];
  hasParking?: boolean;
  parkingDetails?: string;
  hostName?: string;
  hostPhone?: string;
}) {
  return JSON.stringify({
    text: opts.text,
    allowed: opts.allowed ?? [],
    prohibited: opts.prohibited ?? [],
    access: {
      instructions: opts.accessInstructions ?? "",
      accessCode: opts.accessCode ?? "",
      alarmCode: "",
      hasParking: opts.hasParking ?? false,
      parkingDetails: opts.parkingDetails ?? "",
      accessSteps: opts.accessSteps ?? [],
    },
    preCheckIn: { steps: [], notes: "" },
    host: {
      name: opts.hostName ?? "",
      image: "",
      phone: opts.hostPhone ?? "",
      showInEmergency: true,
    },
  });
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const DEMO_EMAIL = "demo@hostly.app";
const DEMO_PASSWORD = "hostly2024";

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL!;
  const envUsed = fs.existsSync(envLocalPath) ? ".env.local" : ".env";
  const dbHost = dbUrl.replace(/^[^@]+@/, "").split("/")[0].split("?")[0];
  console.log("🌱 Iniciando seed de usuario demo...");
  console.log(`   Env: ${envUsed} | DB: ${dbHost}\n`);

  // 1. Crear / recuperar usuario demo
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let [demoUser] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL));

  if (!demoUser) {
    // Insert con SQL crudo: en Supabase la columna id puede ser UUID (no serial).
    // Usamos gen_random_uuid() para compatibilidad con ambos (integer o uuid).
    const inserted = await db.execute(sql`
      INSERT INTO "user" (id, name, email, password)
      VALUES (gen_random_uuid(), ${"Demo Hostly"}, ${DEMO_EMAIL}, ${passwordHash})
      RETURNING id, name, email, password, role, created_at
    `);
    const rows = Array.isArray(inserted) ? inserted : (inserted as { rows?: unknown[] }).rows ?? [];
    const row = rows[0] as { id: number | string; name: string | null; email: string; password: string | null; role: string | null; created_at: Date | null } | undefined;
    if (!row) throw new Error("Insert user demo falló");
    demoUser = { id: row.id as number, name: row.name, email: row.email, emailVerified: null, image: null, password: row.password, role: row.role, createdAt: row.created_at };
    console.log(`✅ Usuario demo creado: ${DEMO_EMAIL}`);
  } else {
    await db
      .update(users)
      .set({ password: passwordHash, name: "Demo Hostly" })
      .where(eq(users.id, demoUser.id));
    console.log(`♻️  Usuario demo ya existe (id=${demoUser.id}) — contraseña actualizada, re-creando propiedades...`);
  }

  const ownerId = demoUser.id;

  // 2. Limpiar propiedades existentes del demo (solo las suyas)
  const existingProps = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.ownerId, ownerId));

  for (const p of existingProps) {
    await db.delete(reservations).where(eq(reservations.propertyId, p.id));
    await db.delete(recommendations).where(eq(recommendations.propertyId, p.id));
    await db.delete(categories).where(eq(categories.propertyId, p.id));
    await db.delete(emergencyContacts).where(eq(emergencyContacts.propertyId, p.id));
    await db.delete(transportInfo).where(eq(transportInfo.propertyId, p.id));
  }
  if (existingProps.length > 0) {
    await db.delete(properties).where(eq(properties.ownerId, ownerId));
    console.log(`🧹 ${existingProps.length} propiedad(es) anteriores eliminadas\n`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PROPIEDAD 1 — Casa Loft · Palermo  (Buenos Aires)
  // 8/8 secciones completas — ocupada HOY — 5 recomendaciones — 312 vistas
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🏠 Creando Propiedad 1: Casa Loft · Palermo...");

  const [prop1] = await db
    .insert(properties)
    .values({
      name: "Casa Loft · Palermo",
      slug: "casa-loft-palermo-demo",
      address: "Gurruchaga 1580",
      city: "Buenos Aires",
      country: "Argentina",
      wifiSsid: "LoftPalermo_Guests",
      wifiPassword: "palermo2024",
      checkInTime: "14:00",
      checkOutTime: "11:00",
      status: "active",
      ownerId,
      views: 312,
      coverImageUrl:
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      houseRules: houseRulesJson({
        text: "Por favor mantené el orden y el silencio después de las 22hs. No se permite fumar en el interior. Mascotas consultar antes.",
        allowed: ["Desayuno en terraza", "Home office"],
        prohibited: ["Fiestas o eventos", "Fumar adentro"],
        accessInstructions:
          "La llave se encuentra en la caja de seguridad junto a la puerta principal. El código se envía por mensaje antes del check-in.",
        accessCode: "4521",
        accessSteps: [
          "Ingresá al edificio por la puerta principal de Gurruchaga 1580",
          "Subí al 3er piso por el ascensor",
          "Departamento 3B, lado derecho del pasillo",
          "Abrí la caja con el código recibido y retirá la llave",
        ],
        hostName: "Martina",
        hostPhone: "+54 11 5555-1234",
      }),
    })
    .returning();

  // Categorías prop1
  const insertedCats1 = await db
    .insert(categories)
    .values([
      { name: "Restaurantes", type: "restaurants", icon: "Utensils", displayOrder: 1, propertyId: prop1.id, isSystemCategory: false },
      { name: "Cafeterías",   type: "cafes",       icon: "Coffee",   displayOrder: 2, propertyId: prop1.id, isSystemCategory: false },
      { name: "Bares",        type: "bars",        icon: "Wine",     displayOrder: 3, propertyId: prop1.id, isSystemCategory: false },
    ])
    .returning();

  const [catGastro1, catCafe1, catBares1] = insertedCats1;

  // Recomendaciones prop1 (5 — manual, no auto-sugeridas)
  await db.insert(recommendations).values([
    { title: "El Federal", description: "Bodegón histórico porteño. Empanadas y vino sin pretensiones.", formattedAddress: "Carlos Calvo 599", googleMapsLink: "https://maps.google.com/?q=El+Federal+Buenos+Aires", propertyId: prop1.id, categoryId: catGastro1.id, isAutoSuggested: false, externalSource: "manual" },
    { title: "Proper", description: "Parrilla con vista al jardín. Reserva obligatoria los fines de semana.", formattedAddress: "Thames 1950", googleMapsLink: "https://maps.google.com/?q=Proper+Palermo", propertyId: prop1.id, categoryId: catGastro1.id, isAutoSuggested: false, externalSource: "manual" },
    { title: "Ninina Bakery", description: "El mejor café con leche y medialunas del barrio.", formattedAddress: "Gurruchaga 1722", googleMapsLink: "https://maps.google.com/?q=Ninina+Bakery", propertyId: prop1.id, categoryId: catCafe1.id, isAutoSuggested: false, externalSource: "manual" },
    { title: "LAB Training Café", description: "Café de especialidad para los que trabajan remote.", formattedAddress: "Av. Santa Fe 3101", googleMapsLink: "https://maps.google.com/?q=LAB+Cafe+Palermo", propertyId: prop1.id, categoryId: catCafe1.id, isAutoSuggested: false, externalSource: "manual" },
    { title: "Moshi Moshi", description: "Cócteles creativos y ambiente íntimo. Ideal para el after.", formattedAddress: "Armenia 1677", googleMapsLink: "https://maps.google.com/?q=Moshi+Moshi+Bar", propertyId: prop1.id, categoryId: catBares1.id, isAutoSuggested: false, externalSource: "manual" },
  ]);

  // Emergencias prop1
  await db.insert(emergencyContacts).values([
    { name: "Emergencias (general)", phone: "911", type: "police", propertyId: prop1.id },
    { name: "SAME (ambulancia)", phone: "107", type: "medical", propertyId: prop1.id },
  ]);

  // Transporte prop1
  await db.insert(transportInfo).values([
    { name: "Subte Línea D", type: "subway", description: "Estación Palermo a 3 cuadras. Conexión directa a Microcentro en 20 min.", scheduleInfo: "5hs a 23hs aprox.", propertyId: prop1.id },
    { name: "Uber / Cabify", type: "taxi", description: "Disponibles 24hs desde la app. Pedilo desde afuera del edificio.", scheduleInfo: "24/7", propertyId: prop1.id },
  ]);

  // Reservas prop1
  // ┌─ Pasada: hace 18 días → hace 11 días
  // ├─ ACTUAL: hace 2 días  → en 3 días   ← ocupada HOY
  // ├─ Próxima: en 8 días   → en 13 días
  // ├─ Futura 1: en 19 días → en 24 días
  // └─ Futura 2: en 31 días → en 35 días
  await db.insert(reservations).values([
    { propertyId: prop1.id, guestName: "Laura Martínez2 adultos", reservationCode: "HM-BOOK-005", checkIn: addDays(-18), checkOut: addDays(-11), status: "confirmed", platform: "booking",  totalPrice: 65000, currency: "ARS" },
    { propertyId: prop1.id, guestName: "Sofía Alvarez2 adultos",  reservationCode: "HM-AIRB-001", checkIn: addDays(-2),  checkOut: addDays(3),   status: "confirmed", platform: "airbnb",  totalPrice: 45000, currency: "ARS" },
    { propertyId: prop1.id, guestName: "Carlos Rodríguez1 adulto", reservationCode: "HM-BOOK-002", checkIn: addDays(8),  checkOut: addDays(13), status: "confirmed", platform: "booking",  totalPrice: 85000, currency: "ARS" },
    { propertyId: prop1.id, guestName: "Ana García3 adultos",     reservationCode: "HM-AIRB-003", checkIn: addDays(19), checkOut: addDays(24), status: "confirmed", platform: "airbnb",  totalPrice: 95000, currency: "ARS" },
    { propertyId: prop1.id, guestName: "Miguel Torres2 adultos",  reservationCode: "HM-AIRB-004", checkIn: addDays(31), checkOut: addDays(35), status: "confirmed", platform: "airbnb",  totalPrice: 72000, currency: "ARS" },
  ]);

  console.log(`   ✔ 5 recomendaciones · 2 emergencias · 2 transportes · 5 reservas`);

  // ══════════════════════════════════════════════════════════════════════════
  // PROPIEDAD 2 — Dpto. Céntrico · Córdoba
  // 5/8 secciones completas (faltan: emergencias, transporte, acceso) — ocupada HOY
  // 2 recomendaciones — 189 vistas
  // ══════════════════════════════════════════════════════════════════════════
  console.log("🏠 Creando Propiedad 2: Dpto. Céntrico · Córdoba...");

  const [prop2] = await db
    .insert(properties)
    .values({
      name: "Dpto. Céntrico · Córdoba",
      slug: "dpto-centrico-cordoba-demo",
      address: "Av. General Paz 255",
      city: "Córdoba",
      country: "Argentina",
      wifiSsid: "DptoCentrico",
      wifiPassword: "cordoba2024",
      checkInTime: "15:00",
      checkOutTime: "10:00",
      status: "active",
      ownerId,
      views: 189,
      coverImageUrl:
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      houseRules: houseRulesJson({
        text: "Respetá el horario de silencio (22-8hs). No se permiten fiestas. El departamento cuenta con servicio de limpieza al check-out.",
        allowed: ["Home office", "Mascotas pequeñas"],
        prohibited: ["Fiestas", "Fumar"],
        // Sin accessInstructions ni accessSteps → sección "acceso" INCOMPLETA
        hasParking: true,
        parkingDetails: "Cochera incluida en el subsuelo del edificio",
        hostName: "Rodrigo",
        hostPhone: "+54 351 555-9876",
      }),
    })
    .returning();

  // Solo 1 categoría (para simplificar)
  const insertedCats2 = await db
    .insert(categories)
    .values([
      { name: "Restaurantes", type: "restaurants", icon: "Utensils", displayOrder: 1, propertyId: prop2.id, isSystemCategory: false },
      { name: "Cafeterías",   type: "cafes",       icon: "Coffee",   displayOrder: 2, propertyId: prop2.id, isSystemCategory: false },
    ])
    .returning();

  const [catGastro2, catCafe2] = insertedCats2;

  // Solo 2 recomendaciones manuales
  await db.insert(recommendations).values([
    { title: "La Nieta", description: "Cocina de autor en el corazón de Nueva Córdoba.", formattedAddress: "Obispo Trejo 177", googleMapsLink: "https://maps.google.com/?q=La+Nieta+Cordoba", propertyId: prop2.id, categoryId: catGastro2.id, isAutoSuggested: false, externalSource: "manual" },
    { title: "Almacén Cultural", description: "Café con libros, buena música y desayunos imperdibles.", formattedAddress: "Obispo Trejo 33", googleMapsLink: "https://maps.google.com/?q=Almacen+Cultural+Cordoba", propertyId: prop2.id, categoryId: catCafe2.id, isAutoSuggested: false, externalSource: "manual" },
  ]);

  // Sin emergencies → sección "emergencias" INCOMPLETA
  // Sin transport  → sección "transporte" INCOMPLETA
  // Sin accessSteps ni instructions → sección "acceso" INCOMPLETA

  // Reservas prop2
  // ┌─ Pasada: hace 14 días → hace 9 días
  // ├─ ACTUAL: hace 1 día   → en 2 días   ← ocupada HOY
  // └─ Próxima: en 12 días  → en 16 días
  await db.insert(reservations).values([
    { propertyId: prop2.id, guestName: "Valentina Cruz2 adultos",   reservationCode: "HM-AIRB-008", checkIn: addDays(-14), checkOut: addDays(-9), status: "confirmed", platform: "airbnb",  totalPrice: 42000, currency: "ARS" },
    { propertyId: prop2.id, guestName: "Patricia Vidal1 adulta",    reservationCode: "HM-AIRB-006", checkIn: addDays(-1),  checkOut: addDays(2),  status: "confirmed", platform: "airbnb",  totalPrice: 28000, currency: "ARS" },
    { propertyId: prop2.id, guestName: "Roberto Sánchez2 adultos",  reservationCode: "HM-BOOK-007", checkIn: addDays(12), checkOut: addDays(16), status: "confirmed", platform: "booking", totalPrice: 52000, currency: "ARS" },
  ]);

  console.log(`   ✔ 2 recomendaciones · sin emergencias · sin transporte · 3 reservas`);
  console.log(`   ⚠ Secciones incompletas: emergencias, transporte, acceso`);

  // ─── Resumen ───────────────────────────────────────────────────────────────
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  🎉  DEMO SEED COMPLETADO");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  📧  Email:    ${DEMO_EMAIL}`);
  console.log(`  🔑  Password: ${DEMO_PASSWORD}`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  📊  KPI bar al iniciar sesión:`);
  console.log(`      • Propiedades:     2`);
  console.log(`      • Ocupadas hoy:    2  (ambas propiedades con reserva activa)`);
  console.log(`      • Próximo check-in: en 8 días (Carlos Rodríguez · Prop 1)`);
  console.log(`      • Vistas totales:   501`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  🏠  Prop 1 — Casa Loft · Palermo`);
  console.log(`      slug: ${prop1.slug}`);
  console.log(`      Secciones: 8/8 ✅ · Vistas: 312 · 5 reservas`);
  console.log(`  🏠  Prop 2 — Dpto. Céntrico · Córdoba`);
  console.log(`      slug: ${prop2.slug}`);
  console.log(`      Secciones: 5/8 ⚠️  · Vistas: 189 · 3 reservas`);
  console.log("═══════════════════════════════════════════════════════════════\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
