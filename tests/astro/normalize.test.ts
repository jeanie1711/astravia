import { describe, expect, it } from "vitest";
import { normalizeLon } from "../../src/astro/normalize.js";

describe("normalizeLon", () => {
  it("keeps in-range values unchanged", () => {
    expect(normalizeLon(0)).toBeCloseTo(0, 9);
    expect(normalizeLon(179.9)).toBeCloseTo(179.9, 9);
    expect(normalizeLon(-179.9)).toBeCloseTo(-179.9, 9);
  });

  it("wraps values at and beyond +180", () => {
    expect(normalizeLon(180)).toBeCloseTo(-180, 9);
    expect(normalizeLon(181)).toBeCloseTo(-179, 9);
    expect(normalizeLon(360)).toBeCloseTo(0, 9);
    expect(normalizeLon(540)).toBeCloseTo(-180, 9);
  });

  it("wraps values at and beyond -180", () => {
    expect(normalizeLon(-180)).toBeCloseTo(-180, 9);
    expect(normalizeLon(-181)).toBeCloseTo(179, 9);
    expect(normalizeLon(-360)).toBeCloseTo(0, 9);
    expect(normalizeLon(-540)).toBeCloseTo(-180, 9);
  });

  it("G002: result always falls in [-180, 180) across a wide sample", () => {
    for (let x = -2000; x <= 2000; x += 7.3) {
      const n = normalizeLon(x);
      expect(n).toBeGreaterThanOrEqual(-180);
      expect(n).toBeLessThan(180);
    }
  });
});
