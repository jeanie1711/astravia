import type { Body } from "../astro/types";
import type { CandidateInfluence, CoherenceLabel } from "./types";

// The 12 narrative archetype categories (06-interpretation-library.md §4).
// Selection here is a structural classification only (primary body/angle +
// coherence pattern) -- the actual archetype NAME/description copy lives in
// the interpretation layer (src/interpretation/archetypes.ts), keyed by
// this id, per the calculation -> scoring -> interpretation pipeline
// (CLAUDE.md §3).
export type ArchetypeId =
  | "VISIBILITY"
  | "EXPANSION"
  | "CONNECTION"
  | "BELONGING"
  | "CONNECTOR"
  | "MOMENTUM"
  | "BUILDER"
  | "REINVENTION"
  | "VISION"
  | "TRANSFORMATION"
  | "LAYERED"
  | "BALANCED"
  | "UNCLASSIFIED"; // documented MVP addition: no primary influence, or a
  // primary body with no matching top-level category (spec §4 leaves Moon
  // unassigned except via the IC/BELONGING case -- see docs/DECISIONS.md).

const IC_BELONGING_BODIES: readonly Body[] = ["Moon", "Jupiter", "Venus"];

const BODY_ARCHETYPE: Partial<Record<Body, ArchetypeId>> = {
  Sun: "VISIBILITY",
  Jupiter: "EXPANSION",
  Venus: "CONNECTION",
  Mercury: "CONNECTOR",
  Mars: "MOMENTUM",
  Saturn: "BUILDER",
  Uranus: "REINVENTION",
  Neptune: "VISION",
  Pluto: "TRANSFORMATION"
};

// Selects a city/goal's narrative archetype from its primary influence and
// coherence label (spec §4). LOW coherence (a strong supportive signal
// alongside a strong tension signal) takes priority over the body-based
// category, matching the spec's own "VISIBILITY or LAYERED" acceptance for
// exactly this kind of case (e.g. Sun-MC with a high-tension secondary).
export function selectArchetype(
  primary: CandidateInfluence | undefined,
  coherence: CoherenceLabel
): ArchetypeId {
  if (!primary) {
    return "UNCLASSIFIED";
  }

  if (coherence === "LOW") {
    return "LAYERED";
  }

  if (primary.angle === "IC" && IC_BELONGING_BODIES.includes(primary.body)) {
    return "BELONGING";
  }

  return BODY_ARCHETYPE[primary.body] ?? "UNCLASSIFIED";
}
