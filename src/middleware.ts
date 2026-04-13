import { NextResponse } from "next/server";
import { auth } from "@/auth";

const LOCALES = ["es", "en"];

/** QA: Edge a veces no inyecta vars sin NEXT_PUBLIC_; aceptamos ambas (mismo valor en Vercel). */
function isQaAuthBypass(): boolean {
  return (
    process.env.AUTH_QA_BYPASS === "true" ||
    process.env.NEXT_PUBLIC_AUTH_QA_BYPASS === "true"
  );
}

function getLangFromPath(pathname: string): string {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && LOCALES.includes(segment) ? segment : "es";
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const qaAuthBypass = isQaAuthBypass();

  // Only protect dashboard routes
  if (pathname.includes("/dashboard")) {
    if (!isLoggedIn && !qaAuthBypass) {
      const lang = getLangFromPath(pathname);
      const loginUrl = new URL(`/${lang}/login`, req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, etc.
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|api).*)",
  ],
};
