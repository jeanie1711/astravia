import { describe, expect, it } from "vitest";
import { compareByStarsThenScore } from "../../src/scoring/rank-order.js";

describe("compareByStarsThenScore", () => {
  it("ranks a higher star tier above a lower one, even when the lower tier's raw score is higher", () => {
    // e.g. a guardrail-capped 4-star result (CLAUDE.md §11) with a very
    // high hidden internalScore must still rank below an uncapped 5-star
    // result with a lower internalScore.
    const cappedFourStar = { stars: 4, internalScore: 0.95 };
    const naturalFiveStar = { stars: 5, internalScore: 0.8 };
    const sorted = [cappedFourStar, naturalFiveStar].sort(compareByStarsThenScore);
    expect(sorted[0]).toBe(naturalFiveStar);
  });

  it("breaks ties within the same star tier by raw internalScore", () => {
    const higher = { stars: 4, internalScore: 0.75 };
    const lower = { stars: 4, internalScore: 0.65 };
    const sorted = [lower, higher].sort(compareByStarsThenScore);
    expect(sorted[0]).toBe(higher);
  });

  it("is stable-orderable across a mixed list", () => {
    const items = [
      { stars: 2, internalScore: 0.3 },
      { stars: 5, internalScore: 0.79 },
      { stars: 3, internalScore: 0.9 }, // capped, high hidden score
      { stars: 5, internalScore: 0.99 }
    ];
    const sorted = [...items].sort(compareByStarsThenScore);
    expect(sorted.map((i) => i.stars)).toEqual([5, 5, 3, 2]);
    expect(sorted[0]!.internalScore).toBe(0.99); // higher score wins within the tied 5-star tier
  });
});
