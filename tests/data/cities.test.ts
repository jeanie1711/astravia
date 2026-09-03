import { describe, expect, it } from "vitest";
import { haversineDistanceKm } from "../../src/astro/geo-distance.js";
import type { City } from "../../src/astro/types.js";
import { CITIES, getCityById } from "../../src/data/cities.js";

describe("curated destination city dataset", () => {
  it("lands in the approved ~1,000 range", () => {
    expect(CITIES.length).toBeGreaterThan(800);
    expect(CITIES.length).toBeLessThan(1200);
  });

  it("every city has valid required fields", () => {
    for (const city of CITIES) {
      expect(city.id.length).toBeGreaterThan(0);
      expect(city.name.length).toBeGreaterThan(0);
      expect(city.countryCode).toMatch(/^[A-Z]{2}$/);
      expect(city.countryName.length).toBeGreaterThan(0);
      expect(city.latitude).toBeGreaterThanOrEqual(-90);
      expect(city.latitude).toBeLessThanOrEqual(90);
      expect(city.longitude).toBeGreaterThanOrEqual(-180);
      expect(city.longitude).toBeLessThanOrEqual(180);
    }
  });

  it("has no duplicate ids", () => {
    const ids = new Set(CITIES.map((c) => c.id));
    expect(ids.size).toBe(CITIES.length);
  });

  it("de-duplication invariant: no two cities in the same country sit within 40km of each other", () => {
    const byCountry = new Map<string, City[]>();
    for (const city of CITIES) {
      const list = byCountry.get(city.countryCode);
      if (list) list.push(city);
      else byCountry.set(city.countryCode, [city]);
    }
    let violations = 0;
    for (const list of byCountry.values()) {
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]!;
          const b = list[j]!;
          if (haversineDistanceKm(a.latitude, a.longitude, b.latitude, b.longitude) <= 40) {
            violations++;
          }
        }
      }
    }
    expect(violations).toBe(0);
  });

  it("covers essentially every country (>=240 distinct country codes)", () => {
    const countries = new Set(CITIES.map((c) => c.countryCode));
    expect(countries.size).toBeGreaterThanOrEqual(240);
  });

  it("includes well-known capitals and major cities", () => {
    const names = new Set(CITIES.map((c) => c.name));
    for (const name of ["Paris", "Tokyo", "Cairo", "Bangkok", "Wellington"]) {
      expect(names.has(name)).toBe(true);
    }
  });

  it("getCityById finds a known city and returns undefined for an unknown id", () => {
    const [first] = CITIES;
    expect(getCityById(first!.id)).toEqual(first);
    expect(getCityById("not-a-real-id")).toBeUndefined();
  });
});
