import { haversineDistanceKm } from "../astro/geo-distance";
import type { City } from "../astro/types";
import { compareByStarsThenScore } from "./rank-order";
import type { RankedCity } from "./types";

const CLUSTER_RADIUS_KM = 100;

// De-duplicates neighboring cities (spec §12): clusters cities within
// ~100 km of each other and keeps only the strongest-scoring
// representative of each cluster, so top results aren't dominated by
// several suburbs of the same metro. Greedy: process cities strongest
// first (by star tier, then raw score -- compareByStarsThenScore), skip
// any city that falls within radius of an already-kept one.
export function dedupeByProximity(
  rankedCities: RankedCity[],
  citiesById: Map<string, City>
): RankedCity[] {
  const sorted = [...rankedCities].sort(compareByStarsThenScore);
  const kept: RankedCity[] = [];

  for (const candidate of sorted) {
    const candidateCity = citiesById.get(candidate.cityId);
    if (!candidateCity) {
      throw new Error(`Unknown city id: ${candidate.cityId}`);
    }

    const isNearKept = kept.some((k) => {
      const keptCity = citiesById.get(k.cityId)!;
      return (
        haversineDistanceKm(candidateCity.latitude, candidateCity.longitude, keptCity.latitude, keptCity.longitude) <=
        CLUSTER_RADIUS_KM
      );
    });

    if (!isNearKept) {
      kept.push(candidate);
    }
  }

  return kept;
}
