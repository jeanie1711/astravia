import { describe, expect, it } from "vitest";
import { ANGLES, BODIES } from "../../src/astro/types.js";
import { allInterpretations, getInterpretation } from "../../src/interpretation/library.js";
import { findProhibitedPhrases } from "../../src/interpretation/safety.js";

describe("interpretation library completeness", () => {
  it("has exactly 40 entries: every body x angle combination", () => {
    expect(allInterpretations()).toHaveLength(40);
    for (const body of BODIES) {
      for (const angle of ANGLES) {
        expect(() => getInterpretation(body, angle)).not.toThrow();
      }
    }
  });

  it("every entry has non-empty opportunity, tradeOff, feel and bestFor", () => {
    for (const entry of allInterpretations()) {
      expect(entry.opportunity.length).toBeGreaterThan(0);
      expect(entry.tradeOff.length).toBeGreaterThan(0);
      expect(entry.feel.length).toBeGreaterThan(0);
      expect(entry.bestFor.length).toBeGreaterThan(0);
      expect(entry.coreTheme.length).toBeGreaterThan(0);
      expect(entry.archetype.length).toBeGreaterThan(0);
    }
  });

  it("I004: no entry's text contains a prohibited phrase", () => {
    for (const entry of allInterpretations()) {
      const allText = [entry.coreTheme, ...entry.opportunity, ...entry.tradeOff, ...entry.feel, ...entry.bestFor].join(
        " "
      );
      expect(findProhibitedPhrases(allText)).toEqual([]);
    }
  });
});
