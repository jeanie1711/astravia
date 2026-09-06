import type { CountryNarrative, Stars } from "../../scoring/types";

export type DiscoveryType = "STRONG_PATTERN" | "FAMILIAR" | "UNEXPECTED" | "WORTH_EXPLORING" | "WILDCARD";

export type DiscoveryCopy = { label: string; description: string };

// Population thresholds for a plain familiarity proxy -- real, already-
// sourced data (not an invented city fact), used only to frame the result
// honestly rather than as an astrological claim. Product feedback
// 2026-09-06: an unfamiliar country appearing with no context (Russia,
// Tajikistan, Svalbard...) reads as a data error rather than an
// intentional "unexpected discovery."
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
    description: "Several cities here align consistently, not just one -- the clustering itself is the signal."
  },
  FAMILIAR: {
    label: "Familiar possibility",
    description: "A widely recognized place that also carries a genuine signal here."
  },
  UNEXPECTED: {
    label: "Unexpected match",
    description:
      "A less familiar place surfaced by a genuinely strong signal. This is an astrological match, not yet a practical relocation recommendation."
  },
  WORTH_EXPLORING: {
    label: "Worth exploring",
    description: "A moderately familiar place with a real, if less dominant, signal."
  },
  WILDCARD: {
    label: "Wildcard",
    description: "An unusual, less familiar result. Worth a curious look, not a strong recommendation."
  }
};

export function getDiscoveryCopy(type: DiscoveryType): DiscoveryCopy {
  return DISCOVERY_COPY[type];
}

// Reuses the existing corridor/anchor hues for the two "structurally
// strong" cases, and puts the sky/sage/sun secondary accents (globals.css)
// to their intended use as category highlights for the three
// familiarity-driven cases -- no new tokens needed.
const DISCOVERY_COLORS: Record<DiscoveryType, { fg: string; bg: string }> = {
  STRONG_PATTERN: { fg: "var(--color-corridor)", bg: "var(--color-corridor-bg)" },
  FAMILIAR: { fg: "var(--color-anchor)", bg: "var(--color-anchor-bg)" },
  UNEXPECTED: { fg: "#3a7a8c", bg: "var(--color-sky-bg)" },
  WORTH_EXPLORING: { fg: "#4d7a3f", bg: "var(--color-sage-bg)" },
  WILDCARD: { fg: "#9c7423", bg: "var(--color-sun-bg)" }
};

export function getDiscoveryColors(type: DiscoveryType): { fg: string; bg: string } {
  return DISCOVERY_COLORS[type];
}
