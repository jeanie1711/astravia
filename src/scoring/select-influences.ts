import { classifyStrengthBand } from "../astro/geo-distance.js";
import type { Angle, Body } from "../astro/types.js";
import { distanceStrength } from "./distance-strength.js";
import { baselineTension, goalRelevance } from "./relevance.js";
import type { CandidateInfluence, ScorableGoal, SelectedInfluences } from "./types.js";

const NOT_USED_THRESHOLD_KM = 750;
const PRIMARY_MIN_SUPPORT = 0.35;
const SECONDARY_MIN_SUPPORT = 0.2;
const MAX_SECONDARY = 3;

export type RawInfluenceDistance = {
  body: Body;
  angle: Angle;
  distanceKm: number;
};

// Builds candidate influences for one city/goal at one scenario instant
// (spec §5: "Candidate influence if distance < 750 km") with each
// candidate's support value (spec §8: distanceStrength * R * (1-0.35*tension)).
export function buildCandidateInfluences(
  goal: ScorableGoal,
  influences: RawInfluenceDistance[]
): CandidateInfluence[] {
  const candidates: CandidateInfluence[] = [];

  for (const influence of influences) {
    if (influence.distanceKm >= NOT_USED_THRESHOLD_KM) continue;

    const strength = distanceStrength(influence.distanceKm);
    const relevance = goalRelevance(influence.body, influence.angle, goal);
    const tension = baselineTension(influence.body);
    const support = strength * (relevance / 5) * (1 - 0.35 * tension);

    candidates.push({
      body: influence.body,
      angle: influence.angle,
      distanceKm: influence.distanceKm,
      strengthBand: classifyStrengthBand(influence.distanceKm),
      relevance,
      tension,
      strength,
      support
    });
  }

  candidates.sort((a, b) => b.support - a.support);
  return candidates;
}

// Selects the primary (support > 0.35) and up to three secondary
// (support > 0.20) influences from a support-sorted candidate list.
// Spec §5: "Never select more than four visible key influences in MVP."
export function selectInfluences(candidates: CandidateInfluence[]): SelectedInfluences {
  const [top, ...rest] = candidates;
  const primary = top && top.support > PRIMARY_MIN_SUPPORT ? top : undefined;
  const remaining = primary ? rest : candidates;

  const secondary = remaining.filter((c) => c.support > SECONDARY_MIN_SUPPORT).slice(0, MAX_SECONDARY);

  return { primary, secondary };
}
