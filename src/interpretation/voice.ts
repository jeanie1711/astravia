import type { Body } from "../astro/types";
import type { Goal } from "../scoring/types";
import type { Tone } from "./types";

// Small, reusable phrase vocabulary (2026-09-13 City Story redesign) that
// turns the 40-entry library's existing coreTheme/opportunity/tradeOff/
// feel/bestFor data into fuller prose, without hand-authoring unique text
// per city or per influence pair (955 cities x 4 goals x many combinations
// would make that impossible to maintain). Each table below has exactly
// one entry per planet (or per tone/goal) -- a bounded, reviewable set --
// derived from that planet's own already-approved coreTheme vocabulary
// across its four entries, not new astrological meaning.

// The planet's inner faculty as a short third-paragraph-opener phrase,
// e.g. "A place where {rawMaterial} can become {outcome}...".
export const RAW_MATERIAL: Record<Body, string> = {
  Sun: "presence",
  Moon: "instinct",
  Mercury: "ideas",
  Venus: "charm",
  Mars: "drive",
  Jupiter: "optimism",
  Saturn: "discipline",
  Uranus: "originality",
  Neptune: "imagination",
  Pluto: "intensity"
};

// The fuller 3-part version for the opening paragraph: "{City} places
// {FACULTY_PHRASE} at the centre of your {goal} story."
export const FACULTY_PHRASE: Record<Body, string> = {
  Sun: "your presence, confidence and visibility",
  Moon: "your instincts, care and emotional awareness",
  Mercury: "your voice, ideas and ability to connect",
  Venus: "your charm, taste and gift for connection",
  Mars: "your drive, initiative and willingness to act",
  Jupiter: "your optimism, growth and sense of possibility",
  Saturn: "your discipline, patience and staying power",
  Uranus: "your independence, originality and appetite for change",
  Neptune: "your imagination, empathy and intuition",
  Pluto: "your intensity, depth and capacity to transform"
};

// What the planet's energy becomes when it succeeds -- pairs with
// RAW_MATERIAL in the tagline: "{raw} can become {outcome}".
export const OUTCOME: Record<Body, string> = {
  Sun: "recognition",
  Moon: "belonging",
  Mercury: "influence",
  Venus: "connection",
  Mars: "momentum",
  Jupiter: "opportunity",
  Saturn: "achievement",
  Uranus: "reinvention",
  Neptune: "meaning",
  Pluto: "transformation"
};

// Closing-line opener: "In {city}, {OPEN_DOOR}."
export const OPEN_DOOR: Record<Body, string> = {
  Sun: "your visibility may open the door",
  Moon: "your instincts may open the door",
  Mercury: "conversations may open the door",
  Venus: "connection may open the door",
  Mars: "bold action may open the door",
  Jupiter: "opportunity may open the door",
  Saturn: "consistency may open the door",
  Uranus: "a break from routine may open the door",
  Neptune: "a compelling vision may open the door",
  Pluto: "a willingness to go deep may open the door"
};

// The reinforcing influence's own "what carries it through" quality --
// used both in the tagline ("when it is backed by {QUALITY}") and the
// closing line ("{QUALITY} may determine how far it leads").
export const QUALITY: Record<Body, string> = {
  Sun: "your ability to keep showing up",
  Moon: "your emotional steadiness",
  Mercury: "your ability to follow through on what you say",
  Venus: "your ability to keep things balanced",
  Mars: "your ability to manage the friction you create",
  Jupiter: "your ability to follow through on big opportunities",
  Saturn: "your ability to follow through",
  Uranus: "your comfort with unpredictability",
  Neptune: "your ability to stay grounded",
  Pluto: "your ability to handle intensity"
};

// Weight/tension a challenging planet (Mars, Saturn, Uranus, Neptune,
// Pluto -- CHALLENGING in combinations.ts) adds when it reinforces an
// easeful primary, for the LAYERED-tier paragraph. Only these five
// appear as the challenging half of a mixed pair.
export const WEIGHT: Partial<Record<Body, string>> = {
  Mars: "urgency and friction",
  Saturn: "weight and responsibility",
  Uranus: "unpredictability",
  Neptune: "ambiguity",
  Pluto: "intensity"
};

export const FEEL_TONE_ADJECTIVE: Record<Tone, string> = {
  outward: "Energetic and visible",
  inward: "Quiet and reflective",
  relational: "Connected and relationship-focused",
  transformative: "Intense and fast-moving",
  mixed: "Emotionally attuned"
};

export const GOAL_STORY_NOUN: Record<Goal, string> = {
  CAREER: "professional",
  LOVE: "relationship",
  HOME: "home",
  GROWTH: "personal growth",
  OVERALL: "life"
};

// Short lowercase goal word for the City Story header's "Strongest {x}
// match" line -- distinct from GOAL_STORY_NOUN and the shared
// goalDisplayName()/GOAL_LABEL, which are full display names not built
// to sit directly before the word "match".
export const SHORT_GOAL_LABEL: Record<Goal, string> = {
  CAREER: "career",
  LOVE: "love",
  HOME: "home",
  GROWTH: "growth",
  OVERALL: "overall"
};

// "a, b and c" -- Oxford-comma-free, matching the rest of the app's list
// style (chip rows, bestFor lists).
export function joinList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function capitalize(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}
