import { describe, expect, it } from "vitest";
import {
  EARTH_RADIUS_KM,
  classifyStrengthBand,
  distanceToMeridianKm,
  distanceToPolylineKm,
  distanceToSegmentKm,
  haversineDistanceKm
} from "../../src/astro/geo-distance.js";
import type { Point } from "../../src/astro/asc-dsc.js";

// Naive brute-force reference: check every segment, no pruning. Used to
// verify the optimized distanceToPolylineKm (2026-09-05, docs/DECISIONS.md
// -- performance fix) returns the mathematically identical answer, never
// an approximation.
function bruteForceDistanceToPolylineKm(point: Point, polyline: Point[]): number {
  if (polyline.length === 1) {
    return haversineDistanceKm(point.lat, point.lon, polyline[0]!.lat, polyline[0]!.lon);
  }
  let min = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = distanceToSegmentKm(point, polyline[i]!, polyline[i + 1]!);
    if (d < min) min = d;
  }
  return min;
}

// A synthetic ASC/DSC-like polyline: a smooth curve across latitude with
// some longitude drift, long enough (700+ points) to actually exercise
// the coarse/fine pruning passes.
function syntheticCurve(pointCount: number, lonAmplitude: number, lonPeriod: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < pointCount; i++) {
    const lat = -89 + (178 * i) / (pointCount - 1);
    const lon = normalizeDeg(lonAmplitude * Math.sin((2 * Math.PI * i) / lonPeriod) + i * 0.3);
    points.push({ lat, lon });
  }
  return points;
}

function normalizeDeg(x: number): number {
  return (((x + 180) % 360) + 360) % 360 - 180;
}

describe("haversineDistanceKm", () => {
  it("returns 0 for identical points", () => {
    expect(haversineDistanceKm(10, 20, 10, 20)).toBeCloseTo(0, 6);
  });

  it("matches the known ~111.19 km per degree of longitude on the equator", () => {
    expect(haversineDistanceKm(0, 0, 0, 1)).toBeCloseTo(111.19, 1);
  });
});

describe("distanceToMeridianKm", () => {
  it("is zero when the point sits on the meridian", () => {
    expect(distanceToMeridianKm(37, 45, 45)).toBeCloseTo(0, 6);
    expect(distanceToMeridianKm(-20, -100, -100)).toBeCloseTo(0, 6);
  });

  it("is symmetric about the equator", () => {
    const a = distanceToMeridianKm(45, 30, 0);
    const b = distanceToMeridianKm(-45, 30, 0);
    expect(a).toBeCloseTo(b, 9);
  });

  it("matches the analytic worked case: 45N, 90 degrees east of the meridian", () => {
    // d = R * asin(cos(45deg) * sin(90deg)) = R * (pi/4)
    const expected = EARTH_RADIUS_KM * (Math.PI / 4);
    expect(distanceToMeridianKm(45, 90, 0)).toBeCloseTo(expected, 3);
  });

  it("matches point-to-point haversine along the equator (lat=0)", () => {
    const meridian = distanceToMeridianKm(0, 10, 0);
    const pointToPoint = haversineDistanceKm(0, 10, 0, 0);
    expect(meridian).toBeCloseTo(pointToPoint, 6);
  });

  it("handles antimeridian wraparound in the delta longitude", () => {
    // 170 to -170 is only 20 degrees apart, not 340.
    const d1 = distanceToMeridianKm(0, 170, -170);
    const d2 = distanceToMeridianKm(0, -170, 170);
    expect(d1).toBeCloseTo(d2, 6);
    expect(d1).toBeLessThan(haversineDistanceKm(0, 170, 0, 0) * 2);
  });
});

describe("distanceToSegmentKm / distanceToPolylineKm", () => {
  it("is ~0 for a point that lies on the segment's great circle path within its span", () => {
    // Midpoint-ish of an equatorial segment.
    const d = distanceToSegmentKm({ lat: 0, lon: 5 }, { lat: 0, lon: 0 }, { lat: 0, lon: 10 });
    expect(d).toBeLessThan(1);
  });

  it("falls back to the nearer endpoint distance when the closest point is outside the segment", () => {
    const point = { lat: 0, lon: 50 };
    const a = { lat: 0, lon: 0 };
    const b = { lat: 0, lon: 10 };
    const d = distanceToSegmentKm(point, a, b);
    const expected = Math.min(
      haversineDistanceKm(point.lat, point.lon, a.lat, a.lon),
      haversineDistanceKm(point.lat, point.lon, b.lat, b.lon)
    );
    expect(d).toBeCloseTo(expected, 3);
  });

  it("distanceToPolylineKm takes the minimum across all segments", () => {
    const polyline = [
      { lat: 0, lon: 0 },
      { lat: 0, lon: 10 },
      { lat: 10, lon: 10 }
    ];
    const point = { lat: 10, lon: 10.001 };
    const d = distanceToPolylineKm(point, polyline);
    expect(d).toBeLessThan(1);
  });

  it("distanceToPolylineKm handles a single-point polyline", () => {
    const d = distanceToPolylineKm({ lat: 1, lon: 1 }, [{ lat: 0, lon: 0 }]);
    expect(d).toBeCloseTo(haversineDistanceKm(1, 1, 0, 0), 6);
  });

  describe("distanceToPolylineKm matches brute force exactly (2026-09-05 performance fix)", () => {
    // Same shape/size as a real ASC/DSC polyline (asc-dsc.ts samples every
    // 0.25 degrees from -89 to 89 -> ~716 points).
    const curve = syntheticCurve(716, 40, 90);

    it("for a point genuinely close to the curve", () => {
      // Pick a point near curve[300] itself, perturbed slightly.
      const near = curve[300]!;
      const point: Point = { lat: near.lat + 0.05, lon: near.lon + 0.05 };
      expect(distanceToPolylineKm(point, curve)).toBeCloseTo(bruteForceDistanceToPolylineKm(point, curve), 9);
    });

    it("for a point on the opposite side of the globe from the curve at that latitude", () => {
      const point: Point = { lat: 10, lon: 179 };
      expect(distanceToPolylineKm(point, curve)).toBeCloseTo(bruteForceDistanceToPolylineKm(point, curve), 9);
    });

    it("for a point beyond the curve's latitude range entirely", () => {
      const point: Point = { lat: -89.5, lon: 0 };
      expect(distanceToPolylineKm(point, curve)).toBeCloseTo(bruteForceDistanceToPolylineKm(point, curve), 9);
    });

    it("across a spread of random points and curve shapes", () => {
      const curves = [syntheticCurve(716, 40, 90), syntheticCurve(500, 120, 40), syntheticCurve(50, 10, 20)];
      let seed = 42;
      function rand(): number {
        // Deterministic PRNG (mulberry32) -- reproducible test, no flakiness.
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      }
      for (const c of curves) {
        for (let i = 0; i < 20; i++) {
          const point: Point = { lat: rand() * 178 - 89, lon: rand() * 360 - 180 };
          expect(distanceToPolylineKm(point, c)).toBeCloseTo(bruteForceDistanceToPolylineKm(point, c), 9);
        }
      }
    });
  });
});

describe("classifyStrengthBand", () => {
  it("maps distances to the spec §12 bands", () => {
    expect(classifyStrengthBand(0)).toBe("VERY_STRONG");
    expect(classifyStrengthBand(100)).toBe("VERY_STRONG");
    expect(classifyStrengthBand(100.1)).toBe("STRONG");
    expect(classifyStrengthBand(250)).toBe("STRONG");
    expect(classifyStrengthBand(250.1)).toBe("MODERATE");
    expect(classifyStrengthBand(500)).toBe("MODERATE");
    expect(classifyStrengthBand(500.1)).toBe("WEAK_SECONDARY");
    expect(classifyStrengthBand(750)).toBe("WEAK_SECONDARY");
    expect(classifyStrengthBand(750.1)).toBe("NOT_USED");
  });
});
