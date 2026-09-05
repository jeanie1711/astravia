import { describe, expect, it } from "vitest";
import { computeOverall } from "../../src/scoring/overall.js";
import type { RankedCity, ScorableGoal, Stars } from "../../src/scoring/types.js";

function goalResult(goal: ScorableGoal, internalScore: number, stars: Stars, coherenceLow = false): RankedCity {
  return {
    cityId: "test-city",
    goal,
    internalScore,
    stars,
    label: "Mixed",
    primaryInfluence: { body: "Sun", angle: "MC" },
    secondaryInfluences: [],
    paranInfluence: undefined,
    coherence: coherenceLow ? "COMPLEX_EFFORTFUL" : "REINFORCING",
    stability: "HIGH",
    archetypeId: coherenceLow ? "LAYERED" : "VISIBILITY"
  };
}

describe("S007 Overall is not the mean", () => {
  it("favors a broad, coherent 4/4/4/4 profile over a peaky 5/2/2/5 profile", () => {
    // Peaky city: strong Career/Growth, weak (low-coherence) Love/Home.
    const peaky: Record<ScorableGoal, RankedCity> = {
      CAREER: goalResult("CAREER", 0.85, 5),
      LOVE: goalResult("LOVE", 0.35, 2, true),
      HOME: goalResult("HOME", 0.35, 2, true),
      GROWTH: goalResult("GROWTH", 0.85, 5)
    };

    // Broad city: consistently strong across all four goals.
    const broad: Record<ScorableGoal, RankedCity> = {
      CAREER: goalResult("CAREER", 0.65, 4),
      LOVE: goalResult("LOVE", 0.65, 4),
      HOME: goalResult("HOME", 0.65, 4),
      GROWTH: goalResult("GROWTH", 0.65, 4)
    };

    const peakyOverall = computeOverall("peaky-city", peaky);
    const broadOverall = computeOverall("broad-city", broad);

    expect(broadOverall.internalScore).toBeGreaterThan(peakyOverall.internalScore);
  });

  it("is not simply the arithmetic mean of the four goal scores", () => {
    const results: Record<ScorableGoal, RankedCity> = {
      CAREER: goalResult("CAREER", 0.9, 5),
      LOVE: goalResult("LOVE", 0.9, 5),
      HOME: goalResult("HOME", 0.9, 5),
      GROWTH: goalResult("GROWTH", 0.9, 5)
    };
    const overall = computeOverall("test-city", results);
    const mean = 0.9;
    expect(overall.internalScore).not.toBeCloseTo(mean, 6);
    expect(overall.internalScore).toBeGreaterThan(mean); // breadth + stability bonuses push it up
  });
});
