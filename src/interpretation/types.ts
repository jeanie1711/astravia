import type { Angle, Body } from "../astro/types";
import type { Goal, Influence, StabilityLabel, Stars } from "../scoring/types";

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

// One row for the "astrology behind this match" section (2026-09-13 City
// Story redesign) -- pairs each influence already named elsewhere on the
// result with its own plain-language theme, so the astrology section
// reads as a short reference rather than a bare list of body-angle codes.
export type InfluenceDetail = {
  role: "Primary" | "Paran" | "Secondary";
  body: Body;
  angle: Angle;
  description: string;
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
  // One-line synthesis of the primary influence (and its reinforcement,
  // when one exists) into a single memorable thesis for the result --
  // shown as a standout line right under the theme tags.
  tagline: string;

  // 2-4 paragraphs joined by "\n\n" (render with white-space: pre-line,
  // or split on "\n\n" for separate <p> tags) -- opens with what's
  // central to this result, expands the primary influence into the
  // goal's real-world shape, then folds in the reinforcement/paran when
  // present, closing on a short synthesis line.
  whyItStandsOut: string;
  opportunities: string[];
  tradeOffs: string[];

  // Short quoted feel line (unchanged from before -- still the first
  // sentence of the primary interpretation's own feel copy).
  howItMayFeel: string;
  // A second, longer paragraph expanding on howItMayFeel using the
  // primary's tone and the reinforcement's texture, when one exists.
  // Empty string for the weak-result fallback (nothing to expand on).
  howItMayFeelDetail: string;
  bestFor: string[];

  birthTimeConfidence: StabilityLabel;
  confidenceExplanation: string;

  primaryInfluence: Influence | undefined;
  secondaryInfluences: Influence[];
  // A paran (04-scoring-ranking-spec.md §5.1) that reinforced the primary,
  // when one won that role. Named as its own distinct signal type in the
  // UI ("a paran of X and Y") rather than folded into secondaryInfluences
  // -- it's a qualitatively different kind of signal (06-interpretation-
  // library.md §5).
  paranInfluence: Influence | undefined;
  // Plain-language theme for each influence above, in display order
  // (primary, then paran when present, then secondaries) -- backs the
  // "astrology behind this match" section.
  influenceDetails: InfluenceDetail[];

  technicalDetails: TechnicalDetail[];

  shareText: string;

  calculationVersion: string;
  scoringVersion: string;
  interpretationVersion: string;
};
