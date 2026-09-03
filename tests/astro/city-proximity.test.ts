import { describe, expect, it } from "vitest";
import { computeCityDistancesAtInstant } from "../../src/astro/city-proximity.js";
import { distanceToMeridianKm, haversineDistanceKm } from "../../src/astro/geo-distance.js";
import type { AstroLine, City } from "../../src/astro/types.js";

const stockholm: City = {
  id: "stockholm",
  name: "Stockholm",
  countryCode: "SE",
  countryName: "Sweden",
  latitude: 59.3293,
  longitude: 18.0686
};

const oslo: City = {
  id: "oslo",
  name: "Oslo",
  countryCode: "NO",
  countryName: "Norway",
  latitude: 59.9139,
  longitude: 10.7522
};

describe("computeCityDistancesAtInstant", () => {
  it("computes MC/IC distance via distanceToMeridianKm", () => {
    const lines: AstroLine[] = [{ body: "Sun", angle: "MC", longitude: 18.0686 }];
    const results = computeCityDistancesAtInstant(lines, [stockholm]);
    expect(results).toHaveLength(1);
    expect(results[0]!.distanceKm).toBeCloseTo(
      distanceToMeridianKm(stockholm.latitude, stockholm.longitude, 18.0686),
      6
    );
    expect(results[0]!.distanceKm).toBeCloseTo(0, 3);
  });

  it("takes the minimum distance across multiple segments for the same body/angle", () => {
    const nearSegment = [
      { lat: 55, lon: 18 },
      { lat: 60, lon: 18 },
      { lat: 65, lon: 18 }
    ];
    const farSegment = [
      { lat: 55, lon: 100 },
      { lat: 60, lon: 100 }
    ];
    const lines: AstroLine[] = [
      { body: "Venus", angle: "ASC", points: nearSegment },
      { body: "Venus", angle: "ASC", points: farSegment }
    ];
    const results = computeCityDistancesAtInstant(lines, [stockholm]);
    expect(results).toHaveLength(1);
    expect(results[0]!.distanceKm).toBeLessThan(500);
  });

  it("computes one result per city per distinct body/angle", () => {
    const lines: AstroLine[] = [
      { body: "Sun", angle: "MC", longitude: 10 },
      { body: "Moon", angle: "IC", longitude: 100 }
    ];
    const results = computeCityDistancesAtInstant(lines, [stockholm, oslo]);
    expect(results).toHaveLength(4);
  });

  it("throws rather than silently ignoring a malformed line", () => {
    const lines: AstroLine[] = [{ body: "Sun", angle: "MC" }];
    expect(() => computeCityDistancesAtInstant(lines, [stockholm])).toThrow();
  });
});

describe("sanity: haversine vs meridian for a city near the reference meridian", () => {
  it("Stockholm is close to its own longitude meridian by construction", () => {
    expect(haversineDistanceKm(stockholm.latitude, stockholm.longitude, stockholm.latitude, 18.0686)).toBeCloseTo(
      0,
      3
    );
  });
});
