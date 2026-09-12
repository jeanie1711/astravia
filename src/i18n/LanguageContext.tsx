"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Language } from "./types";

const STORAGE_KEY = "astravia-language";
const DEFAULT_LANGUAGE: Language = "en";

// Kill switch (2026-09-13): the switcher shipped but reports came back of
// inconsistent application -- toggling sometimes left some sections
// translated and others not. Disabling here forces English everywhere
// (including for any visitor who already has "vi" saved from testing)
// without touching any of the underlying dictionaries/content/pipeline
// wiring. Re-enabling once the inconsistency is root-caused is just: flip
// this back to true and restore <LanguageToggle /> in layout.tsx.
const SWITCHER_ENABLED = false;

type LanguageContextValue = {
  language: Language;
  // False until the initial localStorage read completes (client-only --
  // always false during SSR). Consumers render the default-language copy
  // until this flips, avoiding a hydration mismatch.
  hydrated: boolean;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readFromStorage(): Language {
  if (!SWITCHER_ENABLED) return DEFAULT_LANGUAGE;
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") return stored;
    // No stored preference yet -- a Vietnamese browser locale is a
    // reasonable one-time hint for the default, without ever overriding
    // an explicit choice the user already made.
    return window.navigator.language.toLowerCase().startsWith("vi") ? "vi" : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

// Site-wide language preference (not journey/session data -- this is why
// it lives in localStorage, not sessionStorage, and is untouched by
// resetJourney()).
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setLanguageState(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!SWITCHER_ENABLED || !hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // localStorage unavailable (private browsing etc) -- the choice
      // just won't survive a reload, which is an acceptable degradation.
    }
  }, [language, hydrated]);

  function setLanguage(next: Language) {
    if (!SWITCHER_ENABLED) return;
    setLanguageState(next);
  }

  return (
    <LanguageContext.Provider value={{ language, hydrated, setLanguage }}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
