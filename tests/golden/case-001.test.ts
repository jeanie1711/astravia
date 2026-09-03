import { describe, expect, it } from "vitest";
import { equatorialOfDate } from "../../src/astro/ephemeris.js";
import { icLongitude, mcLongitude } from "../../src/astro/mc-ic.js";
import { normalizeLon } from "../../src/astro/normalize.js";
import { greenwichSiderealTimeDeg } from "../../src/astro/sidereal.js";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../src/astro/time.js";
import type { Body } from "../../src/astro/types.js";

// Golden Case 001 (07-golden-test-cases.md §3): 1987-11-17, Nha Trang,
// Vietnam, Asia/Ho_Chi_Minh, local scenarios 17:15 / 17:30 / 17:45.
// Reference fixture source: prior Swiss Ephemeris calculation, used as a
// regression benchmark against astronomy-engine with tolerance, not as a
// bit-identical requirement (CLAUDE.md §9).
const MC_LONGITUDE_TOLERANCE_DEG = 0.2;

// Expected MC longitudes (degrees, east positive) at 17:15 / 17:30 / 17:45.
const EXPECTED_MC: Record<Body, [number, number, number]> = {
  Jupiter: [170.37, 166.61, 162.84],
  Mars: [-5.64, -9.4, -13.15],
  Mercury: [4.81, 1.06, -2.68],
  Moon: [-23.45, -27.09, -30.74],
  Neptune: [67.02, 63.26, 59.5],
  Pluto: [13.23, 9.47, 5.71],
  Saturn: [49.82, 46.06, 42.3],
  Sun: [22.47, 18.72, 14.97],
  Uranus: [54.89, 51.13, 47.37],
  Venus: [45.83, 42.08, 38.34]
};

function resolveScenarioUtc(): [string, string, string] {
  const resolution = resolveBirthInstant({
    birthDate: "1987-11-17",
    birthLocalTime: "17:30",
    birthPlaceLabel: "Nha Trang, Vietnam",
    // Case 001's MC/IC fixtures depend only on the resolved UTC instant,
    // not on birth latitude/longitude (those feed city-line distance
    // checks for destination cities, not the birth chart's own angles).
    latitude: 12.2388,
    longitude: 109.1967,
    timeZoneId: "Asia/Ho_Chi_Minh"
  });
  if (!resolution.ok) {
    throw new Error(`Could not resolve Case 001 baseline instant: ${JSON.stringify(resolution.error)}`);
  }
  const scenarios = buildUncertaintyScenarios(resolution.resolved.utcIso, 15);
  return [scenarios.lowerUtcIso, scenarios.baselineUtcIso, scenarios.upperUtcIso];
}

describe("Golden Case 001 - MC longitude table", () => {
  const [t1715, t1730, t1745] = resolveScenarioUtc();

  it("resolves the three local-time scenarios to the expected UTC instants", () => {
    expect(t1715).toBe("1987-11-17T10:15:00Z");
    expect(t1730).toBe("1987-11-17T10:30:00Z");
    expect(t1745).toBe("1987-11-17T10:45:00Z");
  });

  for (const [body, expected] of Object.entries(EXPECTED_MC) as Array<
    [Body, [number, number, number]]
  >) {
    it(`${body} MC longitude matches the reference fixture within +-${MC_LONGITUDE_TOLERANCE_DEG} deg`, () => {
      const scenarioTimes = [t1715, t1730, t1745];
      scenarioTimes.forEach((utcIso, i) => {
        const gstDeg = greenwichSiderealTimeDeg(utcIso);
        const { raDeg } = equatorialOfDate(body, utcIso);
        const mc = mcLongitude(raDeg, gstDeg);

        const diff = Math.abs(normalizeLon(mc - expected[i]!));
        expect(diff).toBeLessThanOrEqual(MC_LONGITUDE_TOLERANCE_DEG);
      });
    });
  }

  it("IC = MC + 180 for every body/time (G001 tie-in with real fixture data)", () => {
    const scenarioTimes = [t1715, t1730, t1745];
    for (const body of Object.keys(EXPECTED_MC) as Body[]) {
      for (const utcIso of scenarioTimes) {
        const gstDeg = greenwichSiderealTimeDeg(utcIso);
        const { raDeg } = equatorialOfDate(body, utcIso);
        const mc = mcLongitude(raDeg, gstDeg);
        const ic = icLongitude(mc);
        const raw = Math.abs(normalizeLon(mc - ic));
        expect(Math.min(raw, 360 - raw)).toBeCloseTo(180, 6);
      }
    }
  });

  it("Jupiter IC sensitivity matches the reference fixture (important: Portugal moves materially)", () => {
    const expectedIc: [number, number, number] = [-9.633, -13.394, -17.155];
    const scenarioTimes = [t1715, t1730, t1745];
    scenarioTimes.forEach((utcIso, i) => {
      const gstDeg = greenwichSiderealTimeDeg(utcIso);
      const { raDeg } = equatorialOfDate("Jupiter", utcIso);
      const mc = mcLongitude(raDeg, gstDeg);
      const ic = icLongitude(mc);
      const diff = Math.abs(normalizeLon(ic - expectedIc[i]!));
      expect(diff).toBeLessThanOrEqual(MC_LONGITUDE_TOLERANCE_DEG);
    });
  });
});
