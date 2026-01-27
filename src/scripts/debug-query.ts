import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "drizzle-orm";



async function main() {
  const { db } = await import("../db");
  const { properties } = await import("../db/schema");
  const { getPropertyBySlug } = await import("../lib/actions/properties");

  console.log("🔍 Checking DB Connection...");
  try {
     const res = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
     console.log("📂 Tables in DB:", res.map((r) => r.table_name));
     
     const count = await db.select({ count: sql<number>`count(*)` }).from(properties);
     console.log("✅ Check properties count:", count);
  } catch (e: any) {
     console.error("❌ Failed to connect/query DB:", e);
     console.error("DETAILS:", JSON.stringify(e, Object.getOwnPropertyNames(e), 2));
     process.exit(1);
  }

  console.log("\n🧪 Testing getPropertyBySlug('san-martin-460')...");
  try {
      const result = await getPropertyBySlug('san-martin-460');
      console.log("📊 Result:", JSON.stringify(result, null, 2));
  } catch (e: any) {
      console.error("❌ getPropertyBySlug Failed:", e);
  }
  process.exit(0);
}

main().catch(console.error);
