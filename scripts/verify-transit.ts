import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { busStops } from "../src/db/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function verify() {
  console.log("🔍 Verifying DB access...");
  try {
    const stops = await db.select().from(busStops).limit(5);
    console.log("✅ Success! Found stops:", stops);
  } catch (err) {
    console.error("❌ Verification Failed:", err);
  }
  process.exit(0);
}

verify();
