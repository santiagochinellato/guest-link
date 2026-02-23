import { NextResponse } from "next/server";
import { handlers } from "@/auth";

const { GET: AuthGET, POST: AuthPOST } = handlers;

export async function GET(req: Request) {
  try {
    return await AuthGET(req);
  } catch (e) {
    console.error("[auth/session] Error:", e);
    return NextResponse.json(
      { user: null, expires: null },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    return await AuthPOST(req);
  } catch (e) {
    console.error("[auth] POST Error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Authentication error" },
      { status: 500 }
    );
  }
}
