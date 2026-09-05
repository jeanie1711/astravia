import { selectArchetype } from "./archetype";
import { classifyStability, type ScenarioInfluences } from "./stability";
import type { Goal, RatingLabel, RankedCity, ScorableGoal, Stars } from "./types";

const RAW_CLAMP_MIN = 0;
const RAW_CLAMP_MAX = 1.2;
const SCORE_NORMALIZER = 1.05;

const STABILITY_ADJUSTMENT = {
  EXACT: 0,
  HIGH: 0.1,
  MEDIUM: 0.03,
  TIME_SENSITIVE: -0.1
} as const;

const HIGH_TENSION_THRESHOLD = 0.4;
const FIVE_STAR_MAX_DISTANCE_KM = 500;

export const STAR_LABELS: Record<Stars, RatingLabel> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Numeric-to-stars mapping (spec §9). Exported for reuse by overall.ts and
// score-country.ts, which apply the same thresholds to their own composite
// scores rather than duplicating the table.
export function scoreToStars(score: number): Stars {
  if (score >= 0.78) return 5;
  if (score >= 0.62) return 4;
  if (score >= 0.45) return 3;
  if (score >= 0.28) return 2;
  return 1;
}

// Same breakpoints as scoreToStars, kept as each tier's own [lower, upper)
// bound so a decimal display value can be interpolated within a tier
// without inventing a second set of thresholds.
const STAR_LOWER_BOUND: Record<Stars, number> = { 1: 0, 2: 0.28, 3: 0.45, 4: 0.62, 5: 0.78 };
const STAR_UPPER_BOUND: Record<Stars, number> = { 1: 0.28, 2: 0.45, 3: 0.62, 4: 0.78, 5: 1 };
// Never let a tier's decimal reach the next whole star -- important when a
// guardrail (S002/S003, the tension+LOW-coherence cap, or country's
// five-star qualifying-city rule) has capped `stars` below what the raw
// score would naturally reach: the decimal must stay inside the capped
// tier, not read as "basically" the tier above (CLAUDE.md §11: a capped
// result must never look like it became the higher rating).
const MAX_FRACTION = 0.94;

// One decimal of extra granularity within the assigned star tier (product
// feedback 2026-09-05: whole stars made every result in a tier look
// identical, which was mistaken for a bug when two same-starred cities
// were treated differently elsewhere). `stars` must be the FINAL,
// guardrail-capped value -- never derive the decimal from the raw score
// against its own natural tier, since a capped score can sit far outside
// the capped tier's bound and must be clamped into it instead.
export function scoreToDisplayValue(internalScore: number, stars: Stars): number {
  if (stars === 5) return 5; // 5.0 is the ceiling of the scale, nothing above it
  const lo = STAR_LOWER_BOUND[stars];
  const hi = STAR_UPPER_BOUND[stars];
  const fraction = Math.min(MAX_FRACTION, Math.max(0, (internalScore - lo) / (hi - lo)));
  return Math.round((stars + fraction) * 10) / 10;
}

// Computes the full scoring result for one city/goal (spec §5-§9), applying
// the star guardrails: S001 (no relevant line caps at 2), S002 (five stars
// requires an influence within 500km), S003 (time-sensitive caps at 4), and
// the documented "tension-heavy primary + low coherence" soft cap at 3.
export function scoreCity(cityId: string, goal: ScorableGoal, scenarios: ScenarioInfluences, uncertaintyMinutes: number): RankedCity {
  const { stability, baselineComponents } = classifyStability(goal, scenarios, uncertaintyMinutes);

  const raw = baselineComponents.rawWithoutStability + STABILITY_ADJUSTMENT[stability];
  const clampedRaw = Math.min(RAW_CLAMP_MAX, Math.max(RAW_CLAMP_MIN, raw));
  const internalScore = Math.min(1, clampedRaw / SCORE_NORMALIZER);

  let stars = scoreToStars(internalScore);

  // S001: no goal-relevant influence inside 750 km -> cannot exceed 2 stars.
  if (baselineComponents.candidates.length === 0) {
    stars = Math.min(stars, 2) as Stars;
  }

  // S002: five stars requires at least one influence within 500 km.
  const hasInfluenceWithin500 = baselineComponents.candidates.some((c) => c.distanceKm <= FIVE_STAR_MAX_DISTANCE_KM);
  if (!hasInfluenceWithin500) {
    stars = Math.min(stars, 4) as Stars;
  }

  // S003: time-sensitive stability caps at 4 stars.
  if (stability === "TIME_SENSITIVE") {
    stars = Math.min(stars, 4) as Stars;
  }

  // Documented soft guardrail: a primarily tension-heavy, low-coherence
  // story is capped at 3 stars rather than described as effortlessly
  // strong (spec §9: "may be capped at ★★★☆☆").
  if (baselineComponents.primary && baselineComponents.primary.tension >= HIGH_TENSION_THRESHOLD && baselineComponents.coherence === "LOW") {
    stars = Math.min(stars, 3) as Stars;
  }

  const goalOut: Goal = goal;

  return {
    cityId,
    goal: goalOut,
    internalScore,
    stars,
    label: STAR_LABELS[stars],
    primaryInfluence: baselineComponents.primary
      ? { body: baselineComponents.primary.body, angle: baselineComponents.primary.angle }
      : undefined,
    secondaryInfluences: baselineComponents.secondary.map((s) => ({ body: s.body, angle: s.angle })),
    coherence: baselineComponents.coherence,
    stability,
    archetypeId: selectArchetype(baselineComponents.primary, baselineComponents.coherence)
  };
}
