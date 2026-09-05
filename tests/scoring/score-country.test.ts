import { describe, expect, it } from "vitest";
import { computeCountryResult } from "../../src/scoring/score-country.js";
import type { RankedCity } from "../../src/scoring/types.js";

function city(cityId: string, internalScore: number): RankedCity {
  return {
    cityId,
    goal: "CAREER",
    internalScore,
    stars: 3,
    label: "Mixed",
    primaryInfluence: { body: "Sun", angle: "MC" },
    secondaryInfluences: [],
    paranInfluence: undefined,
    coherence: "REINFORCING",
    stability: "HIGH",
    archetypeId: "VISIBILITY"
  };
}

describe("S008 country is not the capital", () => {
  it("ranks the country strongly from three strong secondary cities despite a weak capital", () => {
    // Capital is weak and does not even make the top 3 -- exactly the
    // point of aggregating from the strongest distinct metros, not the
    // capital alone.
    const cities = [city("secondary-1", 0.8), city("secondary-2", 0.75), city("secondary-3", 0.7), city("capital", 0.2)].sort(
      (a, b) => b.internalScore - a.internalScore
    );

    const result = computeCountryResult("XX", cities);
    expect(result.stars).toBeGreaterThanOrEqual(4);
    expect(result.topCityIds).not.toContain("capital");
  });
});

describe("synthetic fixtures 9-10 (07-golden-test-cases.md §8)", () => {
  it("9. Country Corridor: three comparably strong cities -> 5-star, CORRIDOR narrative", () => {
    const cities = [city("a", 0.8), city("b", 0.75), city("c", 0.7)];
    const result = computeCountryResult("FI", cities);
    expect(result.narrative).toBe("CORRIDOR");
    expect(result.stars).toBe(5);
  });

  it("10. Country Anchor: one standout city, others weak -> ANCHOR narrative, not CORRIDOR", () => {
    const cities = [city("vienna", 0.85), city("other-1", 0.3), city("other-2", 0.2)];
    const result = computeCountryResult("AT", cities);
    expect(result.narrative).toBe("ANCHOR");
    expect(result.narrative).not.toBe("CORRIDOR");
  });

  it("requires at least two qualifying cities for a 5-star country rating", () => {
    const cities = [city("solo", 0.9), city("weak-1", 0.1), city("weak-2", 0.1)];
    const result = computeCountryResult("ZZ", cities);
    expect(result.stars).toBeLessThan(5);
  });
});
