import { describe, expect, it } from "vitest";
import { deriveSensitivity, computeCityInfluencesAcrossScenarios } from "../../src/astro/sensitivity.js";
import type { City } from "../../src/astro/types.js";

describe("deriveSensitivity", () => {
  it("classifies strength bands and relevance from scenario distances", () => {
    const s = deriveSensitivity(["t1", "t2", "t3"], [40, 120, 900]);
    expect(s.strengthBands).toEqual(["VERY_STRONG", "STRONG", "NOT_USED"]);
    expect(s.remainsRelevant).toBe(false);
  });

  it("remains relevant when every scenario stays within 750 km", () => {
    const s = deriveSensitivity(["t1", "t2", "t3"], [40, 300, 700]);
    expect(s.remainsRelevant).toBe(true);
  });
});

describe("computeCityInfluencesAcrossScenarios", () => {
  const stockholm: City = {
    id: "stockholm",
    name: "Stockholm",
    countryCode: "SE",
    countryName: "Sweden",
    latitude: 59.3293,
    longitude: 18.0686
  };

  it("runs the full calculation independently per scenario and assembles CityInfluence + Sensitivity", () => {
    const scenarios = {
      lowerUtcIso: "1987-11-17T10:15:00Z",
      baselineUtcIso: "1987-11-17T10:30:00Z",
      upperUtcIso: "1987-11-17T10:45:00Z"
    };

    const results = computeCityInfluencesAcrossScenarios(scenarios, [stockholm]);

    // 10 bodies x (MC + IC + >=1 ASC segment + >=1 DSC segment) at minimum
    expect(results.length).toBeGreaterThanOrEqual(40);

    const sunMc = results.find((r) => r.cityInfluence.body === "Sun" && r.cityInfluence.angle === "MC");
    expect(sunMc).toBeDefined();
    expect(sunMc!.cityInfluence.scenarioDistancesKm).toHaveLength(3);
    expect(sunMc!.cityInfluence.distanceKm).toBe(sunMc!.cityInfluence.scenarioDistancesKm[1]);
    expect(sunMc!.sensitivity.scenarioTimesUtc).toEqual([
      scenarios.lowerUtcIso,
      scenarios.baselineUtcIso,
      scenarios.upperUtcIso
    ]);
  });
});
