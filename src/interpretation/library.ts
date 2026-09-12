import type { Angle, Body } from "../astro/types";
import type { Language } from "../i18n/types";
import { ENTRIES_EN } from "./library.en";
import { ENTRIES_VI } from "./library.vi";
import type { Interpretation, Tone } from "./types";

function buildLibrary(entries: Array<Omit<Interpretation, "id">>): Map<string, Interpretation> {
  const map = new Map<string, Interpretation>();
  for (const entry of entries) {
    const id = `${entry.body}-${entry.angle}`;
    map.set(id, { id, ...entry });
  }
  return map;
}

const LIBRARIES: Record<Language, Map<string, Interpretation>> = {
  en: buildLibrary(ENTRIES_EN),
  vi: buildLibrary(ENTRIES_VI)
};

export function getInterpretation(body: Body, angle: Angle, language: Language): Interpretation {
  const entry = LIBRARIES[language].get(`${body}-${angle}`);
  if (!entry) {
    throw new Error(`No interpretation entry for ${body}-${angle} (${language})`);
  }
  return entry;
}

export function allInterpretations(language: Language): Interpretation[] {
  return Array.from(LIBRARIES[language].values());
}

export type { Tone };
