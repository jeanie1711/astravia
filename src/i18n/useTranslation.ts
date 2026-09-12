import { en, type Dictionary } from "./dictionaries/en";
import { vi } from "./dictionaries/vi";
import { useLanguage } from "./LanguageContext";
import type { Language } from "./types";

const DICTIONARIES: Record<Language, Dictionary> = { en, vi };

export function useTranslation(): Dictionary {
  const { language } = useLanguage();
  return DICTIONARIES[language];
}
