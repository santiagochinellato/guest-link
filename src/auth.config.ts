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
      const isLoggedIn = !!auth?.user;
      
      // Check if the path is the dashboard or guest view
      const isOnDashboard = nextUrl.pathname.includes("/dashboard");
      const isOnGuestView = nextUrl.pathname.includes("/stay");

      if (isOnDashboard || isOnGuestView) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
