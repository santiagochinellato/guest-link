import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Verificar conexión básica
    await db.execute(sql`SELECT 1 as test`);
    
    // Obtener lista de tablas
    const tables = await db.execute(
      sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableNames = tables.map((r) => r.table_name);
    
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
        properties: propCount[0]?.count || 0,
        categories: catCount[0]?.count || 0,
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

