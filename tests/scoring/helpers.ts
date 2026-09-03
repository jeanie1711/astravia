import { ANGLES, BODIES, type Angle, type Body } from "../../src/astro/types.js";
import type { RawInfluenceDistance } from "../../src/scoring/select-influences.js";
import type { ScenarioInfluences } from "../../src/scoring/stability.js";

const FAR_DISTANCE_KM = 5000; // effectively "not used" (>>750km)

// Builds a full 40-entry influence-distance list (every body x angle),
// defaulted to "not used" distance, with the given overrides applied.
export function buildInfluences(
  overrides: Array<{ body: Body; angle: Angle; distanceKm: number }>
): RawInfluenceDistance[] {
  const influences: RawInfluenceDistance[] = [];
  for (const body of BODIES) {
    for (const angle of ANGLES) {
      const override = overrides.find((o) => o.body === body && o.angle === angle);
      influences.push({ body, angle, distanceKm: override ? override.distanceKm : FAR_DISTANCE_KM });
    }
  }
  return influences;
}

// Builds ScenarioInfluences where a single tracked influence has three
// different distances across lower/baseline/upper, and everything else
// stays fixed (or "not used") across all three scenarios.
export function buildScenarios(params: {
  tracked: { body: Body; angle: Angle; distancesKm: [number, number, number] };
  otherFixed?: Array<{ body: Body; angle: Angle; distanceKm: number }>;
}): ScenarioInfluences {
  const { tracked, otherFixed = [] } = params;
  const [lowerD, baselineD, upperD] = tracked.distancesKm;

  return {
    lower: buildInfluences([...otherFixed, { body: tracked.body, angle: tracked.angle, distanceKm: lowerD }]),
    baseline: buildInfluences([...otherFixed, { body: tracked.body, angle: tracked.angle, distanceKm: baselineD }]),
    upper: buildInfluences([...otherFixed, { body: tracked.body, angle: tracked.angle, distanceKm: upperD }])
  };
}
