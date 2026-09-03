import { describe, expect, it } from "vitest";
import {
  EARTH_RADIUS_KM,
  classifyStrengthBand,
  distanceToMeridianKm,
  distanceToPolylineKm,
  distanceToSegmentKm,
  haversineDistanceKm
} from "../../src/astro/geo-distance.js";

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
