import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/es/login",
    newUser: "/es/register",
    error: "/es/login", // Redirect errors to login page
  },
  trustHost: true, // Required for OAuth providers in development
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const pathname = nextUrl.pathname;

      // Public: all stay pages (guest guides)
      if (pathname.includes("/stay")) return true;

      // Dashboard: allow request through; middleware will redirect to /[lang]/login if not logged in
      if (pathname.includes("/dashboard")) return true;

      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
