import { computeCityDistancesAtInstant } from "./city-proximity.js";
import { classifyStrengthBand } from "./geo-distance.js";
import { computeAllLinesAtInstant } from "./lines.js";
import type { City, CityInfluence, Sensitivity, UncertaintyScenarios } from "./types.js";

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

// Runs the full astronomy calculation independently for each of the three
// uncertainty scenario instants (G007: no scenario may be derived by
// shifting another scenario's result) and assembles the per-city,
// per-influence CityInfluence + Sensitivity output.
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

  const results: CityInfluenceSensitivity[] = [];

  for (let i = 0; i < baselineDistances.length; i++) {
    const baseline = baselineDistances[i]!;
    const scenarioDistancesKm = perInstantDistances.map((distances) => {
      const match = distances.find(
        (d) => d.cityId === baseline.cityId && d.body === baseline.body && d.angle === baseline.angle
      );
      if (!match) {
        throw new Error(
          `Missing scenario distance for ${baseline.cityId} ${baseline.body}-${baseline.angle}`
        );
      }
      return match.distanceKm;
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
