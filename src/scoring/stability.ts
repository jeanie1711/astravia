import { computeScoreComponents, type ScoreComponents } from "./internal-score";
import type { RawInfluenceDistance } from "./select-influences";
import type { ParanCandidate, ScorableGoal, StabilityLabel } from "./types";

const HIGH_MAX_PRIMARY_DISTANCE_KM = 500;
const NOT_USED_THRESHOLD_KM = 750;
const HIGH_MAX_SPREAD = 0.2;
const MEDIUM_MAX_SPREAD = 0.45;

export type ScenarioInfluences = {
  lower: RawInfluenceDistance[];
  baseline: RawInfluenceDistance[];
  upper: RawInfluenceDistance[];
};

export type StabilityResult = {
  stability: StabilityLabel;
  baselineComponents: ScoreComponents;
  scenarioScores: [number, number, number]; // lower, baseline, upper
};

function findDistance(influences: RawInfluenceDistance[], body: string, angle: string): number {
  const match = influences.find((i) => i.body === body && i.angle === angle);
  if (!match) {
    throw new Error(`No distance entry for ${body}-${angle}`);
  }
  return match.distanceKm;
}

// Classifies birth-time stability (spec §7). Recomputes the full score
// independently for each of the three scenarios (not derived from the
// baseline by approximation), then applies the documented spread formula
// logged as a default in docs/DECISIONS.md: spread = (max-min)/baseline.
//
// Spread is measured from LINES ONLY across all three scenarios (never
// including `cityParans`, which is baseline-instant only -- see
// internal-score.ts's note): including a paran bonus on just the baseline
// term would inflate the apparent spread and could misclassify a result
// as less stable than it really is, purely as an artifact of where the
// paran bonus happens to be computed rather than a real birth-time
// sensitivity. The returned `baselineComponents` (used downstream for the
// final score, primary/secondary/paranInfluence) is computed separately,
// once stability is already decided, WITH parans included.
export function classifyStability(
  goal: ScorableGoal,
  scenarios: ScenarioInfluences,
  uncertaintyMinutes: number,
  cityParans: ParanCandidate[] = []
): StabilityResult {
  const baselineLinesOnly = computeScoreComponents(goal, scenarios.baseline);

  function withParans(): ScoreComponents {
    return cityParans.length > 0 ? computeScoreComponents(goal, scenarios.baseline, cityParans) : baselineLinesOnly;
  }

  if (uncertaintyMinutes === 0) {
    const baselineComponents = withParans();
    const s = baselineComponents.rawWithoutStability;
    return { stability: "EXACT", baselineComponents, scenarioScores: [s, s, s] };
  }

  const primary = baselineLinesOnly.primary;
  if (!primary) {
    // Nothing meaningful to track for stability; the city will score low
    // regardless of stability label. Documented neutral default.
    const baselineComponents = withParans();
    const s = baselineComponents.rawWithoutStability;
    return { stability: "MEDIUM", baselineComponents, scenarioScores: [s, s, s] };
  }

  const lowerComponents = computeScoreComponents(goal, scenarios.lower);
  const upperComponents = computeScoreComponents(goal, scenarios.upper);
  const scenarioScores: [number, number, number] = [
    lowerComponents.rawWithoutStability,
    baselineLinesOnly.rawWithoutStability,
    upperComponents.rawWithoutStability
  ];

  const primaryDistances = [
    findDistance(scenarios.lower, primary.body, primary.angle),
    findDistance(scenarios.baseline, primary.body, primary.angle),
    findDistance(scenarios.upper, primary.body, primary.angle)
  ];

  const primaryWithin500All = primaryDistances.every((d) => d <= HIGH_MAX_PRIMARY_DISTANCE_KM);
  const primaryBeyond750Somewhere = primaryDistances.some((d) => d > NOT_USED_THRESHOLD_KM);
  const primaryStrongSomewhere = primaryDistances.some((d) => d <= HIGH_MAX_PRIMARY_DISTANCE_KM);

  const [baselineScore] = [scenarioScores[1]];
  const spread = (Math.max(...scenarioScores) - Math.min(...scenarioScores)) / baselineScore;

  let stability: StabilityLabel;
  if ((primaryBeyond750Somewhere && primaryStrongSomewhere) || spread > MEDIUM_MAX_SPREAD) {
    stability = "TIME_SENSITIVE";
  } else if (primaryWithin500All && spread <= HIGH_MAX_SPREAD) {
    stability = "HIGH";
  } else {
    stability = "MEDIUM";
  }

  return { stability, baselineComponents: withParans(), scenarioScores };
}
