import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * GET /api/reservations/verify?key=<syncApiKey>
 * Used by Hostly extension to resolve property id from API key (e.g. for Supabase Realtime filter).
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get("key");
    if (!key) {
      return NextResponse.json(
        { success: false, error: "Missing key" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const property = await db.query.properties.findFirst({
      where: eq(properties.syncApiKey, key),
      columns: { id: true, name: true },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: "Invalid API Key" },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, property: { id: property.id, name: property.name } },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
