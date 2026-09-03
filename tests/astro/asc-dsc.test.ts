import { describe, expect, it } from "vitest";
import {
  ASC_DSC_LATITUDE_MAX,
  ASC_DSC_LATITUDE_MIN,
  ASC_DSC_LATITUDE_STEP,
  computeAscDscLines,
  horizonHourAngleDeg,
  splitIntoSegments,
  type Point
} from "../../src/astro/asc-dsc.js";
import { normalizeLon } from "../../src/astro/normalize.js";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// Independent re-implementation of the horizon altitude equation (spec §9),
// used only to verify emitted points from the other direction (G003).
function altitudeDeg(latDeg: number, decDeg: number, hourAngleDeg: number): number {
  const phi = latDeg * DEG_TO_RAD;
  const dec = decDeg * DEG_TO_RAD;
  const H = hourAngleDeg * DEG_TO_RAD;
  const sinH = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  return Math.asin(Math.max(-1, Math.min(1, sinH))) * RAD_TO_DEG;
}

describe("horizonHourAngleDeg", () => {
  it("returns undefined for circumpolar declination/latitude combinations", () => {
    // At high latitude with a body of comparable declination, the body
    // never crosses the horizon: |tan(phi) * tan(dec)| > 1.
    expect(horizonHourAngleDeg(80, 75)).toBeUndefined();
  });

  it("returns a value in [0, 180] when a rise/set solution exists", () => {
    const h0 = horizonHourAngleDeg(45, 10);
    expect(h0).toBeDefined();
    expect(h0!).toBeGreaterThanOrEqual(0);
    expect(h0!).toBeLessThanOrEqual(180);
  });
});

describe("computeAscDscLines", () => {
  const raDeg = 123.456;
  const decDeg = 15.789;
  const gstDeg = 77.111;

  it("G003: every emitted ASC/DSC point sits on the geometric horizon (altitude ~ 0)", () => {
    const lines = computeAscDscLines("Sun", raDeg, decDeg, gstDeg);
    let checked = 0;
    for (const line of lines) {
      for (const point of line.points ?? []) {
        const lst = gstDeg + point.lon;
        const H = normalizeLon(lst - raDeg);
        const alt = altitudeDeg(point.lat, decDeg, H);
        expect(Math.abs(alt)).toBeLessThan(1e-6);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("G004: rise/set hour angles are symmetric (-H0 and +H0) at a given latitude", () => {
    const lat = 30;
    const h0 = horizonHourAngleDeg(lat, decDeg)!;
    expect(h0).toBeDefined();

    const lines = computeAscDscLines("Sun", raDeg, decDeg, gstDeg);
    const ascPoint = lines
      .filter((l) => l.angle === "ASC")
      .flatMap((l) => l.points ?? [])
      .find((p) => Math.abs(p.lat - lat) < 1e-9);
    const dscPoint = lines
      .filter((l) => l.angle === "DSC")
      .flatMap((l) => l.points ?? [])
      .find((p) => Math.abs(p.lat - lat) < 1e-9);

    expect(ascPoint).toBeDefined();
    expect(dscPoint).toBeDefined();

    const ascH = normalizeLon(gstDeg + ascPoint!.lon - raDeg);
    const dscH = normalizeLon(gstDeg + dscPoint!.lon - raDeg);
    expect(ascH).toBeCloseTo(-h0, 6);
    expect(dscH).toBeCloseTo(h0, 6);
  });

  it("G005: never fabricates a point where no rise/set solution exists", () => {
    // A high declination (near-circumpolar for much of the sampled range)
    // must leave gaps rather than clamping to a fabricated point.
    const lines = computeAscDscLines("Sun", raDeg, 89, gstDeg);
    const allLats = lines.flatMap((l) => (l.points ?? []).map((p) => p.lat));
    for (const lat of allLats) {
      expect(horizonHourAngleDeg(lat, 89)).toBeDefined();
    }
    // and confirm the sampled range is not fully covered (gaps exist)
    const stepsCount = Math.round(
      (ASC_DSC_LATITUDE_MAX - ASC_DSC_LATITUDE_MIN) / ASC_DSC_LATITUDE_STEP
    );
    expect(new Set(allLats).size).toBeLessThan(stepsCount + 1);
  });
});

describe("splitIntoSegments (G008 antimeridian handling)", () => {
  it("breaks a run when longitude jumps across the antimeridian", () => {
    const points: Array<Point | undefined> = [
      { lat: 0, lon: 179 },
      { lat: 0.25, lon: 179.5 },
      { lat: 0.5, lon: -179.5 }, // crossed the antimeridian
      { lat: 0.75, lon: -179 }
    ];
    const segments = splitIntoSegments(points);
    expect(segments).toHaveLength(2);
    expect(segments[0]).toHaveLength(2);
    expect(segments[1]).toHaveLength(2);
  });

  it("breaks a run on a circumpolar gap (undefined slot)", () => {
    const points: Array<Point | undefined> = [
      { lat: 0, lon: 10 },
      { lat: 0.25, lon: 11 },
      undefined,
      { lat: 0.75, lon: 12 }
    ];
    const segments = splitIntoSegments(points);
    expect(segments).toHaveLength(2);
  });
});
