import { lookupCombinationRule } from "./combination-rules";
import type { CandidateInfluence, CoherenceLabel, ScorableGoal } from "./types";

const HIGH_TENSION_THRESHOLD = 0.4;

// Fallback used when no explicit combination rule (06-interpretation-
// library.md §3) covers a primary/secondary pair. Spec §6 only gives
// worked examples, not a general procedure, so this generalizes from the
// documented examples' own pattern: pairs of two low-tension bodies are
// documented as HIGH (e.g. Sun-MC + Mercury-MC), a mix of low/high tension
// as MEDIUM (e.g. Sun-MC + Neptune-ASC), and two high-tension bodies as LOW
// (e.g. Mars + Pluto). Logged as a scoring default in docs/DECISIONS.md.
function fallbackCoherence(primaryTension: number, secondaryTension: number): CoherenceLabel {
  const highCount = [primaryTension, secondaryTension].filter((t) => t >= HIGH_TENSION_THRESHOLD).length;
  if (highCount === 2) return "LOW";
  if (highCount === 1) return "MEDIUM";
  return "HIGH";
}

// Resolves the coherence label for a city/goal from its selected primary
// and secondary influences (spec §6). A lone primary with no meaningful
// secondary has nothing to cohere or conflict with; per the documented
// default this resolves to MEDIUM (a clean single-signal story, neither
// reinforced nor undercut).
export function resolveCoherence(
  goal: ScorableGoal,
  primary: CandidateInfluence | undefined,
  secondary: CandidateInfluence[]
): CoherenceLabel {
  if (!primary || secondary.length === 0) {
    return "MEDIUM";
  }

  const [strongestSecondary] = secondary;
  const explicit = lookupCombinationRule(primary, strongestSecondary!, goal);
  if (explicit) return explicit;

  return fallbackCoherence(primary.tension, strongestSecondary!.tension);
}
