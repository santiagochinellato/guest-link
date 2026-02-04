
import dotenv from "dotenv";
import path from "path";
import { sql } from "drizzle-orm";

// Manually load .env.local BEFORE importing db
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  try {
    // Dynamic import to ensure env vars are loaded first
    const { db } = await import("../db/index");

    console.log("Checking database connection...");
    
    // Check current database name/host (masked)
    // db.execute returns usually an array-like object in postgres.js or { rows } in node-postgres
    // We'll inspect the result structure safely.
    const dbNameResult = await db.execute(sql`SELECT current_database(), inet_server_addr()`);
    const dbNameRow = Array.isArray(dbNameResult) ? dbNameResult[0] : (dbNameResult as any).rows?.[0];
    
    console.log("Connected to DB:", dbNameRow);

    // Check if table exists
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'transport_info'
    `);
    
    const rows = Array.isArray(result) ? result : (result as any).rows;

    if (rows && rows.length > 0) {
      console.log("✅ Table 'transport_info' EXISTS in this database.");
      
      // Check columns
      const columnsResult = await db.execute(sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'transport_info'
      `);
      const columnsRows = Array.isArray(columnsResult) ? columnsResult : (columnsResult as any).rows;
      
      console.log("Columns found:", columnsRows.map((r: any) => r.column_name).join(", "));
      
      // Try executing the exact failing query
      console.log("\nTesting the specific query...");
      const propertyId = 1;
      const testQuery = sql`
        select "id", "property_id", "type", "name", "description", "phone", "website", "schedule_info", "price_info" 
        from "transport_info" "transportInfo" 
        where "transportInfo"."property_id" = ${propertyId}
      `;
      
      const testResult = await db.execute(testQuery);
      const testRows = Array.isArray(testResult) ? testResult : (testResult as any).rows;
      
      console.log("✅ Query executed successfully.");
      console.log(`Found ${testRows.length} records for property_id ${propertyId}`);
      
    } else {
      console.error("❌ Table 'transport_info' DOES NOT EXIST in this database.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Error verifying DB:", err);
    process.exit(1);
  }
}

main();
