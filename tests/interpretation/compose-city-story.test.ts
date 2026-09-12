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
    paranInfluence: undefined,
    coherence: "LAYERED",
    stability: "HIGH",
    archetypeId: "VISIBILITY",
    ...overrides
  };
}

function allText(result: ReturnType<typeof composeCityStory>): string {
  return [
    result.hook,
    result.tagline,
    result.whyItStandsOut,
    ...result.opportunities,
    ...result.tradeOffs,
    result.howItMayFeel,
    result.howItMayFeelDetail,
    result.shareText
  ].join(" ");
}

const distances: InfluenceDistance[] = [
  { body: "Sun", angle: "MC", distanceKm: 38, scenarioDistancesKm: [249, 38, 176] },
  { body: "Neptune", angle: "ASC", distanceKm: 39, scenarioDistancesKm: [109, 39, 172] }
];

describe("composeCityStory", () => {
  it("I001: primary influence is introduced before any secondary content", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    const primaryIndex = result.whyItStandsOut.indexOf("☉ Sun–MC influence");
    const secondaryIndex = result.whyItStandsOut.indexOf("Neptune");
    expect(primaryIndex).toBeGreaterThanOrEqual(0);
    expect(secondaryIndex).toBeGreaterThan(primaryIndex);
  });

  it("I002: uses the category-tier synthesis pattern instead of concatenating two independent definitions", () => {
    // Sun (Personal) + Neptune (Transformative) is a mixed pair -> Layered
    // tier (04-scoring-ranking-spec.md v0.2 §6), primary (Sun) is the
    // easeful side here so the reinforcement is what "adds" weight.
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.whyItStandsOut).toContain("not simply a straightforward Sun story");
    expect(result.whyItStandsOut).toContain("visibility, professional identity, recognition");
    expect(result.whyItStandsOut).toContain("intuition and art");
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

  it("names a paran as its own distinct signal, not folded into secondary influences (06 §5)", () => {
    const result = composeCityStory(
      baseRankedCity({ secondaryInfluences: [], paranInfluence: { body: "Jupiter", angle: "ASC" } }),
      "Stockholm",
      "Sweden",
      distances
    );
    expect(result.paranInfluence).toEqual({ body: "Jupiter", angle: "ASC" });
    expect(result.whyItStandsOut).toContain("Sun–Jupiter paran");
    expect(result.secondaryThemes).toContain("personal growth"); // Jupiter-ASC's bestFor[0]
    expect(result.influenceDetails.some((d) => d.role === "Paran" && d.body === "Jupiter")).toBe(true);
  });

  it("composes a one-line tagline synthesizing the primary and its reinforcement", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.tagline.length).toBeGreaterThan(0);
    expect(result.tagline).toContain("presence");
    expect(result.tagline).toContain("recognition");
  });

  it("expands howItMayFeel with a second paragraph when a reinforcement exists", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.howItMayFeel).toBe("Like staying in the background becomes harder.");
    expect(result.howItMayFeelDetail.length).toBeGreaterThan(0);
  });

  it("lists every influence's plain-language theme for the astrology reference section", () => {
    const result = composeCityStory(baseRankedCity({}), "Stockholm", "Sweden", distances);
    expect(result.influenceDetails).toEqual([
      { role: "Primary", body: "Sun", angle: "MC", description: "Visibility, professional identity, recognition." },
      { role: "Secondary", body: "Neptune", angle: "ASC", description: "Sensitivity, imagination, porous identity." }
    ]);
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
    expect(result.tagline).toBe("");
    expect(result.howItMayFeelDetail).toBe("");
    expect(result.influenceDetails).toEqual([]);
  });
});
