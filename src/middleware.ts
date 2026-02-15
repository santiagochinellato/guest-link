import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "./auth.config";

const CORS_PREFLIGHT_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Hostly-Sync-Key",
  "Access-Control-Max-Age": "86400",
} as const;

const intlMiddleware = createMiddleware({
  locales: ["en", "es", "pt"],
  defaultLocale: "en",
  localeDetection: true,
});

const SYNC_API_PATHS = ["/api/reservations/sync", "/api/reservations/verify"];

function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (SYNC_API_PATHS.includes(path)) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: CORS_PREFLIGHT_HEADERS,
      });
    }
    // No pasar por NextAuth ni next-intl: evita redirección a /es/api/...
    return NextResponse.next();
  }
  return NextAuth(authConfig).auth((req) => intlMiddleware(req))(req);
}

export default middleware;

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/api/reservations/sync",
    "/api/reservations/verify",
  ],
};
