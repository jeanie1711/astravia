import { resolveCoherence } from "./coherence";
import { buildCandidateInfluences, selectInfluences, type RawInfluenceDistance } from "./select-influences";
import type { CandidateInfluence, CoherenceLabel, ScorableGoal } from "./types";

const REINFORCEMENT_WEIGHT = 0.5;

const COHERENCE_ADJUSTMENT: Record<CoherenceLabel, number> = {
  REINFORCING: 0.12,
  LAYERED: 0.04,
  COMPLEX_EFFORTFUL: -0.08,
  NONE: 0
};

export type ScoreComponents = {
  candidates: CandidateInfluence[];
  primary: CandidateInfluence | undefined;
  secondary: CandidateInfluence[];
  coherence: CoherenceLabel;
  richness: number;
  coherenceAdj: number;
  rawWithoutStability: number; // richness + coherenceAdj
};

// Computes the pre-stability internal score components for one city/goal
// at one scenario's set of influence distances (04-scoring-ranking-spec.md
// v0.2 §5-§8). Stability (which requires comparing across all three
// scenarios) is layered on top by score-city.ts / stability.ts.
//
// Replaces v0.1's five-term P + S + coherenceAdj + stabilityAdj - T
// formula with a two-term richness formula: no separate tension penalty --
// a body's traditional category (category.ts) shapes narrative tone and
// coherence tier, never a hidden score discount (04 §4).
export function computeScoreComponents(
  goal: ScorableGoal,
  influences: RawInfluenceDistance[]
): ScoreComponents {
  const candidates = buildCandidateInfluences(influences);
  const { primary, secondary } = selectInfluences(candidates, goal);
  const reinforcement = secondary[0];

  const richness = primary
    ? primary.strength + (reinforcement ? REINFORCEMENT_WEIGHT * reinforcement.strength : 0)
    : 0;

  const coherence = primary && reinforcement ? resolveCoherence(primary, reinforcement) : "NONE";
  const coherenceAdj = COHERENCE_ADJUSTMENT[coherence];

  const rawWithoutStability = richness + coherenceAdj;

  return {
    candidates,
    primary,
    secondary,
    coherence,
    richness,
    coherenceAdj,
    rawWithoutStability
  };
}
