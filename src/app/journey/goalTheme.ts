import type { Language } from "../../i18n/types";
import type { ScorableGoal } from "../../scoring/types";

// The single source of truth for each goal's display name and semantic
// color (product feedback 2026-09-07, §3/§13: these colors represent
// meaning and must stay identical everywhere a goal appears -- result
// bars, tab markers, priority-chip accents, badges). Previously
// duplicated between GoalBreakdownBars.tsx and results/page.tsx.
const GOAL_LABEL_EN: Record<ScorableGoal, string> = {
  CAREER: "Career",
  LOVE: "Love & Relationships",
  HOME: "Home & Family",
  GROWTH: "Personal Growth"
};

const GOAL_LABEL_VI: Record<ScorableGoal, string> = {
  CAREER: "Sự nghiệp",
  LOVE: "Tình cảm & Các mối quan hệ",
  HOME: "Nhà cửa & Gia đình",
  GROWTH: "Phát triển bản thân"
};

export function goalLabelFor(goal: ScorableGoal, language: Language): string {
  return (language === "vi" ? GOAL_LABEL_VI : GOAL_LABEL_EN)[goal];
}

export const GOAL_COLOR: Record<ScorableGoal, string> = {
  CAREER: "var(--astravia-career)",
  LOVE: "var(--astravia-love)",
  HOME: "var(--astravia-home)",
  GROWTH: "var(--astravia-growth)"
};

export const GOAL_COLOR_BG: Record<ScorableGoal, string> = {
  CAREER: "var(--astravia-career-bg)",
  LOVE: "var(--astravia-love-bg)",
  HOME: "var(--astravia-home-bg)",
  GROWTH: "var(--astravia-growth-bg)"
};
