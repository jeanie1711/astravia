import { describe, expect, it } from "vitest";
import { distanceStrength } from "../../src/scoring/distance-strength.js";

describe("distanceStrength", () => {
  it("is 1 at zero distance", () => {
    expect(distanceStrength(0)).toBe(1);
  });

  it("is 0 at and beyond 750 km", () => {
    expect(distanceStrength(750)).toBe(0);
    expect(distanceStrength(1000)).toBe(0);
  });

  it("decays smoothly (quadratic) between 0 and 750", () => {
    expect(distanceStrength(375)).toBeCloseTo(1 - 0.25, 9); // (375/750)^2 = 0.25
  });

  it("is monotonically decreasing", () => {
    let previous = distanceStrength(0);
    for (let km = 10; km <= 750; km += 10) {
      const current = distanceStrength(km);
      expect(current).toBeLessThanOrEqual(previous);
      previous = current;
    }
  });
});
