import type { Angle, Body, CityInfluence, Sensitivity, StrengthBand } from "../astro/types";
import type { PlanetCategory } from "./category";

export type Goal = "CAREER" | "LOVE" | "HOME" | "GROWTH" | "OVERALL";
export type ScorableGoal = Exclude<Goal, "OVERALL">;

export const SCORABLE_GOALS: readonly ScorableGoal[] = ["CAREER", "LOVE", "HOME", "GROWTH"];

export type Influence = {
  body: Body;
  angle: Angle;
};

// v0.2 (04-scoring-ranking-spec.md §6): a pure function of the primary and
// secondary/paran's PlanetCategory pair, unrelated to angle/domain. "NONE"
// covers a lone primary with no secondary/paran at all -- nothing to
// cohere or conflict with.
export type CoherenceLabel = "REINFORCING" | "LAYERED" | "COMPLEX_EFFORTFUL" | "NONE";
export type StabilityLabel = "EXACT" | "HIGH" | "MEDIUM" | "TIME_SENSITIVE";
export type Stars = 1 | 2 | 3 | 4 | 5;
export type RatingLabel = "Weak" | "Challenging" | "Mixed" | "Strong" | "Exceptional";

// A candidate influence for one city, carrying everything the scoring
// formula needs at one scenario instant. Not goal-specific -- a candidate's
// category is intrinsic to its body; domain-matching against the current
// goal happens at selection time (select-influences.ts), not here.
export type CandidateInfluence = {
  body: Body;
  angle: Angle;
  distanceKm: number;
  strengthBand: StrengthBand;
  category: PlanetCategory;
  strength: number; // distanceStrength(distanceKm), 0-1 -- also this candidate's richness contribution
};

// A city's distance to one paran (04-scoring-ranking-spec.md §5.1,
// 03-astro-calculation-spec.md §19), in the same shape computeAllParansAtInstant
// produces -- both sides named, neither privileged as "the primary's side"
// yet. select-influences.ts resolves that once it knows the primary.
export type ParanCandidate = {
  bodyA: Body;
  angleA: Angle;
  bodyB: Body;
  angleB: Angle;
  distanceKm: number;
};

export type SelectedInfluences = {
  primary: CandidateInfluence | undefined;
  secondary: CandidateInfluence[]; // up to 3, plain lines only, for display
  // Set when a paran's distanceStrength beat the best plain secondary's --
  // it then stands in for the richness/coherence reinforcement role
  // instead of secondary[0] (internal-score.ts), while `secondary` above
  // stays the plain-line list for display. Kept separate from
  // `secondary` because a paran is a qualitatively different kind of
  // signal and must be named as such in a City Story (06 §5), not folded
  // silently into "a second nearby line."
  paranReinforcement: CandidateInfluence | undefined;
};

export type RankedCity = {
  cityId: string;
  goal: Goal;
  internalScore: number; // never displayed to the user
  stars: Stars;
  label: RatingLabel;
  primaryInfluence: Influence | undefined;
  secondaryInfluences: Influence[];
  paranInfluence: Influence | undefined; // the partner body/angle, when a paran won the reinforcement role
  coherence: CoherenceLabel;
  stability: StabilityLabel;
  archetypeId: string;
};

// Per-city input to the scoring layer: every influence's CityInfluence +
// Sensitivity, as produced by src/astro/sensitivity.ts.
export type CityScoringInput = {
  cityId: string;
  influences: Array<{ cityInfluence: CityInfluence; sensitivity: Sensitivity }>;
  uncertaintyMinutes: number;
};

export type CountryNarrative = "CORRIDOR" | "ANCHOR" | "MIXED";

export type CountryResult = {
  countryCode: string;
  internalScore: number;
  stars: Stars;
  label: RatingLabel;
  narrative: CountryNarrative;
  topCityIds: string[];
};
