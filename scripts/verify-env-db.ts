import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; // Using same driver as app
import { busStops } from "../src/db/schema";
import "dotenv/config";

const envs = {
  POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  POSTGRES_URL: process.env.POSTGRES_URL,
  DATABASE_URL: process.env.DATABASE_URL
};

async function testConnection(name: string, url: string | undefined) {
    if (!url) {
        console.log(`⚠️ ${name} is undefined`);
        return;
    }
    
    // Mask password
    const masked = url.replace(/:[^:@]*@/, ":***@");
    console.log(`🔌 Testing ${name}: ${masked}`);

    try {
        const client = postgres(url, { ssl: 'require', max: 1 });
        const db = drizzle(client);
        
        // 1. Check basic connection
        const now = await db.execute(require("drizzle-orm").sql`select now()`);
        console.log(`   ✅ Connected. Time: ${now[0].now}`);

        // 2. Check for bus_stops table
        try {
            const count = await db.execute(require("drizzle-orm").sql`select count(*) from bus_stops`);
            console.log(`   ✅ bus_stops table exists! Count: ${count[0].count}`);
        } catch (e: any) {
            console.error(`   ❌ bus_stops table missing! Error: ${e.message}`);
        }

        await client.end();
    } catch (e: any) {
        console.error(`   ❌ Connection Failed: ${e.message}`);
    }
}

async function run() {
    console.log("🔍 Debugging DB Connections...");
    await testConnection("POSTGRES_URL_NON_POOLING", envs.POSTGRES_URL_NON_POOLING);
    await testConnection("POSTGRES_URL", envs.POSTGRES_URL);
    await testConnection("DATABASE_URL", envs.DATABASE_URL);
    process.exit(0);
}

run();
