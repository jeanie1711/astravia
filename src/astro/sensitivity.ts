import { computeCityDistancesAtInstant, type InstantCityDistance } from "./city-proximity";
import { classifyStrengthBand } from "./geo-distance";
import { computeAllLinesAtInstant } from "./lines";
import type { City, CityInfluence, Sensitivity, UncertaintyScenarios } from "./types";

const NOT_USED_THRESHOLD_KM = 750;

// Derives the Sensitivity classification (spec §13) from three
// independently-computed scenario distances for one city/influence.
export function deriveSensitivity(scenarioTimesUtc: string[], distancesKm: number[]): Sensitivity {
  return {
    scenarioTimesUtc,
    distancesKm,
    strengthBands: distancesKm.map(classifyStrengthBand),
    remainsRelevant: distancesKm.every((d) => d <= NOT_USED_THRESHOLD_KM)
  };
}

export type CityInfluenceSensitivity = {
  cityInfluence: CityInfluence;
  sensitivity: Sensitivity;
};

function distanceKey(cityId: string, body: string, angle: string): string {
  return `${cityId}|${body}|${angle}`;
}

function indexByKey(distances: InstantCityDistance[]): Map<string, number> {
  const index = new Map<string, number>();
  for (const d of distances) {
    index.set(distanceKey(d.cityId, d.body, d.angle), d.distanceKm);
  }
  return index;
}

// Runs the full astronomy calculation independently for each of the three
// uncertainty scenario instants (G007: no scenario may be derived by
// shifting another scenario's result) and assembles the per-city,
// per-influence CityInfluence + Sensitivity output.
//
// Performance fix (found 2026-09-05 alongside the geo-distance.ts fixes,
// docs/DECISIONS.md): matching each of the ~38,000 baseline entries
// against the other two scenarios previously used Array.find -- an O(n)
// linear scan repeated for every entry, making this whole function O(n^2)
// (tens of billions of comparisons for the full city dataset). Indexing
// each scenario's distances by key once (O(n)) and looking up by that
// index (O(1)) instead removes the blowup entirely with no change to the
// output.
export function computeCityInfluencesAcrossScenarios(
  scenarios: UncertaintyScenarios,
  cities: City[]
): CityInfluenceSensitivity[] {
  const scenarioTimesUtc = [scenarios.lowerUtcIso, scenarios.baselineUtcIso, scenarios.upperUtcIso];

  const perInstantDistances = scenarioTimesUtc.map((utcIso) => {
    const lines = computeAllLinesAtInstant(utcIso);
    return computeCityDistancesAtInstant(lines, cities);
  });

  const [lowerDistances, baselineDistances] = perInstantDistances;
  if (!lowerDistances || !baselineDistances) {
    throw new Error("computeCityInfluencesAcrossScenarios: expected three scenario results");
  }

  const perInstantIndex = perInstantDistances.map(indexByKey);

  const results: CityInfluenceSensitivity[] = [];

  for (let i = 0; i < baselineDistances.length; i++) {
    const baseline = baselineDistances[i]!;
    const key = distanceKey(baseline.cityId, baseline.body, baseline.angle);
    const scenarioDistancesKm = perInstantIndex.map((index) => {
      const distanceKm = index.get(key);
      if (distanceKm === undefined) {
        throw new Error(
          `Missing scenario distance for ${baseline.cityId} ${baseline.body}-${baseline.angle}`
        );
      }
      return distanceKm;
    });

    const cityInfluence: CityInfluence = {
      cityId: baseline.cityId,
      body: baseline.body,
      angle: baseline.angle,
      distanceKm: baseline.distanceKm,
      scenarioDistancesKm
    };

    results.push({
      cityInfluence,
      sensitivity: deriveSensitivity(scenarioTimesUtc, scenarioDistancesKm)
    });
  }

  return results;
}
