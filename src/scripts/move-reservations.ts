import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...values] = line.split('=');
    if (key && values) {
      const val = values.join('=').trim().replace(/^["'](.*)["']$/, '$1');
      process.env[key.trim()] = val;
    }
  });
}

async function main() {
  const { db } = await import("@/db");
  const { properties, reservations } = await import("@/db/schema");
  const { eq } = await import("drizzle-orm");

  console.log("🔍 Buscando propiedades...\n");

  // Usar select explícito para evitar columnas que no existen
  const allProperties = await db
    .select({
      id: properties.id,
      name: properties.name,
      syncApiKey: properties.syncApiKey,
    })
    .from(properties);
  
  console.log(`📋 Propiedades encontradas: ${allProperties.length}\n`);
  allProperties.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id}) ${p.syncApiKey ? '🔑' : '❌'}`);
  });

  const mitreLoft = allProperties.find(p => 
    p.name.toLowerCase().includes('mitre') || p.name.toLowerCase().includes('loft')
  );
  
  const sanMartin = allProperties.find(p => 
    p.name.toLowerCase().includes('san martin') || 
    p.name.toLowerCase().includes('san martín') ||
    p.name.toLowerCase().includes('460')
  );

  if (!mitreLoft) {
    console.log("\n❌ No se encontró 'Mitre Loft'");
    return;
  }

  if (!sanMartin) {
    console.log("\n❌ No se encontró 'San Martín 460'");
    return;
  }

  console.log(`\n✅ Mitre Loft encontrado: ID ${mitreLoft.id}`);
  console.log(`✅ San Martín 460 encontrado: ID ${sanMartin.id}`);

  // Mover reservas
  const mitreReservations = await db
    .select({
      id: reservations.id,
      guestName: reservations.guestName,
      reservationCode: reservations.reservationCode,
    })
    .from(reservations)
    .where(eq(reservations.propertyId, mitreLoft.id));

  console.log(`\n📅 Reservas en Mitre Loft: ${mitreReservations.length}`);

  if (mitreReservations.length === 0) {
    console.log("✅ No hay reservas para mover.");
    return;
  }

  console.log("\n🔄 Moviendo reservas...\n");

  for (const res of mitreReservations) {
    await db
      .update(reservations)
      .set({ propertyId: sanMartin.id, updatedAt: new Date() })
      .where(eq(reservations.id, res.id));
    console.log(`   ✓ ${res.guestName} (${res.reservationCode})`);
  }

  console.log(`\n✅ ${mitreReservations.length} reserva(s) movida(s) exitosamente!`);

  // Verificar resultado
  const sanMartinReservations = await db
    .select({ id: reservations.id })
    .from(reservations)
    .where(eq(reservations.propertyId, sanMartin.id));

  console.log(`\n📊 Total de reservas en "${sanMartin.name}": ${sanMartinReservations.length}`);

  if (sanMartin.syncApiKey) {
    console.log(`\n🔑 Sync API Key de "${sanMartin.name}":`);
    console.log(`   ${sanMartin.syncApiKey}`);
    console.log(`\n⚠️  IMPORTANTE: Asegúrate de que tu extensión use esta clave.`);
  } else {
    console.log(`\n⚠️  "${sanMartin.name}" no tiene syncApiKey configurado.`);
    console.log(`   Genera una con: npx tsx src/scripts/get-sync-key.ts`);
  }
}

main().catch(console.error).finally(() => process.exit(0));