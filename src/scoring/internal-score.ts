import { resolveCoherence } from "./coherence";
import { buildCandidateInfluences, selectInfluences, type RawInfluenceDistance } from "./select-influences";
import type { CandidateInfluence, CoherenceLabel, Influence, ParanCandidate, ScorableGoal } from "./types";

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
  paranInfluence: Influence | undefined;
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
//
// `cityParans` (04 §5.1) is baseline-instant only, not tracked across
// birth-time uncertainty scenarios like regular lines are -- a documented
// scope decision (docs/DECISIONS.md), not an oversight: a paran can only
// ever add reinforcement on top of an already-selected primary, so it
// cannot change which stability tier a result lands in, only nudge the
// score within that tier. Stability's own three-scenario recomputation
// (stability.ts) still runs on lines alone.
export function computeScoreComponents(
  goal: ScorableGoal,
  influences: RawInfluenceDistance[],
  cityParans: ParanCandidate[] = []
): ScoreComponents {
  const candidates = buildCandidateInfluences(influences);
  const { primary, secondary, paranReinforcement } = selectInfluences(candidates, goal, cityParans);
  const reinforcement = paranReinforcement ?? secondary[0];

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
    paranInfluence: paranReinforcement ? { body: paranReinforcement.body, angle: paranReinforcement.angle } : undefined,
    coherence,
    richness,
    coherenceAdj,
    rawWithoutStability
  };
}
