import { describe, expect, it } from "vitest";
import { selectArchetype } from "../../src/scoring/archetype.js";
import type { CandidateInfluence } from "../../src/scoring/types.js";

function candidate(body: CandidateInfluence["body"], angle: CandidateInfluence["angle"]): CandidateInfluence {
  return { body, angle, distanceKm: 50, strengthBand: "VERY_STRONG", relevance: 5, tension: 0.1, strength: 0.99, support: 0.9 };
}

describe("selectArchetype", () => {
  it("maps Sun to VISIBILITY", () => {
    expect(selectArchetype(candidate("Sun", "MC"), "HIGH")).toBe("VISIBILITY");
  });

  it("maps Jupiter to EXPANSION, Venus to CONNECTION", () => {
    expect(selectArchetype(candidate("Jupiter", "ASC"), "MEDIUM")).toBe("EXPANSION");
    expect(selectArchetype(candidate("Venus", "DSC"), "HIGH")).toBe("CONNECTION");
  });

  it("maps Moon/Jupiter/Venus on IC to BELONGING", () => {
    expect(selectArchetype(candidate("Moon", "IC"), "HIGH")).toBe("BELONGING");
    expect(selectArchetype(candidate("Jupiter", "IC"), "HIGH")).toBe("BELONGING");
    expect(selectArchetype(candidate("Venus", "IC"), "HIGH")).toBe("BELONGING");
  });

  it("LOW coherence overrides the body category to LAYERED", () => {
    expect(selectArchetype(candidate("Sun", "MC"), "LOW")).toBe("LAYERED");
  });

  it("falls back to UNCLASSIFIED when there is no primary", () => {
    expect(selectArchetype(undefined, "MEDIUM")).toBe("UNCLASSIFIED");
  });

  it("falls back to UNCLASSIFIED for Moon on a non-IC angle (documented spec gap)", () => {
    expect(selectArchetype(candidate("Moon", "MC"), "HIGH")).toBe("UNCLASSIFIED");
  });
});
