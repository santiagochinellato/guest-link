import 'server-only';
import { Locale } from './config';
import { es } from './dictionaries/es';
import { en } from './dictionaries/en';

// We can lazy load these if they get big, for now direct import is fine for type safety
const dictionaries = {
  es: () => Promise.resolve(es),
  en: () => Promise.resolve(en),
};

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  return dictionaries.es(); // Fallback
};
