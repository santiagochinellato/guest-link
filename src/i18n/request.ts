import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
 
  // Ensure that a valid locale is used
  if (!locale || !['en', 'es', 'pt'].includes(locale)) {
    locale = 'en';
  }
 
  return {
    locale,
    messages: (await import(`./locales/${locale}.json`)).default
  };
});
