import { NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Verificar conexión básica
    const testQuery = await db.execute(sql`SELECT 1 as test`);
    
    // Obtener lista de tablas
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tableNames = tables.rows.map((r: any) => r.table_name);
    
    // Contar properties
    const propCount = await db.execute(sql`SELECT COUNT(*) as count FROM properties`);
    
    // Contar categories
    const catCount = await db.execute(sql`SELECT COUNT(*) as count FROM categories`);
    
    return NextResponse.json({ 
      success: true,
      message: "Conexión a base de datos OK",
      connectionTimeMs: Date.now() - startTime,
      tables: tableNames,
      counts: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        properties: (propCount.rows[0] as any)?.count || 0,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        categories: (catCount.rows[0] as any)?.count || 0,
      },
      env: {
        hasPostgresUrl: !!process.env.POSTGRES_URL,
        urlPrefix: process.env.POSTGRES_URL?.substring(0, 30) + "..."
      }
    });
  } catch (error: unknown) {
    const err = error as Error & { code?: string; cause?: Error };
    console.error("Debug API Error:", err);
    return NextResponse.json({ 
      success: false,
      message: "Error de conexión a base de datos",
      error: err.message,
      code: err.code,
      cause: err.cause?.message,
      connectionTimeMs: Date.now() - startTime,
    }, { status: 500 });
  }
}
