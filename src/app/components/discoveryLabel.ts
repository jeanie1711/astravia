import type { CountryNarrative, Stars } from "../../scoring/types";

export type DiscoveryType = "STRONG_PATTERN" | "FAMILIAR" | "UNEXPECTED" | "WORTH_EXPLORING" | "WILDCARD";

// `accent` marks the two genuine "discovery moment" framings, which get a
// small sunlit-gold star glyph next to an otherwise neutral tag (product
// feedback 2026-09-07, §3 lists "discovery moments" as a valid small use
// of gold; §19 says general descriptive tags stay neutral, not brightly
// colored) -- gold marks the moment, it never fills the whole badge.
export type DiscoveryCopy = { label: string; description: string; accent: boolean };

// Population thresholds for a plain familiarity proxy -- real, already-
// sourced data (not an invented city fact), used only to frame the result
// honestly rather than as an astrological claim. An unfamiliar country
// appearing with no context (Russia, Tajikistan, Svalbard...) reads as a
// data error rather than an intentional "unexpected discovery."
const WELL_KNOWN_POPULATION = 2_000_000;
const OBSCURE_POPULATION = 300_000;

// Classifies a country result into one of five discovery framings. A
// CORRIDOR narrative (several strong cities, not just one) always reads as
// "Strong regional pattern" regardless of familiarity -- that clustering is
// itself the notable signal. Otherwise, framing follows how well-known the
// country's top city is and how strong the match is.
export function classifyDiscovery(
  narrative: CountryNarrative,
  stars: Stars,
  topCityPopulation: number | undefined
): DiscoveryType {
  if (narrative === "CORRIDOR") return "STRONG_PATTERN";

  const population = topCityPopulation ?? 0;
  if (population >= WELL_KNOWN_POPULATION) return "FAMILIAR";
  if (population < OBSCURE_POPULATION) return stars >= 4 ? "UNEXPECTED" : "WILDCARD";
  return "WORTH_EXPLORING";
}

const DISCOVERY_COPY: Record<DiscoveryType, DiscoveryCopy> = {
  STRONG_PATTERN: {
    label: "Strong regional pattern",
    description: "Several cities here align consistently, not just one; the clustering itself is the signal.",
    accent: false
  },
  FAMILIAR: {
    label: "Familiar possibility",
    description: "A widely recognized place that also carries a genuine signal here.",
    accent: false
  },
  UNEXPECTED: {
    label: "Unexpected match",
    description:
      "A less familiar place surfaced by a genuinely strong signal. This is an astrological match, not yet a practical relocation recommendation.",
    accent: true
  },
  WORTH_EXPLORING: {
    label: "Worth exploring",
    description: "A moderately familiar place with a real, if less dominant, signal.",
    accent: false
  },
  WILDCARD: {
    label: "Wildcard",
    description: "An unusual, less familiar result. Worth a curious look, not a strong recommendation.",
    accent: true
  }
};

export function getDiscoveryCopy(type: DiscoveryType): DiscoveryCopy {
  return DISCOVERY_COPY[type];
}

// A single neutral pale-sky/teal treatment for every discovery badge
// (product feedback 2026-09-07, §19: general descriptive tags stay
// neutral -- only a life-theme tag earns its own bright color).
export function getDiscoveryColors(): { fg: string; bg: string } {
  return { fg: "var(--astravia-ink)", bg: "var(--astravia-surface-alt)" };
}
