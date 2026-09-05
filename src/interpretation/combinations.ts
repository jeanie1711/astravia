import { planetCategory, type PlanetCategory } from "../scoring/category";
import type { Influence } from "../scoring/types";
import { getInterpretation } from "./library";

// Narrative synthesis for a primary + secondary/paran pair
// (06-interpretation-library.md §3, v0.2). Replaces the v0.1 25 hand-picked
// pairwise phrases with one pattern per coherence tier, built from each
// influence's own already-approved coreTheme/tradeOff text (§2 of that
// doc) rather than a second, separately hand-authored phrase per pair.
// This module only holds prose -- it never recalculates coherence
// (CLAUDE.md §3): the tier is re-derived here from category the same way
// coherence.ts does, since this module intentionally never imports from
// src/scoring beyond the plain category classification (no score/ranking
// state crosses the calculation -> scoring -> interpretation boundary).
export type CombinationSynthesis = {
  synthesis: string;
  story: string;
};

const CHALLENGING: ReadonlySet<PlanetCategory> = new Set(["Malefic", "Transformative"]);

function isChallenging(category: PlanetCategory): boolean {
  return CHALLENGING.has(category);
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Looks up the synthesis for a primary/secondary pair. Always returns a
// value under v0.2 -- category-pair coverage is exhaustive by
// construction, unlike v0.1's lookup table which could miss a pair.
export function lookupSynthesis(a: Influence, b: Influence): CombinationSynthesis {
  const interpA = getInterpretation(a.body, a.angle);
  const interpB = getInterpretation(b.body, b.angle);
  const challengingCount = [planetCategory(a.body), planetCategory(b.body)].filter(isChallenging).length;

  if (challengingCount === 0) {
    return {
      synthesis: `${capitalize(interpA.coreTheme)} meets ${interpB.coreTheme} -- a clear, doubled-down signal.`,
      story: `Two easeful themes reinforce each other here; ${interpA.tradeOff[0]} is still worth keeping in mind.`
    };
  }

  if (challengingCount === 1) {
    const [easeful, challenging] = isChallenging(planetCategory(a.body)) ? [interpB, interpA] : [interpA, interpB];
    return {
      synthesis: `${capitalize(easeful.coreTheme)} meets ${challenging.coreTheme} -- a layered story, opportunity alongside effort.`,
      story: `Real opportunity here comes paired with real demands; ${challenging.tradeOff[0]} matters as much as the upside.`
    };
  }

  return {
    synthesis: `${capitalize(interpA.coreTheme)} compounds with ${interpB.coreTheme} -- powerful, but demanding on every side.`,
    story: `Never romanticised: ${interpA.tradeOff[0]} and ${interpB.tradeOff[0]} both matter here.`
  };
}
