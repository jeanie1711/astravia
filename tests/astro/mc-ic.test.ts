import { describe, expect, it } from "vitest";
import { icLongitude, mcLongitude } from "../../src/astro/mc-ic.js";
import { normalizeLon } from "../../src/astro/normalize.js";

function angularDifference(a: number, b: number): number {
  // shortest circular distance between two longitudes, in [0, 180]
  const raw = Math.abs(normalizeLon(a - b));
  return Math.min(raw, 360 - raw);
}

describe("mcLongitude / icLongitude", () => {
  it("computes MC as RA - GST, normalized", () => {
    expect(mcLongitude(100, 40)).toBeCloseTo(60, 9);
    expect(mcLongitude(10, 350)).toBeCloseTo(20, 9);
  });

  it("G001: MC/IC opposition is 180 degrees, ±1e-9, across many RA/GST combinations", () => {
    for (let ra = 0; ra < 360; ra += 17.3) {
      for (let gst = 0; gst < 360; gst += 41.1) {
        const mc = mcLongitude(ra, gst);
        const ic = icLongitude(mc);
        expect(angularDifference(mc, ic)).toBeCloseTo(180, 9);
      }
    }
  });
});
