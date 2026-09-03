import { describe, expect, it } from "vitest";
import { buildCandidateInfluences, selectInfluences } from "../../src/scoring/select-influences.js";
import { buildInfluences } from "./helpers.js";

describe("buildCandidateInfluences", () => {
  it("excludes influences at or beyond 750 km", () => {
    const influences = buildInfluences([{ body: "Sun", angle: "MC", distanceKm: 750 }]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    expect(candidates.find((c) => c.body === "Sun" && c.angle === "MC")).toBeUndefined();
  });

  it("includes and sorts candidates by support, descending", () => {
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 40 }, // Career relevance 5, strong
      { body: "Moon", angle: "MC", distanceKm: 40 } // Career relevance 3, weaker
    ]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    const sun = candidates.find((c) => c.body === "Sun" && c.angle === "MC")!;
    const moon = candidates.find((c) => c.body === "Moon" && c.angle === "MC")!;
    expect(sun.support).toBeGreaterThan(moon.support);
    expect(candidates[0]).toBe(sun);
  });
});

describe("selectInfluences", () => {
  it("selects a primary only when support exceeds 0.35", () => {
    const influences = buildInfluences([{ body: "Sun", angle: "MC", distanceKm: 40 }]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    const { primary } = selectInfluences(candidates);
    expect(primary).toBeDefined();
    expect(primary!.support).toBeGreaterThan(0.35);
  });

  it("does not select a primary when the strongest candidate is below 0.35 support", () => {
    // Sun-IC has Career relevance 1 -- even at close distance, support stays low.
    const influences = buildInfluences([{ body: "Sun", angle: "IC", distanceKm: 400 }]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    const { primary } = selectInfluences(candidates);
    expect(primary).toBeUndefined();
  });

  it("caps secondary influences at 3 and requires support > 0.20", () => {
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 30 }, // primary
      { body: "Jupiter", angle: "MC", distanceKm: 60 },
      { body: "Mercury", angle: "MC", distanceKm: 60 },
      { body: "Mars", angle: "MC", distanceKm: 60 },
      { body: "Saturn", angle: "MC", distanceKm: 60 } // should be excluded (only top 3 kept)
    ]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    const { secondary } = selectInfluences(candidates);
    expect(secondary.length).toBeLessThanOrEqual(3);
    for (const s of secondary) {
      expect(s.support).toBeGreaterThan(0.2);
    }
  });

  it("never selects more than 4 total visible influences (1 primary + 3 secondary)", () => {
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 20 },
      { body: "Jupiter", angle: "MC", distanceKm: 30 },
      { body: "Mercury", angle: "MC", distanceKm: 30 },
      { body: "Mars", angle: "MC", distanceKm: 30 },
      { body: "Venus", angle: "MC", distanceKm: 30 },
      { body: "Saturn", angle: "MC", distanceKm: 30 }
    ]);
    const candidates = buildCandidateInfluences("CAREER", influences);
    const { primary, secondary } = selectInfluences(candidates);
    const total = (primary ? 1 : 0) + secondary.length;
    expect(total).toBeLessThanOrEqual(4);
  });
});
