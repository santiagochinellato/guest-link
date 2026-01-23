import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'pt'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Detects the user's preferred language from the Accept-Language header
  localeDetection: true
});
 
export const config = {
  // Match only internationalized pathnames
  // We apply this only to /stay/... routes if we want admin to be untranslated or default
  // But typically middleware wraps everything or specific paths.
  matcher: ['/stay/:path*']
};
