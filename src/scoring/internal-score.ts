import { resolveCoherence } from "./coherence.js";
import { buildCandidateInfluences, selectInfluences, type RawInfluenceDistance } from "./select-influences.js";
import type { CandidateInfluence, CoherenceLabel, ScorableGoal } from "./types.js";

const SECONDARY_WEIGHTS = [0.45, 0.25, 0.15] as const;
const SECONDARY_SUPPORT_CAP = 0.35;
const TENSION_PENALTY_CAP = 0.25;
const TENSION_WEIGHTS = [0.18, 0.1] as const;

const COHERENCE_ADJUSTMENT: Record<CoherenceLabel, number> = {
  HIGH: 0.12,
  MEDIUM: 0.04,
  LOW: -0.08
};

export type ScoreComponents = {
  candidates: CandidateInfluence[];
  primary: CandidateInfluence | undefined;
  secondary: CandidateInfluence[];
  coherence: CoherenceLabel;
  primarySupport: number; // P
  secondarySupport: number; // S
  coherenceAdj: number;
  tensionPenalty: number; // T
  rawWithoutStability: number; // P + S + coherenceAdj - T
};

// tensionContribution_i = distanceStrength_i * R_i * tension_i (spec §8) --
// deliberately does not include the (1 - 0.35*tension) dampening that
// `support` applies; it isolates how much of a candidate's presence is
// "tension-driven" for the penalty term.
function tensionContribution(candidate: CandidateInfluence): number {
  return candidate.strength * (candidate.relevance / 5) * candidate.tension;
}

// Computes the pre-stability internal score components for one city/goal
// at one scenario's set of influence distances (spec §5-§8). Stability
// (which requires comparing across all three scenarios) is layered on top
// by score-city.ts / stability.ts.
export function computeScoreComponents(
  goal: ScorableGoal,
  influences: RawInfluenceDistance[]
): ScoreComponents {
  const candidates = buildCandidateInfluences(goal, influences);
  const { primary, secondary } = selectInfluences(candidates);
  const coherence = resolveCoherence(goal, primary, secondary);

  const primarySupport = primary?.support ?? 0;

  const secondarySupportRaw = secondary.reduce(
    (sum, candidate, index) => sum + (SECONDARY_WEIGHTS[index] ?? 0) * candidate.support,
    0
  );
  const secondarySupport = Math.min(SECONDARY_SUPPORT_CAP, secondarySupportRaw);

  const coherenceAdj = COHERENCE_ADJUSTMENT[coherence];

  const tensionContributions = candidates
    .map(tensionContribution)
    .sort((a, b) => b - a);
  const [t1 = 0, t2 = 0] = tensionContributions;
  const tensionPenalty = Math.min(
    TENSION_PENALTY_CAP,
    TENSION_WEIGHTS[0] * t1 + TENSION_WEIGHTS[1] * t2
  );

  const rawWithoutStability = primarySupport + secondarySupport + coherenceAdj - tensionPenalty;

  return {
    candidates,
    primary,
    secondary,
    coherence,
    primarySupport,
    secondarySupport,
    coherenceAdj,
    tensionPenalty,
    rawWithoutStability
  };
}
