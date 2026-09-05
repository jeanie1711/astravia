export const MODEL_VERSIONS = {
  calculation: "0.1",
  // Canonical Astrocartography framework (docs/PROPOSAL-canonical-
  // framework.md, approved + implemented 2026-09-05): planetary category
  // classification replaces the goal-relevance matrix, richness formula
  // replaces the 5-term score, coherence is a category-pair tier. Parans
  // (04-scoring-ranking-spec.md §5.1) are specified but not yet
  // implemented -- see §16 there.
  scoring: "1.0",
  interpretation: "1.0"
} as const;
