import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { eq } from "drizzle-orm";

async function populateMissingData() {
  const { db } = await import("@/db");
  const { properties, recommendations } = await import("@/db/schema");

  console.log("🔍 Finding 'mitre-loft-vip' property...");
  
  const property = await db.query.properties.findFirst({
    where: eq(properties.slug, "mitre-loft-vip"),
  });

  if (!property) {
    console.error("❌ Property 'mitre-loft-vip' not found.");
    process.exit(1);
  }

  console.log(`✅ Found property: ${property.name} (ID: ${property.id})`);

  // Get all recommendations for this property
  const recs = await db.query.recommendations.findMany({
    where: eq(recommendations.propertyId, property.id),
  });

  console.log(`📊 Found ${recs.length} recommendations. Checking for missing data...`);

  let updatedCount = 0;

  for (const rec of recs) {
    const updateData: any = {};
    let needsUpdate = false;

    // 1. Fill Address
    if (!rec.formattedAddress) {
      updateData.formattedAddress = "Mitre 123, San Carlos de Bariloche, Rio Negro";
      needsUpdate = true;
    }

    // 2. Fill Phone
    if (!rec.phone) {
      updateData.phone = "+54 294 442-2000";
      needsUpdate = true;
    }

    // 3. Fill Website
    if (!rec.website) {
      updateData.website = "https://www.barilocheturismo.gob.ar";
      needsUpdate = true;
    }

    // 4. Fill Description if empty
    if (!rec.description) {
      updateData.description = "Esta es una descripción generada automáticamente para completar el diseño. Este lugar es altamente recomendado por su calidad y servicio.";
      needsUpdate = true;
    }

    // 5. Fill Coordinates if missing (Centric Bariloche)
    if (!rec.latitude || !rec.longitude) {
       // Random wiggle to not stack them all
       const lat = -41.1335 + (Math.random() * 0.01 - 0.005);
       const lng = -71.3103 + (Math.random() * 0.01 - 0.005);
       updateData.latitude = lat.toFixed(6);
       updateData.longitude = lng.toFixed(6);
       needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`📝 Updating recommendation: ${rec.title}`);
      await db.update(recommendations)
        .set(updateData)
        .where(eq(recommendations.id, rec.id));
      updatedCount++;
    }
  }

  console.log(`\n🎉 Process complete! Updated ${updatedCount} recommendations.`);
}

populateMissingData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error:", err);
    process.exit(1);
  });
