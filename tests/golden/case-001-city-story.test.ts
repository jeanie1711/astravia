import { describe, expect, it } from "vitest";
import { computeCityInfluencesAcrossScenarios } from "../../src/astro/sensitivity.js";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../src/astro/time.js";
import type { City } from "../../src/astro/types.js";
import { composeCityStory, type InfluenceDistance } from "../../src/interpretation/compose-city-story.js";
import { findPracticalDomainClaims, findProhibitedPhrases } from "../../src/interpretation/safety.js";
import { toScenarioInfluences } from "../../src/scoring/from-calculation.js";
import { scoreCity } from "../../src/scoring/score-city.js";

// End-to-end Golden Case 001: calculation -> scoring -> interpretation,
// exactly the pipeline order CLAUDE.md §3 requires. This is the fullest
// regression guard -- it would catch a break in any of the three layers.
const stockholm: City = {
  id: "stockholm",
  name: "Stockholm",
  countryCode: "SE",
  countryName: "Sweden",
  latitude: 59.3293,
  longitude: 18.0686
};

describe("Golden Case 001 - full City Story composition", () => {
  it("Stockholm Career: coherent, traceable, safe City Story with the documented trade-off", () => {
    const resolution = resolveBirthInstant({
      birthDate: "1987-11-17",
      birthLocalTime: "17:30",
      birthPlaceLabel: "Nha Trang, Vietnam",
      latitude: 12.2388,
      longitude: 109.1967,
      timeZoneId: "Asia/Ho_Chi_Minh"
    });
    if (!resolution.ok) throw new Error("Could not resolve Case 001 baseline instant");
    const scenarios = buildUncertaintyScenarios(resolution.resolved.utcIso, 15);

    const cityInfluences = computeCityInfluencesAcrossScenarios(scenarios, [stockholm]);
    const scenarioInfluences = toScenarioInfluences(cityInfluences);
    const rankedCity = scoreCity("stockholm", "CAREER", scenarioInfluences, 15);

    const influenceDistances: InfluenceDistance[] = cityInfluences.map((r) => ({
      body: r.cityInfluence.body,
      angle: r.cityInfluence.angle,
      distanceKm: r.cityInfluence.distanceKm,
      scenarioDistancesKm: r.cityInfluence.scenarioDistancesKm
    }));

    const story = composeCityStory(rankedCity, "Stockholm", "Sweden", influenceDistances);

    // Traceability: primary first, technical details match calculation output.
    expect(story.primaryInfluence).toEqual({ body: "Sun", angle: "MC" });
    expect(story.whyItStandsOut.startsWith("Your ☉ Sun–MC influence is especially strong here.")).toBe(true);
    const sunDetail = story.technicalDetails.find((d) => d.line.includes("Sun"));
    expect(sunDetail?.distanceKm).toBeCloseTo(38, -1); // close to the ~38km reference fixture

    // Must not be described as purely easy/beneficial (Golden Test doc §4:
    // "Must not describe Stockholm as purely easy/beneficial").
    expect(story.tradeOffs.length).toBeGreaterThan(0);

    // Birth-time confidence matches the HIGH stability behavior fixture.
    expect(story.birthTimeConfidence).toBe("HIGH");
    expect(story.confidenceExplanation).toBe(
      "This location remains one of your stronger matches across your full birth-time range."
    );

    // Safety/integrity.
    const combinedText = [
      story.hook,
      story.whyItStandsOut,
      ...story.opportunities,
      ...story.tradeOffs,
      story.howItMayFeel,
      story.shareText
    ].join(" ");
    expect(findProhibitedPhrases(combinedText)).toEqual([]);
    expect(findPracticalDomainClaims(combinedText)).toEqual([]);

    // Determinism: same input -> same composed output.
    const storyAgain = composeCityStory(rankedCity, "Stockholm", "Sweden", influenceDistances);
    expect(JSON.stringify(story)).toBe(JSON.stringify(storyAgain));
  });
});
