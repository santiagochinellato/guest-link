import "server-only";
import { Locale } from "./config";
import { es } from "./dictionaries/es";
import { en } from "./dictionaries/en";
import { pt } from "./dictionaries/pt";

const dictionaries: Record<Locale, () => Promise<typeof es>> = {
  es: () => Promise.resolve(es),
  en: () => Promise.resolve(en),
  pt: () => Promise.resolve(pt),
};

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  return dictionaries.es(); // Fallback
};
