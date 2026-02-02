import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { eq } from "drizzle-orm";

async function assignOwner() {
  const { db } = await import("@/db");
  const { properties, users } = await import("@/db/schema");
  console.log("🔍 Finding Admin User...");

  // 1. Get first user (usually the admin/developer)
  const user = await db.query.users.findFirst();

  if (!user) {
    console.error("❌ No users found in database! Please register or log in first.");
    process.exit(1);
  }

  console.log(`✅ Found User: ${user.name} (${user.email}) - ID: ${user.id}`);

  // 2. Find Mock Property
  const mockSlug = "mitre-loft-vip";
  const property = await db.query.properties.findFirst({
    where: eq(properties.slug, mockSlug),
  });

  if (!property) {
    console.error("❌ Mock property not found!");
    process.exit(1);
  }

  // 3. Update Owner
  await db.update(properties)
    .set({ ownerId: user.id })
    .where(eq(properties.id, property.id));

  console.log(`🎉 Property '${property.name}' assigned to user '${user.email}'`);
}

assignOwner()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("💥 Error:", err);
    process.exit(1);
  });
