import type { Angle, Body } from "../astro/types.js";
import { MODEL_VERSIONS } from "../config/versions.js";
import type { RankedCity } from "../scoring/types.js";
import { lookupSynthesis } from "./combinations.js";
import { confidenceExplanation, goalDisplayName, influenceLabel, starWording } from "./display.js";
import { getInterpretation } from "./library.js";
import type { CityResult, TechnicalDetail } from "./types.js";

export type InfluenceDistance = {
  body: Body;
  angle: Angle;
  distanceKm: number;
  scenarioDistancesKm: number[];
};

function findDistance(
  distances: InfluenceDistance[],
  body: Body,
  angle: Angle
): InfluenceDistance | undefined {
  return distances.find((d) => d.body === body && d.angle === angle);
}

function shareText(cityName: string, goalName: string, stars: number, theme: string | undefined): string {
  if (stars >= 4) {
    return `Apparently ${cityName} is one of my strongest ${goalName} cities ${"★".repeat(stars)}`;
  }
  if (stars === 3 && theme) {
    return `${cityName} showed up as a strong ${goalName} match -- and the reason is interesting.`;
  }
  return `${cityName} appeared in my astro map for ${goalName}.`;
}

// Composes the weak/mixed-result fallback story (05-result-content-
// framework.md §12) when no primary influence qualifies. Uses the exact
// approved copy from the screen spec rather than inventing a new claim.
function composeWeakResult(rankedCity: RankedCity, cityName: string, countryName: string): CityResult {
  const goalName = goalDisplayName(rankedCity.goal);
  return {
    city: cityName,
    country: countryName,
    goal: rankedCity.goal,
    stars: rankedCity.stars,
    ratingLabel: rankedCity.label,
    archetypeId: rankedCity.archetypeId,
    primaryTheme: "",
    secondaryThemes: [],
    hook: starWording(rankedCity.stars, rankedCity.goal),
    whyItStandsOut:
      "Your map is more mixed for this goal. These are the locations with the clearest signals in the current model, even though none stand out as an exceptional match.",
    opportunities: [],
    tradeOffs: [],
    howItMayFeel: "Like the signal here is more mixed than clear.",
    bestFor: [],
    birthTimeConfidence: rankedCity.stability,
    confidenceExplanation: confidenceExplanation(rankedCity.stability),
    primaryInfluence: undefined,
    secondaryInfluences: [],
    technicalDetails: [],
    shareText: shareText(cityName, goalName, rankedCity.stars, undefined),
    calculationVersion: MODEL_VERSIONS.calculation,
    scoringVersion: MODEL_VERSIONS.scoring,
    interpretationVersion: MODEL_VERSIONS.interpretation
  };
}

// Composes the full City Story (05-result-content-framework.md §18 schema)
// from a scored RankedCity. Only reads structured scoring/calculation
// output and the approved content library -- never recalculates astronomy
// or scoring, per CLAUDE.md §3's layer separation.
export function composeCityStory(
  rankedCity: RankedCity,
  cityName: string,
  countryName: string,
  influenceDistances: InfluenceDistance[]
): CityResult {
  if (!rankedCity.primaryInfluence) {
    return composeWeakResult(rankedCity, cityName, countryName);
  }

  const primary = rankedCity.primaryInfluence;
  const primaryInterp = getInterpretation(primary.body, primary.angle);
  const secondaryInterps = rankedCity.secondaryInfluences.map((s) => getInterpretation(s.body, s.angle));

  const [firstSecondary] = rankedCity.secondaryInfluences;
  const [firstSecondaryInterp] = secondaryInterps;

  // Why it stands out: primary first, then a synthesized (not concatenated)
  // secondary influence when one exists (spec §6-§7: use an explicit
  // combination rule where available; never dump two independent
  // definitions back to back).
  const sentences: string[] = [
    `Your ${influenceLabel(primary.body, primary.angle)} influence is especially strong here.`,
    `In astrocartography, this combination is traditionally associated with ${primaryInterp.coreTheme}.`
  ];
  if (firstSecondary && firstSecondaryInterp) {
    const synthesis = lookupSynthesis(primary, firstSecondary);
    sentences.push(
      synthesis
        ? `${synthesis.synthesis} ${synthesis.story}`
        : `A ${influenceLabel(firstSecondary.body, firstSecondary.angle)} influence adds ${firstSecondaryInterp.coreTheme}, and ${firstSecondaryInterp.tradeOff[0]} is worth keeping in mind.`
    );
  }

  const tradeOffs = [...primaryInterp.tradeOff];
  if (firstSecondaryInterp && !tradeOffs.includes(firstSecondaryInterp.tradeOff[0]!)) {
    tradeOffs.push(firstSecondaryInterp.tradeOff[0]!);
  }

  const technicalDetails: TechnicalDetail[] = [];
  const primaryDistance = findDistance(influenceDistances, primary.body, primary.angle);
  if (primaryDistance) {
    technicalDetails.push({
      line: influenceLabel(primary.body, primary.angle),
      distanceKm: primaryDistance.distanceKm,
      scenarioDistancesKm: primaryDistance.scenarioDistancesKm
    });
  }
  for (const secondary of rankedCity.secondaryInfluences) {
    const distance = findDistance(influenceDistances, secondary.body, secondary.angle);
    if (distance) {
      technicalDetails.push({
        line: influenceLabel(secondary.body, secondary.angle),
        distanceKm: distance.distanceKm,
        scenarioDistancesKm: distance.scenarioDistancesKm
      });
    }
  }

  const goalName = goalDisplayName(rankedCity.goal);
  const primaryTheme = primaryInterp.bestFor[0] ?? primaryInterp.coreTheme;

  return {
    city: cityName,
    country: countryName,
    goal: rankedCity.goal,
    stars: rankedCity.stars,
    ratingLabel: rankedCity.label,
    archetypeId: rankedCity.archetypeId,
    primaryTheme,
    secondaryThemes: secondaryInterps.map((s) => s.bestFor[0] ?? s.coreTheme),
    hook: starWording(rankedCity.stars, rankedCity.goal),
    whyItStandsOut: sentences.join(" "),
    opportunities: primaryInterp.opportunity.slice(0, 5),
    tradeOffs,
    howItMayFeel: primaryInterp.feel[0]!,
    bestFor: primaryInterp.bestFor.slice(0, 5),
    birthTimeConfidence: rankedCity.stability,
    confidenceExplanation: confidenceExplanation(rankedCity.stability),
    primaryInfluence: primary,
    secondaryInfluences: rankedCity.secondaryInfluences,
    technicalDetails,
    shareText: shareText(cityName, goalName, rankedCity.stars, primaryTheme),
    calculationVersion: MODEL_VERSIONS.calculation,
    scoringVersion: MODEL_VERSIONS.scoring,
    interpretationVersion: MODEL_VERSIONS.interpretation
  };
}
