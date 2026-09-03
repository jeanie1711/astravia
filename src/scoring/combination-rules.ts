import type { Angle, Body } from "../astro/types";
import type { CoherenceLabel, Influence, ScorableGoal } from "./types";

// Coherence classification extracted from 06-interpretation-library.md §3's
// 25 combination rules. Only the *classification* (which goals, which
// label) lives here; narrative synthesis phrases stay in the interpretation
// layer, which composes prose from this same rule identity later in the
// pipeline (calculation -> scoring/ranking -> interpretation, CLAUDE.md §3).
// This keeps scoring self-contained: it never imports from src/interpretation.
//
// Where the source doc lists two labels ambiguously with a single goal
// (e.g. "HIGH/MEDIUM Career"), this table picks the more conservative
// (lower) label as a documented default -- consistent with the spec's
// repeated instruction not to over-claim positive outcomes. Where the
// labels visibly pair with goals positionally (e.g. "HIGH/MEDIUM
// Career/Love" reading as HIGH-for-Career, MEDIUM-for-Love), that pairing
// is used instead. Flagged per rule below.
type GoalLabels = Partial<Record<ScorableGoal, CoherenceLabel>>;

// Exported so the interpretation layer can key its own synthesis-phrase
// table by the same pair identity, without duplicating this logic.
export function influenceKey(body: Body, angle: Angle): string {
  return `${body}-${angle}`;
}

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join("|");
}

const EXACT_PAIR_RULES = new Map<string, GoalLabels>();
const BODY_PAIR_RULES = new Map<string, GoalLabels>();

function addExactRule(a: Influence, b: Influence, labels: GoalLabels): void {
  EXACT_PAIR_RULES.set(pairKey(influenceKey(a.body, a.angle), influenceKey(b.body, b.angle)), labels);
}

function addBodyRule(a: Body, b: Body, labels: GoalLabels): void {
  BODY_PAIR_RULES.set(pairKey(a, b), labels);
}

const sunMc: Influence = { body: "Sun", angle: "MC" };
const venusAsc: Influence = { body: "Venus", angle: "ASC" };
const mercuryMc: Influence = { body: "Mercury", angle: "MC" };

// 1. Sun-MC + Jupiter-MC -- HIGH Career
addExactRule(sunMc, { body: "Jupiter", angle: "MC" }, { CAREER: "HIGH" });
// 2. Sun-MC + Mercury-MC -- HIGH Career
addExactRule(sunMc, mercuryMc, { CAREER: "HIGH" });
// 3. Sun-MC + Venus-ASC -- HIGH/MEDIUM Career/Love (positional: HIGH-Career, MEDIUM-Love)
addExactRule(sunMc, venusAsc, { CAREER: "HIGH", LOVE: "MEDIUM" });
// 4. Sun-MC + Neptune-ASC -- MEDIUM Career
addExactRule(sunMc, { body: "Neptune", angle: "ASC" }, { CAREER: "MEDIUM" });
// 5. Sun-MC + Saturn-ASC -- MEDIUM Career/Growth
addExactRule(sunMc, { body: "Saturn", angle: "ASC" }, { CAREER: "MEDIUM", GROWTH: "MEDIUM" });
// 6. Sun-MC + Pluto-MC/ASC -- MEDIUM Career/Growth
addExactRule(sunMc, { body: "Pluto", angle: "MC" }, { CAREER: "MEDIUM", GROWTH: "MEDIUM" });
addExactRule(sunMc, { body: "Pluto", angle: "ASC" }, { CAREER: "MEDIUM", GROWTH: "MEDIUM" });
// 7. Venus-ASC + Jupiter-ASC/DSC -- HIGH Love/Growth
addExactRule(venusAsc, { body: "Jupiter", angle: "ASC" }, { LOVE: "HIGH", GROWTH: "HIGH" });
addExactRule(venusAsc, { body: "Jupiter", angle: "DSC" }, { LOVE: "HIGH", GROWTH: "HIGH" });
// 8. Venus-ASC + Saturn-ASC -- MEDIUM Love/Growth
addExactRule(venusAsc, { body: "Saturn", angle: "ASC" }, { LOVE: "MEDIUM", GROWTH: "MEDIUM" });
// 9. Venus-ASC + Uranus-ASC -- MEDIUM Love/Growth
addExactRule(venusAsc, { body: "Uranus", angle: "ASC" }, { LOVE: "MEDIUM", GROWTH: "MEDIUM" });
// 10. Venus-ASC + Neptune-ASC -- MEDIUM Love/Growth
addExactRule(venusAsc, { body: "Neptune", angle: "ASC" }, { LOVE: "MEDIUM", GROWTH: "MEDIUM" });
// 11. Moon-IC + Jupiter-IC -- HIGH Home
addExactRule({ body: "Moon", angle: "IC" }, { body: "Jupiter", angle: "IC" }, { HOME: "HIGH" });
// 12. Moon-IC + Venus-IC -- HIGH Home/Love
addExactRule({ body: "Moon", angle: "IC" }, { body: "Venus", angle: "IC" }, { HOME: "HIGH", LOVE: "HIGH" });
// 13. Jupiter-IC + Venus-IC -- HIGH Home/Love
addExactRule({ body: "Jupiter", angle: "IC" }, { body: "Venus", angle: "IC" }, { HOME: "HIGH", LOVE: "HIGH" });
// 14. Mercury-MC + Jupiter-MC -- HIGH Career
addExactRule(mercuryMc, { body: "Jupiter", angle: "MC" }, { CAREER: "HIGH" });
// 15. Mercury-MC + Uranus-MC/ASC -- HIGH/MEDIUM Career/Growth (positional)
addExactRule(mercuryMc, { body: "Uranus", angle: "MC" }, { CAREER: "HIGH", GROWTH: "MEDIUM" });
addExactRule(mercuryMc, { body: "Uranus", angle: "ASC" }, { CAREER: "HIGH", GROWTH: "MEDIUM" });
// 16. Mars-MC + Jupiter-MC -- HIGH/MEDIUM Career (conservative default: MEDIUM)
addExactRule({ body: "Mars", angle: "MC" }, { body: "Jupiter", angle: "MC" }, { CAREER: "MEDIUM" });
// 17. Mars-MC + Saturn-MC -- MEDIUM Career
addExactRule({ body: "Mars", angle: "MC" }, { body: "Saturn", angle: "MC" }, { CAREER: "MEDIUM" });

// 18-25: body-level "strong" pairs (spec does not tie these to a specific
// angle combination).
// 18. Mars + Pluto strong -- LOW/MEDIUM (conservative default: LOW, all goals)
addBodyRule("Mars", "Pluto", { CAREER: "LOW", LOVE: "LOW", HOME: "LOW", GROWTH: "LOW" });
// 19. Saturn + Pluto strong -- LOW/MEDIUM (conservative default: LOW, all goals)
addBodyRule("Saturn", "Pluto", { CAREER: "LOW", LOVE: "LOW", HOME: "LOW", GROWTH: "LOW" });
// 20. Uranus + Neptune strong -- MEDIUM Growth
addBodyRule("Uranus", "Neptune", { GROWTH: "MEDIUM" });
// 21. Uranus + Saturn strong -- MEDIUM Growth/Career
addBodyRule("Uranus", "Saturn", { GROWTH: "MEDIUM", CAREER: "MEDIUM" });
// 22. Neptune + Jupiter strong -- MEDIUM/HIGH Growth (conservative default: MEDIUM)
addBodyRule("Neptune", "Jupiter", { GROWTH: "MEDIUM" });
// 23. Moon + Neptune strong -- MEDIUM Home/Love/Growth
addBodyRule("Moon", "Neptune", { HOME: "MEDIUM", LOVE: "MEDIUM", GROWTH: "MEDIUM" });
// 24. Venus + Pluto strong -- MEDIUM Love/Growth
addBodyRule("Venus", "Pluto", { LOVE: "MEDIUM", GROWTH: "MEDIUM" });
// 25. Mercury + Neptune strong -- MEDIUM Career/Growth
addBodyRule("Mercury", "Neptune", { CAREER: "MEDIUM", GROWTH: "MEDIUM" });

// Looks up an explicit combination-rule label for a pair of influences and
// a goal. Returns undefined when no documented rule covers this pair/goal
// (callers fall back to the tension-based heuristic in coherence.ts).
export function lookupCombinationRule(a: Influence, b: Influence, goal: ScorableGoal): CoherenceLabel | undefined {
  const exact = EXACT_PAIR_RULES.get(pairKey(influenceKey(a.body, a.angle), influenceKey(b.body, b.angle)));
  if (exact && exact[goal]) return exact[goal];

  const byBody = BODY_PAIR_RULES.get(pairKey(a.body, b.body));
  if (byBody && byBody[goal]) return byBody[goal];

  return undefined;
}
