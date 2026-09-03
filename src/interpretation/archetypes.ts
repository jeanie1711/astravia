import type { ArchetypeId } from "../scoring/archetype";

// Display copy for the 12 narrative archetype categories
// (06-interpretation-library.md §4 / 05-result-content-framework.md §9).
// "Archetypes are editorial summaries, not astrological entities... useful
// for content composition" -- these are short, generic labels, not
// per-influence prose (that lives in library.ts's 40 entries).
export type ArchetypeCopy = {
  name: string;
  description: string;
};

const ARCHETYPE_COPY: Record<ArchetypeId, ArchetypeCopy> = {
  VISIBILITY: { name: "The Visibility Place", description: "Public identity and professional direction come into focus." },
  EXPANSION: { name: "The Expansion Place", description: "Opportunity and growth are the dominant theme." },
  CONNECTION: { name: "The Connection Place", description: "Attraction, social ease and collaboration stand out." },
  BELONGING: { name: "The Belonging Place", description: "Home, roots and emotional grounding are central." },
  CONNECTOR: { name: "The Connector Place", description: "Communication, ideas and networks are emphasised." },
  MOMENTUM: { name: "The Momentum Place", description: "Ambition and decisive action are foregrounded." },
  BUILDER: { name: "The Builder Place", description: "Structure, responsibility and long-term achievement lead the story." },
  REINVENTION: { name: "The Reinvention Place", description: "Independence and a radical self-update are emphasised." },
  VISION: { name: "The Vision Place", description: "Imagination and ideals shape the story, with more ambiguity." },
  TRANSFORMATION: { name: "The Transformation Place", description: "Deep change and power dynamics are foregrounded." },
  LAYERED: { name: "The Layered Place", description: "A strong supportive signal sits alongside a strong tension signal." },
  BALANCED: { name: "The Balanced Place", description: "Meaningful support appears across several life themes rather than one dominant line." },
  UNCLASSIFIED: { name: "The Emerging Place", description: "No single influence dominates the story here." }
};

export function getArchetypeCopy(archetypeId: string): ArchetypeCopy {
  return ARCHETYPE_COPY[archetypeId as ArchetypeId] ?? ARCHETYPE_COPY.UNCLASSIFIED;
}
