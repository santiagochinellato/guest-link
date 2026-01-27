import NextAuth from "next-auth";
import createMiddleware from 'next-intl/middleware';
import { authConfig } from "./auth.config";

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'pt'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Detects the user's preferred language from the Accept-Language header
  localeDetection: true
});

export default NextAuth(authConfig).auth((req) => {
  return intlMiddleware(req);
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
