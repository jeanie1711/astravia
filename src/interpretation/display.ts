import type { Angle, Body } from "../astro/types";
import type { Goal } from "../scoring/types";

// Presentation-only lookups: no business logic, just approved display copy.
const GOAL_DISPLAY_NAME: Record<Goal, string> = {
  CAREER: "Career",
  LOVE: "Love & Relationships",
  HOME: "Home & Family",
  GROWTH: "Personal Growth",
  OVERALL: "Overall"
};

export function goalDisplayName(goal: Goal): string {
  return GOAL_DISPLAY_NAME[goal];
}

const BODY_SYMBOL: Record<Body, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇"
};

export function bodySymbol(body: Body): string {
  return BODY_SYMBOL[body];
}

export function influenceLabel(body: Body, angle: Angle): string {
  return `${bodySymbol(body)} ${body}–${angle}`;
}

// Star wording (06-interpretation-library.md §7) -- approved fixed
// templates, substituting the goal display name.
export function starWording(stars: 1 | 2 | 3 | 4 | 5, goal: Goal): string {
  const goalName = goalDisplayName(goal);
  switch (stars) {
    case 5:
      return `One of your clearest locations for ${goalName}.`;
    case 4:
      return `A strong location for ${goalName}, with some meaningful trade-offs.`;
    case 3:
      return "A layered location with both opportunity and challenge.";
    case 2:
      return `A strong influence is present, but it may feel demanding for ${goalName}.`;
    case 1:
      return `This location is not strongly emphasised for ${goalName} in this model.`;
  }
}

// Birth-time confidence short label (05-result-content-framework.md §G).
export function confidenceLabel(stability: "EXACT" | "HIGH" | "MEDIUM" | "TIME_SENSITIVE"): string {
  switch (stability) {
    case "EXACT":
      return "Exact-time calculation";
    case "HIGH":
      return "High confidence";
    case "MEDIUM":
      return "Medium confidence";
    case "TIME_SENSITIVE":
      return "Time-sensitive";
  }
}

// Birth-time confidence wording (06-interpretation-library.md §6).
export function confidenceExplanation(stability: "EXACT" | "HIGH" | "MEDIUM" | "TIME_SENSITIVE"): string {
  switch (stability) {
    case "EXACT":
      return "Calculated using the exact birth time you entered.";
    case "HIGH":
      return "This location remains one of your stronger matches across your full birth-time range.";
    case "MEDIUM":
      return "This location remains meaningful, although its strength changes depending on your exact birth time.";
    case "TIME_SENSITIVE":
      return "This recommendation depends significantly on your exact birth time.";
  }
}
