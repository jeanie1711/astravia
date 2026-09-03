// Normalizes any longitude/angle in degrees to the half-open range [-180, 180).
// Spec: 03-astro-calculation-spec.md §7.
export function normalizeLon(x: number): number {
  return (((x + 180) % 360) + 360) % 360 - 180;
}
