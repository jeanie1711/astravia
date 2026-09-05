import { describe, expect, it } from "vitest";
import { composeCityStory, type InfluenceDistance } from "../../src/interpretation/compose-city-story.js";
import { findPracticalDomainClaims, findProhibitedPhrases } from "../../src/interpretation/safety.js";
import type { RankedCity } from "../../src/scoring/types.js";

function baseRankedCity(overrides: Partial<RankedCity>): RankedCity {
  return {
    cityId: "test-city",
    goal: "CAREER",
    internalScore: 0.85,
    stars: 5,
    label: "Exceptional",
    primaryInfluence: { body: "Sun", angle: "MC" },
    secondaryInfluences: [{ body: "Neptune", angle: "ASC" }],
    coherence: "LAYERED",
    stability: "HIGH",
    archetypeId: "VISIBILITY",
    ...overrides
  };
}

function allText(result: ReturnType<typeof composeCityStory>): string {
  return [result.hook, result.whyItStandsOut, ...result.opportunities, ...result.tradeOffs, result.howItMayFeel, result.shareText].join(
    " "
  );
}

const distances: InfluenceDistance[] = [
  { body: "Sun", angle: "MC", distanceKm: 38, scenarioDistancesKm: [249, 38, 176] },
  { body: "Neptune", angle: "ASC", distanceKm: 39, scenarioDistancesKm: [109, 39, 172] }
];

describe("composeCityStory", () => {
  it("I001: primary influence is introduced before any secondary content", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.whyItStandsOut.startsWith("Your ☉ Sun–MC influence is especially strong here.")).toBe(true);
  });

  it("I002: uses the category-tier synthesis pattern instead of concatenating two independent definitions", () => {
    // Sun (Personal) + Neptune (Transformative) is a mixed pair -> Layered
    // tier (04-scoring-ranking-spec.md v0.2 §6).
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.whyItStandsOut).toContain("a layered story, opportunity alongside effort");
    expect(result.whyItStandsOut).toContain("visibility, professional identity, recognition");
    expect(result.whyItStandsOut).toContain("sensitivity, imagination, porous identity");
  });

  it("I003: a 5-star result still has a non-empty trade-off", () => {
    const result = composeCityStory(baseRankedCity({ stars: 5 }), "Stockholm", "Sweden", distances);
    expect(result.tradeOffs.length).toBeGreaterThan(0);
  });

  it("I004: composed output contains no prohibited language", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(findProhibitedPhrases(allText(result))).toEqual([]);
  });

  it("I005: composed output makes no practical-domain claims", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(findPracticalDomainClaims(allText(result))).toEqual([]);
  });

  it("includes technical details sourced directly from calculation output", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    const sunDetail = result.technicalDetails.find((d) => d.line.includes("Sun"));
    expect(sunDetail).toBeDefined();
    expect(sunDetail!.distanceKm).toBe(38);
    expect(sunDetail!.scenarioDistancesKm).toEqual([249, 38, 176]);
  });

  it("confidence explanation matches the stability label", () => {
    const result = composeCityStory(baseRankedCity({ stability: "TIME_SENSITIVE" }), "Lisbon", "Portugal", []);
    expect(result.confidenceExplanation).toBe("This recommendation depends significantly on your exact birth time.");
  });

  it("falls back to the weak-result copy when there is no primary influence", () => {
    const result = composeCityStory(
      baseRankedCity({ primaryInfluence: undefined, secondaryInfluences: [], stars: 1, coherence: "NONE", archetypeId: "UNCLASSIFIED" }),
      "Nowhere",
      "Nowhereland",
      []
    );
    expect(result.whyItStandsOut).toContain("Your map is more mixed for this goal.");
    expect(result.primaryInfluence).toBeUndefined();
  });
});
