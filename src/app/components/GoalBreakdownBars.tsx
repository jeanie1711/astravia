import { useEffect, useState } from "react";
import { scoreToDisplayValue } from "../../scoring/score-city";
import { SCORABLE_GOALS, type ScorableGoal, type Stars } from "../../scoring/types";
import { GOAL_COLOR } from "../journey/goalTheme";
import type { GoalBreakdown } from "../journey/types";

// Short, single-word labels for this compact bar layout -- the shared
// GOAL_LABEL in journey/goalTheme.ts uses full names ("Love &
// Relationships") which don't fit a narrow row label.
const GOAL_LABELS: Record<ScorableGoal, string> = {
  CAREER: "Career",
  LOVE: "Love",
  HOME: "Home",
  GROWTH: "Growth"
};

// Overall reads as a confusing 5th goal unless a card can show it's a
// synthesis of the other four. This renders that synthesis directly on a
// result card: one auto-generated sentence plus a small four-row
// breakdown, reusing the same fractional fill scale as the main star
// rating (scoreToDisplayValue) so the two stay visually consistent. No
// decimal numbers are printed next to the bars -- CLAUDE.md §11 keeps
// internal scores out of the UI, and showing stars/a decimal/a bar for the
// same value would violate §13's own "don't triple up on one signal" rule.
export function GoalBreakdownBars({ breakdown }: { breakdown: GoalBreakdown }) {
  const rows = SCORABLE_GOALS.map((goal) => ({ goal, entry: breakdown[goal] })).filter(
    (r): r is { goal: ScorableGoal; entry: { stars: Stars; internalScore: number } } => r.entry !== undefined
  );
  // Fills in from 0 on mount rather than appearing pre-filled.
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (rows.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 14,
        paddingTop: 14,
        borderTop: "1px solid var(--astravia-border)"
      }}
    >
      <div style={{ font: "500 13px/1.5 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 10 }}>
        {summarizeBreakdown(rows)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.map(({ goal, entry }) => {
          const fillPercent = Math.min(100, Math.max(0, (scoreToDisplayValue(entry.internalScore, entry.stars) / 5) * 100));
          return (
            <div key={goal} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 52, font: "600 12px var(--font-body)", color: "var(--astravia-ink)" }}>
                {GOAL_LABELS[goal]}
              </div>
              <div
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 100,
                  background: "var(--astravia-track)",
                  overflow: "hidden"
                }}
              >
                <div
                  className="astravia-bar-fill"
                  style={{
                    width: filled ? `${fillPercent}%` : "0%",
                    height: "100%",
                    borderRadius: 100,
                    background: GOAL_COLOR[goal]
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function summarizeBreakdown(rows: Array<{ goal: ScorableGoal; entry: { stars: Stars } }>): string {
  const maxStars = Math.max(...rows.map((r) => r.entry.stars));
  const minStars = Math.min(...rows.map((r) => r.entry.stars));
  const leaders = rows.filter((r) => r.entry.stars === maxStars).map((r) => GOAL_LABELS[r.goal]);

  if (maxStars - minStars <= 1) {
    return "A fairly balanced fit across Career, Love, Home, and Growth.";
  }
  if (leaders.length === rows.length) {
    return "A fairly balanced fit across Career, Love, Home, and Growth.";
  }
  if (leaders.length === 1) {
    return `Strongest for ${leaders[0]}.`;
  }
  return `Strongest for ${joinWithAnd(leaders)}.`;
}

function joinWithAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
