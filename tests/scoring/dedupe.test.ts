import { describe, expect, it } from "vitest";
import { dedupeByProximity } from "../../src/scoring/dedupe.js";
import type { City } from "../../src/astro/types.js";
import type { RankedCity } from "../../src/scoring/types.js";

function city(id: string, lat: number, lon: number): City {
  return { id, name: id, countryCode: "XX", countryName: "Testland", latitude: lat, longitude: lon };
}

function ranked(cityId: string, internalScore: number): RankedCity {
  return {
    cityId,
    goal: "CAREER",
    internalScore,
    stars: 3,
    label: "Mixed",
    primaryInfluence: undefined,
    secondaryInfluences: [],
    coherence: "MEDIUM",
    stability: "HIGH",
    archetypeId: "VISIBILITY"
  };
}

describe("dedupeByProximity", () => {
  it("keeps only the strongest city within a ~100km cluster", () => {
    const citiesById = new Map<string, City>([
      ["strong", city("strong", 59.33, 18.07)], // Stockholm
      ["weaker-nearby", city("weaker-nearby", 59.6, 17.9)] // ~30km away
    ]);
    const rankedCities = [ranked("weaker-nearby", 0.5), ranked("strong", 0.9)];

    const result = dedupeByProximity(rankedCities, citiesById);
    expect(result).toHaveLength(1);
    expect(result[0]!.cityId).toBe("strong");
  });

  it("keeps both cities when they are far apart", () => {
    const citiesById = new Map<string, City>([
      ["stockholm", city("stockholm", 59.33, 18.07)],
      ["tokyo", city("tokyo", 35.68, 139.69)]
    ]);
    const rankedCities = [ranked("stockholm", 0.9), ranked("tokyo", 0.8)];

    const result = dedupeByProximity(rankedCities, citiesById);
    expect(result).toHaveLength(2);
  });
});
