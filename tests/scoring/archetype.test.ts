import { describe, expect, it } from "vitest";
import { planetCategory } from "../../src/scoring/category.js";
import { selectArchetype } from "../../src/scoring/archetype.js";
import type { CandidateInfluence } from "../../src/scoring/types.js";

function candidate(body: CandidateInfluence["body"], angle: CandidateInfluence["angle"]): CandidateInfluence {
  return { body, angle, distanceKm: 50, strengthBand: "VERY_STRONG", category: planetCategory(body), strength: 0.99 };
}

describe("selectArchetype", () => {
  it("maps Sun to VISIBILITY", () => {
    expect(selectArchetype(candidate("Sun", "MC"), "REINFORCING")).toBe("VISIBILITY");
  });

  it("maps Jupiter to EXPANSION, Venus to CONNECTION", () => {
    expect(selectArchetype(candidate("Jupiter", "ASC"), "LAYERED")).toBe("EXPANSION");
    expect(selectArchetype(candidate("Venus", "DSC"), "REINFORCING")).toBe("CONNECTION");
  });

  it("maps Moon/Jupiter/Venus on IC to BELONGING", () => {
    expect(selectArchetype(candidate("Moon", "IC"), "REINFORCING")).toBe("BELONGING");
    expect(selectArchetype(candidate("Jupiter", "IC"), "REINFORCING")).toBe("BELONGING");
    expect(selectArchetype(candidate("Venus", "IC"), "REINFORCING")).toBe("BELONGING");
  });

  it("Complex/effortful coherence overrides the body category to LAYERED", () => {
    expect(selectArchetype(candidate("Sun", "MC"), "COMPLEX_EFFORTFUL")).toBe("LAYERED");
  });

  it("falls back to UNCLASSIFIED when there is no primary", () => {
    expect(selectArchetype(undefined, "NONE")).toBe("UNCLASSIFIED");
  });

  it("falls back to UNCLASSIFIED for Moon on a non-IC angle (documented spec gap)", () => {
    expect(selectArchetype(candidate("Moon", "MC"), "REINFORCING")).toBe("UNCLASSIFIED");
  });
});
