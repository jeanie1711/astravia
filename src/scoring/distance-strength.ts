// Continuous distance-decay function feeding the scoring model.
// Spec: 04-scoring-ranking-spec.md §3.1. Versioned via MODEL_VERSIONS.scoring
// -- any change here requires re-running the scoring Golden Tests.
export function distanceStrength(km: number): number {
  if (km >= 750) return 0;
  const x = km / 750;
  return 1 - x * x;
}
