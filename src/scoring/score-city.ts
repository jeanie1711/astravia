import { selectArchetype } from "./archetype";
import { classifyStability, type ScenarioInfluences } from "./stability";
import type { Goal, RatingLabel, RankedCity, ScorableGoal, Stars } from "./types";

const RAW_CLAMP_MIN = 0;
const RAW_CLAMP_MAX = 1.2;
// v0.2: without a per-goal relevance discount, richness alone from a
// single close primary already nears 1.0 -- this normalizer keeps a lone
// close primary (no reinforcement) just under the 5-star threshold, so
// genuine reinforcement/coherence is required to clear it. Provisional,
// tuned during Golden Test authoring (04-scoring-ranking-spec.md §8).
const SCORE_NORMALIZER = 1.3;

const STABILITY_ADJUSTMENT = {
  EXACT: 0,
  HIGH: 0.1,
  MEDIUM: 0.03,
  TIME_SENSITIVE: -0.1
} as const;

const CHALLENGING_CATEGORIES = new Set(["Malefic", "Transformative"]);
const FIVE_STAR_MAX_DISTANCE_KM = 500;

export const STAR_LABELS: Record<Stars, RatingLabel> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Single source of truth for the numeric-to-stars thresholds (spec §9).
// scoreToStars, scoreToDisplayValue, and the guardrail ceilings below all
// derive from this one table so there is exactly one place these numbers
// are defined (CLAUDE.md §16: no magic numbers outside versioned config).
const STAR_LOWER_BOUND: Record<Stars, number> = { 1: 0, 2: 0.28, 3: 0.45, 4: 0.62, 5: 0.78 };
const STAR_UPPER_BOUND: Record<Stars, number> = { 1: 0.28, 2: 0.45, 3: 0.62, 4: 0.78, 5: 1 };

export function scoreToStars(score: number): Stars {
  if (score >= STAR_LOWER_BOUND[5]) return 5;
  if (score >= STAR_LOWER_BOUND[4]) return 4;
  if (score >= STAR_LOWER_BOUND[3]) return 3;
  if (score >= STAR_LOWER_BOUND[2]) return 2;
  return 1;
}

// Product decision 2026-09-05 (docs/DECISIONS.md): a guardrail is a
// statement about the SCORE ("this result's true strength cannot be
// trusted enough to claim tier N"), not a separate rule bolted onto the
// star label afterward -- stars must always be nothing more than
// scoreToStars(internalScore), a plain, friendly representation of the
// score. So each guardrail below caps `internalScore` itself, just under
// the threshold for the tier it's meant to prevent; `stars` is then
// derived the same way everywhere, with no separate override step. This
// also means ranking by `internalScore` is automatically consistent with
// displayed stars everywhere (no need for a separate star-aware
// comparator when sorting cities or countries).
const CEILING_EPSILON = 0.0001;
// "Cannot reach tier N" == score capped just under tier N's own lower
// bound. Exported so score-country.ts's five-star qualifying-city rule
// applies the exact same mechanism.
export function preventTierAndAbove(tier: Stars): number {
  return STAR_LOWER_BOUND[tier] - CEILING_EPSILON;
}

// Same breakpoints as scoreToStars, kept as each tier's own [lower, upper)
// bound so a decimal display value can be interpolated within a tier
// without inventing a second set of thresholds.
// Rounding-to-1-decimal safety margin: since a guardrail-capped score can
// sit as close as CEILING_EPSILON below the next tier's threshold (e.g.
// 0.7799 for a city prevented from reaching 5 stars), its raw fraction
// within the tier can come out above 0.95 -- which Math.round would then
// round UP to the next whole star (x.96 -> "(x+1).0"), visually
// contradicting the very cap that produced it. Capping the fraction well
// below 0.95 keeps the displayed/filled value inside its own tier.
const MAX_FRACTION = 0.94;

// One decimal of extra granularity within the assigned star tier (product
// feedback 2026-09-05: whole stars made every result in a tier look
// identical). Since `internalScore` now already encodes every guardrail
// (see above), `stars` always equals scoreToStars(internalScore) exactly
// -- this just interpolates within that tier for a smooth partial-star
// fill; it no longer needs to defend against a stars/score mismatch.
export function scoreToDisplayValue(internalScore: number, stars: Stars): number {
  if (stars === 5) return 5; // 5.0 is the ceiling of the scale, nothing above it
  const lo = STAR_LOWER_BOUND[stars];
  const hi = STAR_UPPER_BOUND[stars];
  const fraction = Math.min(MAX_FRACTION, Math.max(0, (internalScore - lo) / (hi - lo)));
  return Math.round((stars + fraction) * 10) / 10;
}

// Computes the full scoring result for one city/goal (04-scoring-ranking-
// spec.md v0.2 §5-§9), applying the guardrails directly to the score: S001
// (no relevant line prevents tier 3+), S002 (five stars requires an
// influence within 500km), S003 (time-sensitive prevents tier 5), and the
// documented "Malefic/Transformative primary + Complex/effortful
// coherence" soft cap preventing tier 4+.
export function scoreCity(cityId: string, goal: ScorableGoal, scenarios: ScenarioInfluences, uncertaintyMinutes: number): RankedCity {
  const { stability, baselineComponents } = classifyStability(goal, scenarios, uncertaintyMinutes);

  const raw = baselineComponents.rawWithoutStability + STABILITY_ADJUSTMENT[stability];
  const clampedRaw = Math.min(RAW_CLAMP_MAX, Math.max(RAW_CLAMP_MIN, raw));
  let internalScore = Math.min(1, clampedRaw / SCORE_NORMALIZER);

  // S001: no goal-relevant influence inside 750 km -> cannot exceed 2 stars.
  if (baselineComponents.candidates.length === 0) {
    internalScore = Math.min(internalScore, preventTierAndAbove(3));
  }

  // S002: five stars requires at least one influence within 500 km.
  const hasInfluenceWithin500 = baselineComponents.candidates.some((c) => c.distanceKm <= FIVE_STAR_MAX_DISTANCE_KM);
  if (!hasInfluenceWithin500) {
    internalScore = Math.min(internalScore, preventTierAndAbove(5));
  }

  // S003: time-sensitive stability caps at 4 stars.
  if (stability === "TIME_SENSITIVE") {
    internalScore = Math.min(internalScore, preventTierAndAbove(5));
  }

  // Documented soft guardrail (spec §9): a primary from the Malefic or
  // Transformative category, paired with a Complex/effortful coherence
  // (meaning the secondary is ALSO Malefic/Transformative -- see
  // coherence.ts), is capped at 3 stars rather than described as
  // effortlessly strong.
  if (
    baselineComponents.primary &&
    CHALLENGING_CATEGORIES.has(baselineComponents.primary.category) &&
    baselineComponents.coherence === "COMPLEX_EFFORTFUL"
  ) {
    internalScore = Math.min(internalScore, preventTierAndAbove(4));
  }

  const stars = scoreToStars(internalScore);
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
