import type { ScorableGoal } from "../../scoring/types";
import { SCORABLE_GOALS } from "../../scoring/types";

// "What matters most in this chapter?" (product feedback 2026-09-06, item
// 13). Deliberately presentation-layer only, per the Product Owner's
// explicit decision (docs/DECISIONS.md, 2026-09-06): these priorities map
// onto the 4 existing goals and only influence which goal is calculated
// first and how the results-page goal tabs are ordered. They never touch
// internalScore/ranking -- no version bump, no new Golden Tests needed.
export type LifePriorityId =
  | "CAREER_MEANING"
  | "FREEDOM"
  | "BELONGING"
  | "FAMILY_STABILITY"
  | "REINVENTION"
  | "DEEPER_RELATIONSHIPS"
  | "CREATIVE_ENERGY"
  | "SLOWER_LIFE";

export type LifePriority = { id: LifePriorityId; label: string; goal: ScorableGoal };

// The goal mapping is a subjective editorial call, not a derived fact --
// recorded here (and in DECISIONS.md) so it can be revisited. "More
// freedom," "Reinvention," and "Creative energy" all read closer to
// personal growth/independence than to career or love; "A sense of
// belonging," "Family stability," and "A slower life" all read closer to
// home/rootedness than to reinvention.
export const LIFE_PRIORITIES: LifePriority[] = [
  { id: "CAREER_MEANING", label: "A meaningful career", goal: "CAREER" },
  { id: "FREEDOM", label: "More freedom", goal: "GROWTH" },
  { id: "BELONGING", label: "A sense of belonging", goal: "HOME" },
  { id: "FAMILY_STABILITY", label: "Family stability", goal: "HOME" },
  { id: "REINVENTION", label: "Reinvention", goal: "GROWTH" },
  { id: "DEEPER_RELATIONSHIPS", label: "Deeper relationships", goal: "LOVE" },
  { id: "CREATIVE_ENERGY", label: "Creative energy", goal: "GROWTH" },
  { id: "SLOWER_LIFE", label: "A slower life", goal: "HOME" }
];

export const MAX_PRIORITIES = 3;

function priorityGoal(id: LifePriorityId): ScorableGoal {
  return LIFE_PRIORITIES.find((p) => p.id === id)!.goal;
}

// Orders the 4 goals by how many selected priorities point to them (ties
// broken by which of those goals was implied earliest in the user's own
// selection order), with any untouched goals appended afterward in the
// default CAREER/LOVE/HOME/GROWTH order. `selected[0]` of the result is
// the goal used for the first calculation.
export function deriveGoalOrder(selected: LifePriorityId[]): ScorableGoal[] {
  const votes = new Map<ScorableGoal, number>();
  const firstSeenAt = new Map<ScorableGoal, number>();
  selected.forEach((id, index) => {
    const goal = priorityGoal(id);
    votes.set(goal, (votes.get(goal) ?? 0) + 1);
    if (!firstSeenAt.has(goal)) firstSeenAt.set(goal, index);
  });

  const touched = [...votes.keys()].sort((a, b) => {
    const voteDiff = votes.get(b)! - votes.get(a)!;
    if (voteDiff !== 0) return voteDiff;
    return firstSeenAt.get(a)! - firstSeenAt.get(b)!;
  });
  const untouched = SCORABLE_GOALS.filter((g) => !votes.has(g));
  return [...touched, ...untouched];
}
