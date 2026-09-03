import type { Angle, Body } from "../astro/types.js";
import type { ScorableGoal } from "./types.js";

// Editorial goal-relevance matrix (04-scoring-ranking-spec.md §3.2).
// "This matrix is an editorial product hypothesis, not an astronomical
// fact." Versioned via MODEL_VERSIONS.scoring; do not edit weights without
// a documented product decision + Golden Test review (CLAUDE.md §3).
type RelevanceRow = Record<ScorableGoal, number>;

const RELEVANCE_MATRIX: Record<Body, Record<Angle, RelevanceRow>> = {
  Sun: {
    MC: { CAREER: 5, LOVE: 2, HOME: 1, GROWTH: 4 },
    IC: { CAREER: 1, LOVE: 3, HOME: 4, GROWTH: 3 },
    ASC: { CAREER: 4, LOVE: 3, HOME: 2, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 4, HOME: 2, GROWTH: 3 }
  },
  Moon: {
    MC: { CAREER: 3, LOVE: 3, HOME: 2, GROWTH: 3 },
    IC: { CAREER: 1, LOVE: 4, HOME: 5, GROWTH: 4 },
    ASC: { CAREER: 2, LOVE: 4, HOME: 4, GROWTH: 4 },
    DSC: { CAREER: 2, LOVE: 5, HOME: 4, GROWTH: 3 }
  },
  Mercury: {
    MC: { CAREER: 5, LOVE: 3, HOME: 1, GROWTH: 3 },
    IC: { CAREER: 2, LOVE: 3, HOME: 3, GROWTH: 3 },
    ASC: { CAREER: 4, LOVE: 4, HOME: 2, GROWTH: 4 },
    DSC: { CAREER: 4, LOVE: 4, HOME: 2, GROWTH: 3 }
  },
  Venus: {
    MC: { CAREER: 4, LOVE: 4, HOME: 2, GROWTH: 3 },
    IC: { CAREER: 2, LOVE: 4, HOME: 5, GROWTH: 3 },
    ASC: { CAREER: 3, LOVE: 5, HOME: 3, GROWTH: 4 },
    DSC: { CAREER: 2, LOVE: 5, HOME: 3, GROWTH: 3 }
  },
  Mars: {
    MC: { CAREER: 4, LOVE: 2, HOME: 1, GROWTH: 4 },
    IC: { CAREER: 1, LOVE: 2, HOME: 2, GROWTH: 3 },
    ASC: { CAREER: 3, LOVE: 3, HOME: 2, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 2, HOME: 1, GROWTH: 4 }
  },
  Jupiter: {
    MC: { CAREER: 5, LOVE: 3, HOME: 2, GROWTH: 4 },
    IC: { CAREER: 2, LOVE: 4, HOME: 5, GROWTH: 4 },
    ASC: { CAREER: 4, LOVE: 4, HOME: 3, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 5, HOME: 3, GROWTH: 4 }
  },
  Saturn: {
    MC: { CAREER: 4, LOVE: 2, HOME: 2, GROWTH: 4 },
    IC: { CAREER: 2, LOVE: 2, HOME: 3, GROWTH: 4 },
    ASC: { CAREER: 3, LOVE: 2, HOME: 2, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 2, HOME: 2, GROWTH: 4 }
  },
  Uranus: {
    MC: { CAREER: 4, LOVE: 2, HOME: 1, GROWTH: 5 },
    IC: { CAREER: 2, LOVE: 2, HOME: 2, GROWTH: 5 },
    ASC: { CAREER: 3, LOVE: 2, HOME: 1, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 2, HOME: 1, GROWTH: 5 }
  },
  Neptune: {
    MC: { CAREER: 3, LOVE: 2, HOME: 1, GROWTH: 4 },
    IC: { CAREER: 1, LOVE: 3, HOME: 3, GROWTH: 4 },
    ASC: { CAREER: 2, LOVE: 3, HOME: 2, GROWTH: 5 },
    DSC: { CAREER: 2, LOVE: 4, HOME: 2, GROWTH: 4 }
  },
  Pluto: {
    MC: { CAREER: 4, LOVE: 2, HOME: 1, GROWTH: 5 },
    IC: { CAREER: 2, LOVE: 2, HOME: 3, GROWTH: 5 },
    ASC: { CAREER: 3, LOVE: 2, HOME: 2, GROWTH: 5 },
    DSC: { CAREER: 3, LOVE: 2, HOME: 1, GROWTH: 5 }
  }
};

export function goalRelevance(body: Body, angle: Angle, goal: ScorableGoal): number {
  return RELEVANCE_MATRIX[body][angle][goal];
}

// Baseline tension multipliers (04-scoring-ranking-spec.md §4). Not a
// "good/bad planet" classification -- these feed the tension-penalty term
// and coherence, while support is computed independently from relevance
// (CLAUDE.md §11: "do not globally classify a planet as bad").
const BASELINE_TENSION: Record<Body, number> = {
  Sun: 0.15,
  Moon: 0.2,
  Mercury: 0.1,
  Venus: 0.08,
  Mars: 0.45,
  Jupiter: 0.1,
  Saturn: 0.5,
  Uranus: 0.4,
  Neptune: 0.45,
  Pluto: 0.5
};

export function baselineTension(body: Body): number {
  return BASELINE_TENSION[body];
}
