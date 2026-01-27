
import { NextResponse } from "next/server";
import { getPropertyBySlug } from "@/lib/actions/properties"; // Adjust import path
import { db } from "@/db";
import { properties } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const slug = "san-martin-460"; // Or whatever slug exists
    console.log(`Debug API: Fetching property ${slug}...`);
    
    // Check DB connection first
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
    const tableNames = tables.rows.map((r: any) => r.table_name);
    
    const result = await getPropertyBySlug(slug);
    
    return NextResponse.json({ 
        success: true, 
        result,
        tables: tableNames
    });
  } catch (error: any) {
    console.error("Debug API Error:", error);
    return NextResponse.json({ 
        success: false, 
        error: error.message,
        stack: error.stack,
        details: error
    }, { status: 500 });
  }
}
