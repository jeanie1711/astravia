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

// v0.2 replaces the v0.1 fixtures below (see docs/DECISIONS.md 2026-09-05
// "Guardrails cap internalScore..." entries and docs/07-golden-test-
// cases.md §10, which these fixtures are transcribed from verbatim,
// including the worked arithmetic). Fixture 4 in particular could not
// carry over: Venus-ASC + Saturn-ASC for LOVE relied on v0.1's per-goal
// relevance matrix giving an ASC-angle line partial credit toward Love;
// v0.2's strict angle-domain filtering (§5) means an ASC line now
// contributes nothing to LOVE (its domain is Growth, not Love) -- this is
// the single most significant, intentional behavior change in the
// rewrite, and DOM-01 below locks it in explicitly.
describe("synthetic fixtures (07-golden-test-cases.md §10, v0.2)", () => {
  it("RICH-01 Clean Reinforcing Career: Sun-MC 40 + Jupiter-MC 200 -> 5 stars, REINFORCING", () => {
    const scenarios = exactScenarios([
      { body: "Sun", angle: "MC", distanceKm: 40 },
      { body: "Jupiter", angle: "MC", distanceKm: 200 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.coherence).toBe("REINFORCING");
    expect(result.stars).toBe(5);
  });

  it("RICH-02 Layered Career, mid-range: Sun-MC 600 + Saturn-ASC 500 -> 3 stars, LAYERED (secondary need not share the primary's domain)", () => {
    const scenarios = exactScenarios([
      { body: "Sun", angle: "MC", distanceKm: 600 },
      { body: "Saturn", angle: "ASC", distanceKm: 500 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.coherence).toBe("LAYERED");
    expect(result.stars).toBe(3);
  });

  it("RICH-03 Complex/effortful guardrail: Mars-MC 100 + Pluto-MC 150, Exact stability -> naturally 5-star, capped to 3", () => {
    const scenarios = exactScenarios([
      { body: "Mars", angle: "MC", distanceKm: 100 },
      { body: "Pluto", angle: "MC", distanceKm: 150 }
    ]);
    const result = scoreCity("city", "CAREER", scenarios, 0);
    expect(result.coherence).toBe("COMPLEX_EFFORTFUL");
    // Guardrail: Malefic/Transformative primary + Complex/effortful
    // coherence caps below 4 stars even though richness alone would clear 5.
    expect(result.stars).toBe(3);
  });

  it("DOM-01 strict angle-domain filtering: same Sun-IC 50km line scores Weak for Career, Strong for Home", () => {
    const scenarios = exactScenarios([{ body: "Sun", angle: "IC", distanceKm: 50 }]);
    const career = scoreCity("city", "CAREER", scenarios, 0);
    const home = scoreCity("city", "HOME", scenarios, 0);
    expect(career.primaryInfluence).toBeUndefined(); // IC doesn't match Career's domain (MC)
    expect(career.stars).toBe(1);
    expect(home.primaryInfluence).toEqual({ body: "Sun", angle: "IC" });
    expect(home.stars).toBe(4);
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
