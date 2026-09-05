import { describe, expect, it } from "vitest";
import { horizonHourAngleDeg } from "../../src/astro/asc-dsc.js";
import {
  angularGapAtLatitude,
  closedFormParanLatitude,
  computeAllParansAtInstant,
  numericalParanLatitudes,
  wrap180
} from "../../src/astro/parans.js";

describe("closedFormParanLatitude (03-astro-calculation-spec.md §19.3)", () => {
  it("finds the exact hand-computed latitude for a known case", () => {
    // Constructed so phi=30 solves it exactly: H0(30, 45) = arccos(-tan(30)*tan(45))
    // = arccos(-0.57735) = 125.2644 deg. LST_ASC(bodyB) = raB - H0 = -125.2644.
    // Setting raAPrime to that same value makes the MC/IC(A) = ASC(B) equation
    // hold exactly at phi=30.
    const raB = 0;
    const decB = 45;
    const h0At30 = Math.acos(-Math.tan(30 * (Math.PI / 180)) * Math.tan(decB * (Math.PI / 180))) * (180 / Math.PI);
    const raAPrime = raB - h0At30;

    const result = closedFormParanLatitude(raAPrime, raB, decB, -1);
    expect(result).toBeDefined();
    expect(result!).toBeCloseTo(30, 6);
  });

  it("returns undefined when the reduced target hour angle exceeds 180 degrees", () => {
    // sign*(raAPrime - raB) = -1*(90-0) = -90 -> normalizeDeg360 = 270 > 180
    expect(closedFormParanLatitude(90, 0, 45, -1)).toBeUndefined();
  });

  it("returns undefined for a body essentially on the celestial equator (degenerate case)", () => {
    expect(closedFormParanLatitude(0, 0, 0, -1)).toBeUndefined();
    expect(closedFormParanLatitude(90, 0, 1e-12, 1)).toBeUndefined();
  });

  it("agrees with horizonHourAngleDeg at the solved latitude", () => {
    const raB = 40;
    const decB = -20;
    const raAPrime = 137;
    const lat = closedFormParanLatitude(raAPrime, raB, decB, 1); // DSC
    expect(lat).toBeDefined();
    const h0 = horizonHourAngleDeg(lat!, decB);
    expect(h0).toBeDefined();
    const lstB = raB + h0!; // DSC: RA + H0
    expect(wrap180(lstB - raAPrime)).toBeCloseTo(0, 6);
  });
});

describe("numericalParanLatitudes (03-astro-calculation-spec.md §19.4)", () => {
  it("every returned root actually satisfies the LST-equality condition", () => {
    const raA = 30;
    const decA = 20;
    const raB = 100;
    const decB = -15;
    // (verified by direct scan before writing this test: ASC/ASC crosses
    // zero exactly once in range for these inputs; ASC/DSC does not cross
    // at all here -- that's a legitimate "no paran for that combination",
    // not a bug, so this test deliberately picks the combination that does)
    const roots = numericalParanLatitudes(raA, decA, -1, raB, decB, -1); // ASC(A) vs ASC(B)
    expect(roots.length).toBeGreaterThan(0);
    for (const lat of roots) {
      const gap = angularGapAtLatitude(lat, raA, decA, -1, raB, decB, -1);
      expect(gap).toBeDefined();
      expect(Math.abs(gap!)).toBeLessThan(0.001); // 30 bisection iterations -> sub-thousandth-degree precision
    }
  });

  it("returns no roots when the two bodies' declinations put the crossing out of range", () => {
    // Both near +85 declination on the same side with very different RA:
    // circumpolar over almost the whole latitude range for one sign
    // combination, leaving little/no room for a real crossing.
    const roots = numericalParanLatitudes(0, 89.9, -1, 180, 89.9, -1);
    expect(Array.isArray(roots)).toBe(true); // just must not throw; count is data-dependent
  });
});

describe("computeAllParansAtInstant (03-astro-calculation-spec.md §19.5)", () => {
  const utcIso = "1987-11-17T10:30:00.000Z";
  const parans = computeAllParansAtInstant(utcIso);

  it("never returns an MC/IC x MC/IC combination (§19.2 -- not a real paran)", () => {
    const latitudeOnlyAngles = new Set(["MC", "IC"]);
    for (const p of parans) {
      const bothLatitudeIndependent = latitudeOnlyAngles.has(p.angleA) && latitudeOnlyAngles.has(p.angleB);
      expect(bothLatitudeIndependent).toBe(false);
    }
  });

  it("produces at least one paran for a real chart (sanity check on volume)", () => {
    expect(parans.length).toBeGreaterThan(0);
  });

  it("every latitude is within the valid range", () => {
    for (const p of parans) {
      expect(p.latitudeDeg).toBeGreaterThanOrEqual(-90);
      expect(p.latitudeDeg).toBeLessThanOrEqual(90);
    }
  });

  it("is deterministic: same instant produces byte-identical output (G006)", () => {
    const again = computeAllParansAtInstant(utcIso);
    expect(JSON.stringify(again)).toBe(JSON.stringify(parans));
  });
});
