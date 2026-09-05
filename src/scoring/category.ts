import type { Angle, Body } from "../astro/types";
import type { ScorableGoal } from "./types";

// Traditional planetary nature classification (04-scoring-ranking-spec.md
// §3.2 v0.2). Replaces the v0.1 40-entry per-goal relevance matrix and the
// per-planet "baseline tension" table with one classification drawn from
// broadly-taught tradition, not an invented per-product number. Category
// drives narrative tone (interpretation layer) and coherence tier
// (coherence.ts) -- it never discounts a candidate's score directly.
export type PlanetCategory = "Personal" | "Benefic" | "Malefic" | "Transformative";

const CATEGORY: Record<Body, PlanetCategory> = {
  Sun: "Personal",
  Moon: "Personal",
  Mercury: "Personal",
  Venus: "Benefic",
  Jupiter: "Benefic",
  Mars: "Malefic",
  Saturn: "Malefic",
  Uranus: "Transformative",
  Neptune: "Transformative",
  Pluto: "Transformative"
};

export function planetCategory(body: Body): PlanetCategory {
  return CATEGORY[body];
}

// Angle -> life-domain mapping (04-scoring-ranking-spec.md §3.3), already
// implemented via the UI's INFLUENCE_LABEL before this rewrite -- stated
// here as the scoring layer's own source of truth. The four life domains
// are exactly the four scorable goals, by design (near-universal ACG
// consensus on what each angle governs).
const ANGLE_DOMAIN: Record<Angle, ScorableGoal> = {
  MC: "CAREER",
  IC: "HOME",
  ASC: "GROWTH",
  DSC: "LOVE"
};

export function angleDomain(angle: Angle): ScorableGoal {
  return ANGLE_DOMAIN[angle];
}
