import { distanceToParanKm } from "./geo-distance";
import type { Paran } from "./parans";
import type { City } from "./types";

const NOT_USED_THRESHOLD_KM = 750; // same cutoff as regular lines (spec §5)

export type CityParanDistance = {
  cityId: string;
  paran: Paran;
  distanceKm: number;
};

// City-to-paran distances for one instant (03-astro-calculation-spec.md
// §19.6). Filtered to <750km at this stage, unlike computeCityDistancesAtInstant
// for regular lines (which filters later, in buildCandidateInfluences) --
// there are ~6x more parans than lines for a given chart, so filtering
// here avoids holding a much larger, mostly-irrelevant intermediate array.
export function computeCityParanDistancesAtInstant(parans: Paran[], cities: City[]): CityParanDistance[] {
  const results: CityParanDistance[] = [];
  for (const city of cities) {
    for (const paran of parans) {
      const distanceKm = distanceToParanKm(city.latitude, paran.latitudeDeg);
      if (distanceKm >= NOT_USED_THRESHOLD_KM) continue;
      results.push({ cityId: city.id, paran, distanceKm });
    }
  }
  return results;
}
