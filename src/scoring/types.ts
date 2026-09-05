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

export type SelectedInfluences = {
  primary: CandidateInfluence | undefined;
  secondary: CandidateInfluence[]; // up to 3
};

export type RankedCity = {
  cityId: string;
  goal: Goal;
  internalScore: number; // never displayed to the user
  stars: Stars;
  label: RatingLabel;
  primaryInfluence: Influence | undefined;
  secondaryInfluences: Influence[];
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
