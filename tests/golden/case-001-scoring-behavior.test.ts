import { describe, expect, it } from "vitest";
import { toScenarioInfluences } from "../../src/scoring/from-calculation.js";
import { scoreCity } from "../../src/scoring/score-city.js";
import { computeCityInfluencesAcrossScenarios } from "../../src/astro/sensitivity.js";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../src/astro/time.js";
import type { City } from "../../src/astro/types.js";

// Golden Case 001 *behavioral* fixtures (07-golden-test-cases.md §4) --
// this is the calculation+scoring integration point, distinct from the
// pure-distance fixtures already covered in case-001-city-distances.test.ts.
const stockholm: City = { id: "stockholm", name: "Stockholm", countryCode: "SE", countryName: "Sweden", latitude: 59.3293, longitude: 18.0686 };
const turku: City = { id: "turku", name: "Turku", countryCode: "FI", countryName: "Finland", latitude: 60.4518, longitude: 22.2666 };
const lisbon: City = { id: "lisbon", name: "Lisbon", countryCode: "PT", countryName: "Portugal", latitude: 38.7223, longitude: -9.1393 };

function resolveScenarios() {
  const resolution = resolveBirthInstant({
    birthDate: "1987-11-17",
    birthLocalTime: "17:30",
    birthPlaceLabel: "Nha Trang, Vietnam",
    latitude: 12.2388,
    longitude: 109.1967,
    timeZoneId: "Asia/Ho_Chi_Minh"
  });
  if (!resolution.ok) throw new Error("Could not resolve Case 001 baseline instant");
  return buildUncertaintyScenarios(resolution.resolved.utcIso, 15);
}

describe("Golden Case 001 - scoring behavior fixtures", () => {
  const scenarios = resolveScenarios();
  const results = computeCityInfluencesAcrossScenarios(scenarios, [stockholm, turku, lisbon]);

  function scenarioInfluencesFor(cityId: string) {
    return toScenarioInfluences(results.filter((r) => r.cityInfluence.cityId === cityId));
  }

  it("Stockholm Career: Sun-MC is primary, Neptune-ASC is a secondary influence, stability is HIGH", () => {
    const result = scoreCity("stockholm", "CAREER", scenarioInfluencesFor("stockholm"), 15);
    expect(result.primaryInfluence).toEqual({ body: "Sun", angle: "MC" });
    expect(result.secondaryInfluences).toContainEqual({ body: "Neptune", angle: "ASC" });
    expect(result.stability).toBe("HIGH");
    // Must not be described as purely easy/beneficial: Sun-MC + Neptune-ASC
    // is documented as MEDIUM coherence (visibility + ambiguity trade-off).
    expect(result.coherence).toBe("MEDIUM");
  });

  it("Turku Career: Sun-MC is primary and should outrank a city with no relevant line", () => {
    const result = scoreCity("turku", "CAREER", scenarioInfluencesFor("turku"), 15);
    expect(result.primaryInfluence).toEqual({ body: "Sun", angle: "MC" });
    expect(["HIGH", "MEDIUM"]).toContain(result.stability); // spec: "depending finalized threshold implementation"

    const noLineScenarios = {
      lower: [{ body: "Sun" as const, angle: "MC" as const, distanceKm: 5000 }],
      baseline: [{ body: "Sun" as const, angle: "MC" as const, distanceKm: 5000 }],
      upper: [{ body: "Sun" as const, angle: "MC" as const, distanceKm: 5000 }]
    };
    const noLineResult = scoreCity("nowhere", "CAREER", noLineScenarios, 15);
    expect(result.internalScore).toBeGreaterThan(noLineResult.internalScore);
  });

  it("Lisbon Home: Jupiter-IC is TIME_SENSITIVE (hard regression guard, not a stable 5-star home base)", () => {
    const result = scoreCity("lisbon", "HOME", scenarioInfluencesFor("lisbon"), 15);
    expect(result.stability).toBe("TIME_SENSITIVE");
    expect(result.stars).toBeLessThan(5);
  });
});
