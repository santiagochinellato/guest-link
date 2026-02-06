import { db } from "@/db";
import { properties } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  try {
    const property = await db.query.properties.findFirst({
      where: eq(properties.syncApiKey, key),
      columns: {
        id: true,
        name: true,
      }
    });

    if (!property) {
      return NextResponse.json({ error: "Invalid key" }, { status: 401 });
    }

    return NextResponse.json({ success: true, property });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
