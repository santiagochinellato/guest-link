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
      
      // Check if the path is the dashboard, handling internationalized paths (e.g., /es/dashboard)
      const isOnDashboard = nextUrl.pathname.includes("/dashboard");
      
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      
      return true;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
