import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; 
import { busStops } from "../src/db/schema";
import { sql } from "drizzle-orm";

// Hardcoded connection string from .env.local to be 100% sure
// postgres://postgres.lqkxpikgmrgadfynorny:qH4tiMRACkXoeDmm@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
const connectionString = "postgres://postgres.lqkxpikgmrgadfynorny:qH4tiMRACkXoeDmm@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require";

async function run() {
    console.log("🔍 Verifying PROD DB Content directly...");
    
    try {
        const client = postgres(connectionString, { ssl: 'require' });
        const db = drizzle(client);
        
        // 1. Check count
        const result = await db.execute(sql`select count(*) from bus_stops`);
        console.log(`   📊 Count bus_stops: ${result[0].count}`);

        // 2. List names
        if (Number(result[0].count) > 0) {
            const stops = await db.select().from(busStops);
            console.log("   📍 First 3 stops:");
            stops.slice(0,3).forEach(s => console.log(`      - ${s.name} (${s.latitude}, ${s.longitude})`));
        } else {
            console.log("   ❌ Table is empty!");
        }
        
        await client.end();
    } catch (e: any) {
        console.error(`   ❌ Failed: ${e.message}`);
    }
}

run();
