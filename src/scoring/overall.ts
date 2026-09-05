import { SCORABLE_GOALS, type RankedCity, type ScorableGoal, type StabilityLabel } from "./types";
import { scoreToStars, STAR_LABELS } from "./score-city";

// Overall rating (spec §10): explicitly NOT the arithmetic mean of the four
// goal stars. This module implements the spec's "suggested internal
// weighting" (25% per goal + breadth/stability bonuses - tension penalty).
// The spec itself calls this "suggested" and doesn't pin exact bonus/
// penalty curves, so the specific scaling below is a documented default
// (see docs/DECISIONS.md), not a locked methodology figure -- but the
//45/25/15/... proportions given in the spec text are followed exactly.
const BREADTH_BONUS_CAP = 0.1;
const BREADTH_BONUS_PER_GOAL = 0.025;
const STABILITY_BONUS_CAP = 0.05;
const TENSION_PENALTY_CAP = 0.1;
const TENSION_PENALTY_PER_LOW_COHERENCE_GOAL = 0.025;
const HIGH_STAR_THRESHOLD = 4;

const STABILITY_QUALITY: Record<StabilityLabel, number> = {
  EXACT: 1,
  HIGH: 1,
  MEDIUM: 0.5,
  TIME_SENSITIVE: 0
};

export function computeOverall(cityId: string, goalResults: Record<ScorableGoal, RankedCity>): RankedCity {
  const results = SCORABLE_GOALS.map((goal) => goalResults[goal]);

  const base = results.reduce((sum, r) => sum + r.internalScore, 0) / results.length;

  const breadthCount = results.filter((r) => r.stars >= HIGH_STAR_THRESHOLD).length;
  const breadthBonus = Math.min(BREADTH_BONUS_CAP, breadthCount * BREADTH_BONUS_PER_GOAL);

  const avgStabilityQuality =
    results.reduce((sum, r) => sum + STABILITY_QUALITY[r.stability], 0) / results.length;
  const stabilityBonus = avgStabilityQuality * STABILITY_BONUS_CAP;

  const complexEffortfulCount = results.filter((r) => r.coherence === "COMPLEX_EFFORTFUL").length;
  const tensionPenalty = Math.min(TENSION_PENALTY_CAP, complexEffortfulCount * TENSION_PENALTY_PER_LOW_COHERENCE_GOAL);

  const internalScore = Math.min(1, Math.max(0, base + breadthBonus + stabilityBonus - tensionPenalty));
  const stars = scoreToStars(internalScore);

  // Cross-goal stability/coherence for display: the weakest stability
  // across goals (Overall shouldn't claim more confidence than its
  // shakiest contributing goal) and the strongest goal's coherence.
  const weakestStability = results.reduce((worst, r) =>
    STABILITY_QUALITY[r.stability] < STABILITY_QUALITY[worst] ? r.stability : worst,
    results[0]!.stability
  );
  const strongestGoalResult = results.reduce((best, r) => (r.internalScore > best.internalScore ? r : best));

  // BALANCED reflects breadth across goals (spec §4: "multi-goal support
  // without one dominant line"); otherwise Overall inherits the archetype
  // of whichever single goal carries it.
  const archetypeId = breadthCount >= 2 ? "BALANCED" : strongestGoalResult.archetypeId;

  return {
    cityId,
    goal: "OVERALL",
    internalScore,
    stars,
    label: STAR_LABELS[stars],
    primaryInfluence: undefined,
    secondaryInfluences: [],
    paranInfluence: undefined,
    coherence: strongestGoalResult.coherence,
    stability: weakestStability,
    archetypeId
  };
}
