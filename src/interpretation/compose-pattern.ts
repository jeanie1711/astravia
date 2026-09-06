import type { Influence, RankedCity, StabilityLabel } from "../scoring/types";

// "Your Pattern" (06-interpretation-library.md §8): derived only from
// aggregate structured calculation/scoring data, never claims a fixed
// psychological trait, and is omitted entirely when no threshold is met
// (product brief §11, result-content-framework §10).
const MIN_PATTERN_COUNT = 3;

// Renamed "Your Pattern" -> "Your location story" in the UI (product
// feedback 2026-09-06): the sentence alone read like a report conclusion.
// `chips` are short labels for the same already-approved sentence, not new
// interpretive claims -- one fixed set per pattern branch below.
export type PatternResult = { sentence: string; chips: string[] };

function includesInfluence(influences: Influence[], body: Influence["body"], angle?: Influence["angle"]): boolean {
  return influences.some((i) => i.body === body && (angle === undefined || i.angle === angle));
}

function cityHasInfluence(city: RankedCity, body: Influence["body"], angle?: Influence["angle"]): boolean {
  const primaryMatches = city.primaryInfluence ? includesInfluence([city.primaryInfluence], body, angle) : false;
  return primaryMatches || includesInfluence(city.secondaryInfluences, body, angle);
}

function countByStability(cities: RankedCity[], labels: StabilityLabel[]): number {
  return cities.filter((c) => labels.includes(c.stability)).length;
}

// Returns one pattern sentence plus its chips, or undefined if no
// documented threshold is met (the Results page then omits the "Your
// location story" section entirely).
export function detectPattern(topCities: RankedCity[]): PatternResult | undefined {
  const sunMcCount = topCities.filter((c) => cityHasInfluence(c, "Sun", "MC")).length;
  if (sunMcCount >= MIN_PATTERN_COUNT) {
    return {
      sentence: "Visibility and professional identity repeat across several of your strongest locations.",
      chips: ["Visibility", "Professional identity", "Public recognition"]
    };
  }

  const venusAngularCount = topCities.filter((c) => cityHasInfluence(c, "Venus")).length;
  if (venusAngularCount >= MIN_PATTERN_COUNT) {
    return {
      sentence: "Connection, collaboration and social ease are recurring themes across your map.",
      chips: ["Connection", "Collaboration", "Social ease"]
    };
  }

  const saturnOrPlutoSecondaryCount = topCities.filter(
    (c) => includesInfluence(c.secondaryInfluences, "Saturn") || includesInfluence(c.secondaryInfluences, "Pluto")
  ).length;
  if (saturnOrPlutoSecondaryCount >= MIN_PATTERN_COUNT) {
    return {
      sentence:
        "Many of your strongest places pair opportunity with responsibility or transformation; your map is not primarily an \"easy path\" pattern.",
      chips: ["Reinvention", "Purpose over ease", "Growth through responsibility"]
    };
  }

  const highStabilityCount = countByStability(topCities, ["HIGH", "EXACT"]);
  if (highStabilityCount >= MIN_PATTERN_COUNT) {
    return {
      sentence: "Your strongest recommendations remain relatively consistent across your birth-time range.",
      chips: ["Consistency", "Stable across birth times"]
    };
  }

  const timeSensitiveCount = countByStability(topCities, ["TIME_SENSITIVE"]);
  if (timeSensitiveCount >= MIN_PATTERN_COUNT) {
    return {
      sentence:
        "Your ranking changes noticeably across your birth-time range, so exact birth time matters more for this chart.",
      chips: ["Time-sensitive", "Birth time matters here"]
    };
  }

  return undefined;
}
