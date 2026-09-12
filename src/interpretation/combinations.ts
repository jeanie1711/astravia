import { planetCategory, type PlanetCategory } from "../scoring/category";
import type { Influence } from "../scoring/types";
import { getInterpretation } from "./library";
import { capitalize, joinList, WEIGHT } from "./voice";

// Narrative synthesis for a primary + secondary/paran pair
// (06-interpretation-library.md §3, v0.3 as of 2026-09-13). One paragraph-
// sized template per coherence tier, built entirely from each influence's
// own already-approved coreTheme/opportunity/tradeOff text (library.ts)
// plus the small per-planet WEIGHT vocabulary (voice.ts) -- never a
// second, hand-authored phrase per specific pair. This module only holds
// prose -- it never recalculates coherence (CLAUDE.md §3): the tier is
// re-derived here from category the same way coherence.ts does, since
// this module intentionally never imports from src/scoring beyond the
// plain category classification (no score/ranking state crosses the
// calculation -> scoring -> interpretation boundary).
export type CombinationSynthesis = {
  synthesis: string;
  story: string;
};

const CHALLENGING: ReadonlySet<PlanetCategory> = new Set(["Malefic", "Transformative"]);

function isChallenging(category: PlanetCategory): boolean {
  return CHALLENGING.has(category);
}

// Looks up the synthesis for a primary + reinforcement pair. `a` is
// always the primary influence and `b` the reinforcement (paran or
// secondary) -- callers must pass them in that order, since the LAYERED
// tier's phrasing depends on which side is the challenging one. Always
// returns a value under v0.2+ -- category-pair coverage is exhaustive by
// construction, unlike v0.1's lookup table which could miss a pair.
export function lookupSynthesis(a: Influence, b: Influence, isParan: boolean): CombinationSynthesis {
  const interpA = getInterpretation(a.body, a.angle);
  const interpB = getInterpretation(b.body, b.angle);
  const link = isParan ? "paran" : "influence";
  const challengingCount = [planetCategory(a.body), planetCategory(b.body)].filter(isChallenging).length;

  if (challengingCount === 0) {
    return {
      synthesis: `This isn't a one-note signal either: a nearby ${a.body}–${b.body} ${link} reinforces it, adding ${interpB.coreTheme}.`,
      story: `Two easeful themes line up here; ${interpA.tradeOff[0]} is still worth keeping in mind so the ease doesn't turn into drift.`
    };
  }

  if (challengingCount === 1) {
    const aIsChallenging = isChallenging(planetCategory(a.body));
    if (!aIsChallenging) {
      // Primary (a) is the easeful side, the reinforcement (b) is the
      // challenging one -- it adds weight to an otherwise lighter story
      // (the Adamstown reference case: Mercury primary + Saturn paran).
      const weight = WEIGHT[b.body] ?? interpB.coreTheme;
      return {
        synthesis: `But this is not simply a straightforward ${a.body} story: a nearby ${a.body}–${b.body} ${link} adds ${weight}.`,
        story: `Some of the most meaningful opportunities here may arrive through ${joinList(interpB.opportunity.slice(0, 2))}, or relationships that ask for ${interpB.tradeOff[0]}.`
      };
    }
    // Primary (a) is itself the challenging one -- the reinforcement (b)
    // brings something easier alongside it, rather than adding more
    // weight to a story that's already heavy.
    const weight = WEIGHT[a.body] ?? interpA.coreTheme;
    return {
      synthesis: `This isn't purely a story of ${weight}: a nearby ${a.body}–${b.body} ${link} brings ${interpB.coreTheme} into the mix.`,
      story: `The upside may come more easily than the ${a.body} side suggests, through ${joinList(interpB.opportunity.slice(0, 2))}, without erasing what ${a.body} demands.`
    };
  }

  return {
    synthesis: `This combination doesn't come easily: a nearby ${a.body}–${b.body} ${link} compounds it, adding ${WEIGHT[b.body] ?? interpB.coreTheme}.`,
    story: `${capitalize(interpA.tradeOff[0]!)} and ${interpB.tradeOff[0]} both deserve real attention here, not just the upside.`
  };
}
