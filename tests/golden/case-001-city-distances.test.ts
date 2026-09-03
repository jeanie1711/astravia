import { describe, expect, it } from "vitest";
import { computeCityInfluencesAcrossScenarios } from "../../src/astro/sensitivity.js";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../src/astro/time.js";
import type { City } from "../../src/astro/types.js";

// Golden Case 001 city-behavior fixtures (07-golden-test-cases.md §4).
// Tolerances per §2: MC/IC city distance +-10 km, ASC/DSC city distance
// +-25 km (sampled-point MVP implementation).
const MC_TOLERANCE_KM = 10;
const ASC_DSC_TOLERANCE_KM = 25;

const stockholm: City = {
  id: "stockholm",
  name: "Stockholm",
  countryCode: "SE",
  countryName: "Sweden",
  latitude: 59.3293,
  longitude: 18.0686
};

const turku: City = {
  id: "turku",
  name: "Turku",
  countryCode: "FI",
  countryName: "Finland",
  latitude: 60.4518,
  longitude: 22.2666
};

function resolveScenarios() {
  const resolution = resolveBirthInstant({
    birthDate: "1987-11-17",
    birthLocalTime: "17:30",
    birthPlaceLabel: "Nha Trang, Vietnam",
    latitude: 12.2388,
    longitude: 109.1967,
    timeZoneId: "Asia/Ho_Chi_Minh"
  });
  if (!resolution.ok) {
    throw new Error(`Could not resolve Case 001 baseline instant: ${JSON.stringify(resolution.error)}`);
  }
  return buildUncertaintyScenarios(resolution.resolved.utcIso, 15);
}

describe("Golden Case 001 - city distance fixtures", () => {
  const scenarios = resolveScenarios();
  const results = computeCityInfluencesAcrossScenarios(scenarios, [stockholm, turku]);

  function scenarioDistances(cityId: string, body: string, angle: string): number[] {
    const match = results.find(
      (r) => r.cityInfluence.cityId === cityId && r.cityInfluence.body === body && r.cityInfluence.angle === angle
    );
    if (!match) throw new Error(`No result for ${cityId} ${body}-${angle}`);
    return match.cityInfluence.scenarioDistancesKm;
  }

  it("Stockholm Sun-MC matches the reference fixture (~249 / 38 / 176 km)", () => {
    const [d1715, d1730, d1745] = scenarioDistances("stockholm", "Sun", "MC");
    expect(Math.abs(d1715! - 249)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
    expect(Math.abs(d1730! - 38)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
    expect(Math.abs(d1745! - 176)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
  });

  it("Stockholm Neptune-ASC matches the reference fixture (~109 / 39 / 172 km)", () => {
    const [d1715, d1730, d1745] = scenarioDistances("stockholm", "Neptune", "ASC");
    expect(Math.abs(d1715! - 109)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
    expect(Math.abs(d1730! - 39)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
    expect(Math.abs(d1745! - 172)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
  });

  it("Turku Sun-MC matches the reference fixture (~12 / 195 / 400 km)", () => {
    const [d1715, d1730, d1745] = scenarioDistances("turku", "Sun", "MC");
    expect(Math.abs(d1715! - 12)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
    expect(Math.abs(d1730! - 195)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
    expect(Math.abs(d1745! - 400)).toBeLessThanOrEqual(MC_TOLERANCE_KM);
  });

  it("Turku Venus-ASC matches the reference fixture (~420 / 490 / 547 km)", () => {
    const [d1715, d1730, d1745] = scenarioDistances("turku", "Venus", "ASC");
    expect(Math.abs(d1715! - 420)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
    expect(Math.abs(d1730! - 490)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
    expect(Math.abs(d1745! - 547)).toBeLessThanOrEqual(ASC_DSC_TOLERANCE_KM);
  });
});
