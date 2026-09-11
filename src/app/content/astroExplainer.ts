// Shared "how astrocartography works" content -- used by the landing
// page's collapsible explainer and the full PDF report's introduction
// page, so the two stay in sync instead of drifting copies.

export const PLANETS: Array<{ symbol: string; name: string; theme: string }> = [
  { symbol: "☉", name: "Sun", theme: "identity, vitality, recognition" },
  { symbol: "☽", name: "Moon", theme: "emotional life, instinct, care" },
  { symbol: "☿", name: "Mercury", theme: "communication, ideas, curiosity" },
  { symbol: "♀", name: "Venus", theme: "attraction, harmony, connection" },
  { symbol: "♂", name: "Mars", theme: "drive, action, assertiveness" },
  { symbol: "♃", name: "Jupiter", theme: "growth, opportunity, optimism" },
  { symbol: "♄", name: "Saturn", theme: "responsibility, structure, discipline" },
  { symbol: "♅", name: "Uranus", theme: "independence, change, innovation" },
  { symbol: "♆", name: "Neptune", theme: "imagination, sensitivity, ideals" },
  { symbol: "♇", name: "Pluto", theme: "transformation, intensity, power" }
];

export const ANGLES: Array<{ id: string; fullName: string; position: string; meaning: string }> = [
  {
    id: "MC",
    fullName: "Medium Coeli",
    position: "The highest point in the sky, directly overhead.",
    meaning: "Career, reputation, and public life"
  },
  {
    id: "IC",
    fullName: "Imum Coeli",
    position: "The point opposite MC, directly underfoot.",
    meaning: "Home, roots, and private life"
  },
  {
    id: "ASC",
    fullName: "Ascendant",
    position: "The eastern horizon, where a planet is rising.",
    meaning: "Identity, and how you show up in the world"
  },
  {
    id: "DSC",
    fullName: "Descendant",
    position: "The western horizon, where a planet is setting.",
    meaning: "Relationships, and the people around you"
  }
];
