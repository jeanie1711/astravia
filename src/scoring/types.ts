import type { Angle, Body, CityInfluence, Sensitivity, StrengthBand } from "../astro/types.js";

export type Goal = "CAREER" | "LOVE" | "HOME" | "GROWTH" | "OVERALL";
export type ScorableGoal = Exclude<Goal, "OVERALL">;

export const SCORABLE_GOALS: readonly ScorableGoal[] = ["CAREER", "LOVE", "HOME", "GROWTH"];

export type Influence = {
  body: Body;
  angle: Angle;
};

export type CoherenceLabel = "HIGH" | "MEDIUM" | "LOW";
export type StabilityLabel = "EXACT" | "HIGH" | "MEDIUM" | "TIME_SENSITIVE";
export type Stars = 1 | 2 | 3 | 4 | 5;
export type RatingLabel = "Weak" | "Challenging" | "Mixed" | "Strong" | "Exceptional";

// A candidate influence for one city/goal, carrying everything the scoring
// formula needs at one scenario instant.
export type CandidateInfluence = {
  body: Body;
  angle: Angle;
  distanceKm: number;
  strengthBand: StrengthBand;
  relevance: number; // 1-5, from the goal relevance matrix
  tension: number; // baseline tension multiplier for the body
  strength: number; // distanceStrength(distanceKm), 0-1
  support: number; // strength * (relevance/5) * (1 - 0.35*tension)
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
