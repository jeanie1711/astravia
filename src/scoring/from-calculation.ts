import type { CityInfluenceSensitivity } from "../astro/sensitivity";
import type { RawInfluenceDistance } from "./select-influences";
import type { ScenarioInfluences } from "./stability";

// Adapts src/astro/sensitivity.ts's per-city calculation output into the
// ScenarioInfluences shape the scoring layer consumes. This is the one
// place that bridges calculation output to scoring input -- it does not
// interpret or weight anything, only reshapes data (CLAUDE.md §3 layer
// separation).
export function toScenarioInfluences(cityInfluences: CityInfluenceSensitivity[]): ScenarioInfluences {
  const lower: RawInfluenceDistance[] = [];
  const baseline: RawInfluenceDistance[] = [];
  const upper: RawInfluenceDistance[] = [];

  for (const { cityInfluence } of cityInfluences) {
    const [lowerKm, baselineKm, upperKm] = cityInfluence.scenarioDistancesKm;
    if (lowerKm === undefined || baselineKm === undefined || upperKm === undefined) {
      throw new Error(
        `Expected 3 scenario distances for ${cityInfluence.cityId} ${cityInfluence.body}-${cityInfluence.angle}`
      );
    }
    lower.push({ body: cityInfluence.body, angle: cityInfluence.angle, distanceKm: lowerKm });
    baseline.push({ body: cityInfluence.body, angle: cityInfluence.angle, distanceKm: baselineKm });
    upper.push({ body: cityInfluence.body, angle: cityInfluence.angle, distanceKm: upperKm });
  }

  return { lower, baseline, upper };
}
