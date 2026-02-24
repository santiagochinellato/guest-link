/**
 * SEED USUARIOS DEMO + REVISOR — Hostly
 *
 * Crea (o re-crea) dos usuarios con las mismas 2 propiedades cada uno:
 * - demo@hostly.app: para demo con el cliente
 * - revisor@hostly.app: para tu compañero que revisa
 *
 * Ejecutar: npm run db:seed
 *
 * Usa la misma DB que la app en dev: carga .env.local (igual que next dev y drizzle.config).
 *
 * CREDENCIALES:
 *   Demo:    demo@hostly.app    / hostly2024
 *   Revisor: revisor@hostly.app / revisor2024
 *
 * Cada usuario ve 2 propiedades con los mismos datos (slugs distintos: -demo y -revisor).
 */

import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

const envPath = path.resolve(process.cwd(), ".env");
const envLocalPath = path.resolve(process.cwd(), ".env.local");
dotenv.config({ path: envPath });
dotenv.config({ path: envLocalPath });

if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.error("❌ Falta POSTGRES_URL_NON_POOLING, POSTGRES_URL o DATABASE_URL.");
  process.exit(1);
}

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
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
const REVISOR_EMAIL = "revisor@hostly.app";
const REVISOR_PASSWORD = "revisor2024";

async function ensureUser(
  email: string,
  password: string,
  name: string,
): Promise<{ id: number; name: string | null; email: string; password: string | null; role: string | null; createdAt: Date | null }> {
  const hash = await bcrypt.hash(password, 10);
  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    await db.update(users).set({ password: hash, name }).where(eq(users.id, existing.id));
    return existing;
  }
  const [inserted] = await db.insert(users).values({ name, email, password: hash }).returning();
  if (!inserted) throw new Error(`Insert user ${email} falló`);
  return inserted;
}

function deleteOwnerProperties(ownerId: number) {
  return db.transaction(async (tx) => {
    const list = await tx.select({ id: properties.id }).from(properties).where(eq(properties.ownerId, ownerId));
    for (const p of list) {
      await tx.delete(reservations).where(eq(reservations.propertyId, p.id));
      await tx.delete(recommendations).where(eq(recommendations.propertyId, p.id));
      await tx.delete(categories).where(eq(categories.propertyId, p.id));
      await tx.delete(emergencyContacts).where(eq(emergencyContacts.propertyId, p.id));
      await tx.delete(transportInfo).where(eq(transportInfo.propertyId, p.id));
    }
    if (list.length > 0) await tx.delete(properties).where(eq(properties.ownerId, ownerId));
    return list.length;
  });
}

async function createTwoPropertiesForOwner(ownerId: number, slugSuffix: string) {
  // ═══ PROPIEDAD 1 — Casa Loft · Palermo ═══
  const [prop1] = await db
    .insert(properties)
    .values({
      name: "Casa Loft · Palermo",
      slug: `casa-loft-palermo-demo${slugSuffix}`,
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
      slug: `dpto-centrico-cordoba-demo${slugSuffix}`,
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
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const dbUrl = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL!;
  const envUsed = fs.existsSync(envLocalPath) ? ".env.local" : ".env";
  const dbHost = dbUrl.replace(/^[^@]+@/, "").split("/")[0].split("?")[0];
  console.log("🌱 Iniciando seed demo + revisor...");
  console.log(`   Env: ${envUsed} | DB: ${dbHost}\n`);

  // 1. Usuarios demo y revisor
  const demoUser = await ensureUser(DEMO_EMAIL, DEMO_PASSWORD, "Demo Cliente");
  console.log(`✅ Usuario demo: ${DEMO_EMAIL}`);
  const revisorUser = await ensureUser(REVISOR_EMAIL, REVISOR_PASSWORD, "Revisor");
  console.log(`✅ Usuario revisor: ${REVISOR_EMAIL}\n`);

  // 2. Limpiar y crear propiedades para demo
  const deletedDemo = await deleteOwnerProperties(demoUser.id);
  if (deletedDemo > 0) console.log(`🧹 ${deletedDemo} propiedad(es) demo anteriores eliminadas`);
  console.log("🏠 Creando 2 propiedades para demo...");
  await createTwoPropertiesForOwner(demoUser.id, "");

  // 3. Limpiar y crear propiedades para revisor (mismos datos, slugs con -revisor)
  const deletedRev = await deleteOwnerProperties(revisorUser.id);
  if (deletedRev > 0) console.log(`🧹 ${deletedRev} propiedad(es) revisor anteriores eliminadas`);
  console.log("🏠 Creando 2 propiedades para revisor...");
  await createTwoPropertiesForOwner(revisorUser.id, "-revisor");

  // ─── Resumen ───────────────────────────────────────────────────────────────
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  🎉  SEED DEMO + REVISOR COMPLETADO");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Demo:    ${DEMO_EMAIL}    / ${DEMO_PASSWORD}`);
  console.log(`  Revisor: ${REVISOR_EMAIL} / ${REVISOR_PASSWORD}`);
  console.log("───────────────────────────────────────────────────────────────");
  console.log(`  Cada usuario tiene 2 propiedades (Casa Loft · Palermo, Dpto. Céntrico · Córdoba).`);
  console.log("  Dashboard protegido: solo acceso con usuario y contraseña.");
  console.log("═══════════════════════════════════════════════════════════════\n");

  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Error en seed:", e);
  process.exit(1);
});
