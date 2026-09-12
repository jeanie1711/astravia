import { describe, expect, it } from "vitest";
import { ANGLES, BODIES } from "../../src/astro/types.js";
import { allInterpretations, getInterpretation } from "../../src/interpretation/library.js";
import { findProhibitedPhrases } from "../../src/interpretation/safety.js";
import type { Language } from "../../src/i18n/types.js";

const LANGUAGES: Language[] = ["en", "vi"];

describe.each(LANGUAGES)("interpretation library completeness (%s)", (language) => {
  it("has exactly 40 entries: every body x angle combination", () => {
    expect(allInterpretations(language)).toHaveLength(40);
    for (const body of BODIES) {
      for (const angle of ANGLES) {
        expect(() => getInterpretation(body, angle, language)).not.toThrow();
      }
    }
  });

  it("every entry has non-empty opportunity, tradeOff, feel and bestFor", () => {
    for (const entry of allInterpretations(language)) {
      expect(entry.opportunity.length).toBeGreaterThan(0);
      expect(entry.tradeOff.length).toBeGreaterThan(0);
      expect(entry.feel.length).toBeGreaterThan(0);
      expect(entry.bestFor.length).toBeGreaterThan(0);
      expect(entry.coreTheme.length).toBeGreaterThan(0);
      expect(entry.archetype.length).toBeGreaterThan(0);
    }
  });

  it("I004: no entry's text contains a prohibited phrase", () => {
    for (const entry of allInterpretations(language)) {
      const allText = [entry.coreTheme, ...entry.opportunity, ...entry.tradeOff, ...entry.feel, ...entry.bestFor].join(
        " "
      );
      expect(findProhibitedPhrases(allText, language)).toEqual([]);
    }
  });
});
