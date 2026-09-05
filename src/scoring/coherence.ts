import type { CandidateInfluence, CoherenceLabel } from "./types";

// Coherence tier from the CATEGORY pair alone (04-scoring-ranking-spec.md
// §6, v0.2). Domain/angle is irrelevant here -- two influences on the same
// angle can still be a mismatched category pair, and two on different
// angles can both be easeful. Replaces the v0.1 25-pair hand-authored
// lookup table (06-interpretation-library.md §3) with one rule derived
// from the classification already established in category.ts.
const CHALLENGING = new Set(["Malefic", "Transformative"]);

function isChallenging(candidate: CandidateInfluence): boolean {
  return CHALLENGING.has(candidate.category);
}

// Resolves the coherence label for a primary + its strongest secondary/
// paran. A lone primary with no secondary at all has nothing to cohere or
// conflict with -- callers should use "NONE" for that case rather than
// calling this function (see internal-score.ts).
export function resolveCoherence(
  primary: CandidateInfluence,
  secondary: CandidateInfluence
): Exclude<CoherenceLabel, "NONE"> {
  const challengingCount = [primary, secondary].filter(isChallenging).length;
  if (challengingCount === 0) return "REINFORCING";
  if (challengingCount === 1) return "LAYERED";
  return "COMPLEX_EFFORTFUL";
}
