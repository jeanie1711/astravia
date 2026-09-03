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
