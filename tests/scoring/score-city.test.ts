import { describe, expect, it } from "vitest";
import type { Angle, Body } from "../../src/astro/types.js";
import { scoreCity, scoreToDisplayValue, scoreToStars } from "../../src/scoring/score-city.js";
import type { ScenarioInfluences } from "../../src/scoring/stability.js";
import { buildInfluences, buildScenarios } from "./helpers.js";

function exactScenarios(
  overrides: Array<{ body: Body; angle: Angle; distanceKm: number }>
): ScenarioInfluences {
  const influences = buildInfluences(overrides);
  return { lower: influences, baseline: influences, upper: influences };
}

describe("S001 no relevant line", () => {
  it("caps at 2 stars when no influence is within 750 km", () => {
    const scenarios = exactScenarios([]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.stars).toBeLessThanOrEqual(2);
  });
});

describe("S002 five-star proximity", () => {
  it("caps the score itself (not just the star label) when the best influences all sit beyond 500 km", () => {
    const scenarios = exactScenarios([
      { body: "Mercury", angle: "MC", distanceKm: 501 },
      { body: "Jupiter", angle: "MC", distanceKm: 501 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    // Product decision 2026-09-05: a guardrail caps `internalScore` itself,
    // so `stars` is always a pure function of the score -- never a
    // separate override that could contradict ranking-by-score elsewhere.
    expect(result.internalScore).toBeLessThan(0.78);
    expect(result.stars).toBeLessThanOrEqual(4);
  });
});

describe("S003 time-sensitive cap", () => {
  it("caps at 4 stars when stability is TIME_SENSITIVE, even if baseline alone would score 5-star", () => {
    const scenarios = buildScenarios({
      tracked: { body: "Sun", angle: "MC", distancesKm: [20, 20, 900] }
    });
    const result = scoreCity("city", "CAREER", scenarios, 15);
    expect(result.stability).toBe("TIME_SENSITIVE");
    expect(result.stars).toBeLessThanOrEqual(4);
  });
});

describe("S005 no bad-planet rule", () => {
  it("lets a high-tension body (Saturn) still score strongly when close and relevant", () => {
    const scenarios = exactScenarios([{ body: "Saturn", angle: "MC", distanceKm: 30 }]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.primaryInfluence).toEqual({ body: "Saturn", angle: "MC" });
    expect(result.stars).toBeGreaterThanOrEqual(3);
  });
});

describe("S006 goal differentiation", () => {
  it("gives the same city different stars for different goals", () => {
    // Sun-IC: Career relevance 1 (weak), Home relevance 4 (strong).
    const scenarios = exactScenarios([{ body: "Sun", angle: "IC", distanceKm: 30 }]);
    const career = scoreCity("city", "CAREER", scenarios, 0);
    const home = scoreCity("city", "HOME", scenarios, 0);
    expect(career.stars).not.toBe(home.stars);
    expect(home.stars).toBeGreaterThan(career.stars);
  });
});

describe("synthetic fixtures (07-golden-test-cases.md §8)", () => {
  it("1. Clean Career: Sun-MC 40 + Jupiter-MC 90 -> Career 5-star, HIGH coherence", () => {
    const scenarios = exactScenarios([
      { body: "Sun", angle: "MC", distanceKm: 40 },
      { body: "Jupiter", angle: "MC", distanceKm: 90 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.stars).toBe(5);
    expect(result.coherence).toBe("HIGH");
  });

  it("2. Layered Career: Sun-MC 50 + Neptune-ASC 40 -> MEDIUM coherence, still strong", () => {
    const scenarios = exactScenarios([
      { body: "Sun", angle: "MC", distanceKm: 50 },
      { body: "Neptune", angle: "ASC", distanceKm: 40 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.coherence).toBe("MEDIUM");
    expect(result.stars).toBeGreaterThanOrEqual(4);
  });

  it("3. Home Base: Moon-IC 60 + Jupiter-IC 100 -> Home 5-star candidate, HIGH coherence", () => {
    const scenarios = exactScenarios([
      { body: "Moon", angle: "IC", distanceKm: 60 },
      { body: "Jupiter", angle: "IC", distanceKm: 100 }
    ]);
    const result = scoreCity("city", "HOME", scenarios, 0);
    expect(result.coherence).toBe("HIGH");
    expect(result.stars).toBe(5);
  });

  it("4. Connection + Structure: Venus-ASC 30 + Saturn-ASC 80 -> Love strong but MEDIUM coherence (not effortless)", () => {
    const scenarios = exactScenarios([
      { body: "Venus", angle: "ASC", distanceKm: 30 },
      { body: "Saturn", angle: "ASC", distanceKm: 80 }
    ]);
    const result = scoreCity("city", "LOVE", scenarios, 0);
    expect(result.coherence).toBe("MEDIUM");
    expect(result.stars).toBeGreaterThanOrEqual(3);
  });

  it("5. High Intensity: Mars-MC 30 + Pluto-MC 50 -> LOW coherence, capped at 3 stars despite a strong raw score", () => {
    const scenarios = exactScenarios([
      { body: "Mars", angle: "MC", distanceKm: 30 },
      { body: "Pluto", angle: "MC", distanceKm: 50 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.coherence).toBe("LOW");
    expect(result.stars).toBe(3);
  });

  it("6. Weak City: all relevant lines beyond 900 km -> 1 or 2 stars", () => {
    const scenarios = exactScenarios([]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.stars).toBeLessThanOrEqual(2);
  });

  it("7. Time Sensitive: primary distance 40/350/900 -> TIME_SENSITIVE, max 4 stars", () => {
    const scenarios = buildScenarios({
      tracked: { body: "Sun", angle: "MC", distancesKm: [40, 350, 900] }
    });
    const result = scoreCity("city", "CAREER", scenarios, 15);
    expect(result.stability).toBe("TIME_SENSITIVE");
    expect(result.stars).toBeLessThanOrEqual(4);
  });

  it("8. Stable: primary distance 80/100/120 -> HIGH stability", () => {
    const scenarios = buildScenarios({
      tracked: { body: "Sun", angle: "MC", distancesKm: [80, 100, 120] }
    });
    const result = scoreCity("city", "CAREER", scenarios, 15);
    expect(result.stability).toBe("HIGH");
  });
});

describe("scoreToDisplayValue", () => {
  it("interpolates within a tier: low/mid/high score in the 4-star band gives distinct decimals", () => {
    const low = scoreToDisplayValue(0.63, 4);
    const mid = scoreToDisplayValue(0.7, 4);
    const high = scoreToDisplayValue(0.775, 4);
    expect(low).toBeCloseTo(4.1, 1);
    expect(mid).toBeGreaterThan(low);
    expect(high).toBeGreaterThan(mid);
    expect(low).toBeGreaterThanOrEqual(4);
    expect(high).toBeLessThan(5);
  });

  it("never reaches the next whole star, even exactly at a tier's upper bound", () => {
    expect(scoreToDisplayValue(0.7799, 4)).toBeLessThan(5);
    expect(scoreToDisplayValue(0.9999, 4)).toBeLessThan(5); // guardrail-capped 5->4 case
  });

  it("clamps into the capped tier when a guardrail placed a high raw score into a lower tier", () => {
    // e.g. S002/S003: raw score would naturally be 5-star (>=0.78) but the
    // final stars value was capped to 4 -- the decimal must stay in 4.x.
    const capped = scoreToDisplayValue(0.95, 4);
    expect(capped).toBeGreaterThanOrEqual(4);
    expect(capped).toBeLessThan(5);
  });

  it("5-star tier is always displayed flat at 5.0, the scale's ceiling", () => {
    expect(scoreToDisplayValue(0.78, 5)).toBe(5);
    expect(scoreToDisplayValue(1, 5)).toBe(5);
  });

  it("1-star tier never displays below 1.0 even for a score of 0", () => {
    expect(scoreToDisplayValue(0, 1)).toBeGreaterThanOrEqual(1);
  });
});

describe("stars is always a pure function of internalScore (product decision 2026-09-05)", () => {
  it("holds even when every guardrail is triggered", () => {
    const noRelevantLine = scoreCity("city", "CAREER", exactScenarios([]), 0);
    const distantOnly = scoreCity(
      "city",
      "CAREER",
      exactScenarios([
        { body: "Mercury", angle: "MC", distanceKm: 501 },
        { body: "Jupiter", angle: "MC", distanceKm: 501 }
      ]),
      0
    );
    const timeSensitive = scoreCity(
      "city",
      "CAREER",
      buildScenarios({ tracked: { body: "Sun", angle: "MC", distancesKm: [20, 20, 900] } }),
      15
    );
    const tensionHeavy = scoreCity(
      "city",
      "CAREER",
      exactScenarios([
        { body: "Mars", angle: "MC", distanceKm: 30 },
        { body: "Pluto", angle: "MC", distanceKm: 50 }
      ]),
      0
    );

    for (const result of [noRelevantLine, distantOnly, timeSensitive, tensionHeavy]) {
      expect(result.stars).toBe(scoreToStars(result.internalScore));
    }
  });
});
