import type { Angle, Body } from "../astro/types.js";
import type { Goal, Influence, StabilityLabel, Stars } from "../scoring/types.js";

export type Tone = "outward" | "inward" | "relational" | "transformative" | "mixed";

// Content object schema (06-interpretation-library.md §1).
export type Interpretation = {
  id: string; // "${Body}-${Angle}"
  body: Body;
  angle: Angle;
  archetype: string; // the entry's own specific title, e.g. "The Visibility Place"
  coreTheme: string;
  opportunity: string[];
  tradeOff: string[];
  feel: string[];
  bestFor: string[];
  tone: Tone;
};

// City Story output schema (05-result-content-framework.md §18). The UI
// consumes this structured output rather than generating meaning itself.
export type TechnicalDetail = {
  line: string;
  distanceKm: number;
  scenarioDistancesKm: number[];
};

export type CityResult = {
  city: string;
  country: string;

  goal: Goal;
  stars: Stars;
  ratingLabel: string;

  archetypeId: string;
  primaryTheme: string;
  secondaryThemes: string[];

  hook: string;

  whyItStandsOut: string;
  opportunities: string[];
  tradeOffs: string[];

  howItMayFeel: string;
  bestFor: string[];

  birthTimeConfidence: StabilityLabel;
  confidenceExplanation: string;

  primaryInfluence: Influence | undefined;
  secondaryInfluences: Influence[];

  technicalDetails: TechnicalDetail[];

  shareText: string;

  calculationVersion: string;
  scoringVersion: string;
  interpretationVersion: string;
};
