import { describe, expect, it } from "vitest";
import { buildCandidateInfluences, selectInfluences } from "../../src/scoring/select-influences.js";
import { buildInfluences } from "./helpers.js";

describe("buildCandidateInfluences", () => {
  it("excludes influences at or beyond 750 km", () => {
    const influences = buildInfluences([{ body: "Sun", angle: "MC", distanceKm: 750 }]);
    const candidates = buildCandidateInfluences(influences);
    expect(candidates.find((c) => c.body === "Sun" && c.angle === "MC")).toBeUndefined();
  });

  it("includes and sorts candidates by strength (distanceStrength), descending", () => {
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 40 },
      { body: "Moon", angle: "MC", distanceKm: 400 }
    ]);
    const candidates = buildCandidateInfluences(influences);
    const sun = candidates.find((c) => c.body === "Sun" && c.angle === "MC")!;
    const moon = candidates.find((c) => c.body === "Moon" && c.angle === "MC")!;
    expect(sun.strength).toBeGreaterThan(moon.strength);
    expect(candidates[0]).toBe(sun);
  });

  it("tags each candidate with its traditional category", () => {
    const influences = buildInfluences([
      { body: "Jupiter", angle: "MC", distanceKm: 40 },
      { body: "Mars", angle: "MC", distanceKm: 40 }
    ]);
    const candidates = buildCandidateInfluences(influences);
    expect(candidates.find((c) => c.body === "Jupiter")!.category).toBe("Benefic");
    expect(candidates.find((c) => c.body === "Mars")!.category).toBe("Malefic");
  });
});

describe("selectInfluences", () => {
  it("selects a primary only when a domain-matching candidate exceeds 0.35 strength", () => {
    const influences = buildInfluences([{ body: "Sun", angle: "MC", distanceKm: 40 }]);
    const candidates = buildCandidateInfluences(influences);
    const { primary } = selectInfluences(candidates, "CAREER");
    expect(primary).toBeDefined();
    expect(primary!.strength).toBeGreaterThan(0.35);
  });

  it("does not select a primary when the only candidate's angle doesn't match the goal's domain", () => {
    // Sun-IC's domain is Home, not Career -- v0.2's strict domain filtering
    // (04-scoring-ranking-spec.md §5): a non-matching angle contributes
    // nothing to primary selection, regardless of distance.
    const influences = buildInfluences([{ body: "Sun", angle: "IC", distanceKm: 40 }]);
    const candidates = buildCandidateInfluences(influences);
    const { primary } = selectInfluences(candidates, "CAREER");
    expect(primary).toBeUndefined();
  });

  it("does not select a primary when the domain-matching candidate is below 0.35 strength", () => {
    const influences = buildInfluences([{ body: "Sun", angle: "MC", distanceKm: 700 }]);
    const candidates = buildCandidateInfluences(influences);
    const { primary } = selectInfluences(candidates, "CAREER");
    expect(primary).toBeUndefined();
  });

  it("selects a secondary from a different domain than the primary", () => {
    // The secondary has no domain restriction -- only the primary does.
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 30 }, // Career domain, primary
      { body: "Saturn", angle: "ASC", distanceKm: 60 } // Growth domain, still eligible as secondary
    ]);
    const candidates = buildCandidateInfluences(influences);
    const { primary, secondary } = selectInfluences(candidates, "CAREER");
    expect(primary!.body).toBe("Sun");
    expect(secondary[0]!.body).toBe("Saturn");
  });

  it("caps secondary influences at 3 and requires strength > 0.20", () => {
    const influences = buildInfluences([
      { body: "Sun", angle: "MC", distanceKm: 30 }, // primary
      { body: "Jupiter", angle: "MC", distanceKm: 60 },
      { body: "Mercury", angle: "MC", distanceKm: 60 },
      { body: "Mars", angle: "MC", distanceKm: 60 },
      { body: "Saturn", angle: "MC", distanceKm: 60 } // should be excluded (only top 3 kept)
    ]);
    const candidates = buildCandidateInfluences(influences);
    const { secondary } = selectInfluences(candidates, "CAREER");
    expect(secondary.length).toBeLessThanOrEqual(3);
    for (const s of secondary) {
      expect(s.strength).toBeGreaterThan(0.2);
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
    const candidates = buildCandidateInfluences(influences);
    const { primary, secondary } = selectInfluences(candidates, "CAREER");
    const total = (primary ? 1 : 0) + secondary.length;
    expect(total).toBeLessThanOrEqual(4);
  });
});
