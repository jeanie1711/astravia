import { scoreToDisplayValue } from "../../scoring/score-city";
import type { Stars } from "../../scoring/types";

// Product feedback 2026-09-07 (§13): avoid a label that reads as a poor
// result when the real meaning is "opportunity alongside trade-off" --
// the two lower tiers both read as "Worth exploring" rather than
// "Challenging"/"Weak".
const STAR_LABEL: Record<Stars, string> = {
  5: "Strongest match",
  4: "Strong match",
  3: "Layered match",
  2: "Worth exploring",
  1: "Worth exploring"
};

const GLYPHS = "★★★★★";

// Builds a goal-specific match label ("Strongest career match") for the
// City Story header, reusing the same intensity words as the default
// STAR_LABEL above. The two lower tiers stay goal-agnostic ("Worth
// exploring") -- appending a goal name there ("Worth exploring career")
// reads worse than the plain phrase, per the same 2026-09-07 §13 reasoning
// STAR_LABEL itself follows.
export function matchLabel(stars: Stars, goalName: string): string {
  if (stars <= 2) return STAR_LABEL[stars];
  const intensity = STAR_LABEL[stars].replace(/ match$/, "");
  return `${intensity} ${goalName} match`;
}

// Star glyphs with a partial fill -- no printed number, no decimal score;
// the fill itself carries the granularity, and the word label makes the
// meaning explicit rather than relying on color/shape alone (product
// feedback 2026-09-07, §13/§21: never show stars + a decimal + a text
// rating all saying the same thing). Filled in sunlit gold, quietly --
// gold is reserved for "strongest match" style small emphasis, never a
// loud fill. `score`, when given, positions the fill within the assigned
// star's own band via scoreToDisplayValue.
export function StarRating({
  stars,
  score,
  size = 16,
  showLabel = false,
  label,
  caption
}: {
  stars: Stars;
  score?: number;
  size?: number;
  showLabel?: boolean;
  // Overrides the default word label (e.g. "Strongest career match"
  // instead of the generic "Strongest match") -- the City Story header
  // uses this to name the goal directly; every other caller leaves it
  // unset and gets the original generic wording.
  label?: string;
  // A small "Match strength" eyebrow above the row -- with birth-time
  // confidence shown elsewhere on the same screens, this stars-and-word
  // rating needs its own name so the two don't read as one blended score.
  caption?: string;
}) {
  const fillValue = score !== undefined ? scoreToDisplayValue(score, stars) : stars;
  const fillPercent = Math.min(100, Math.max(0, (fillValue / 5) * 100));
  const wordLabel = label ?? STAR_LABEL[stars];

  const row = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        role="img"
        aria-label={`${stars} out of 5: ${wordLabel}`}
        style={{ position: "relative", display: "inline-block", fontSize: size, lineHeight: 1, whiteSpace: "nowrap" }}
      >
        <span style={{ color: "var(--astravia-track)" }}>{GLYPHS}</span>
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "block",
            overflow: "hidden",
            width: `${fillPercent}%`,
            color: "var(--astravia-overall)",
            whiteSpace: "nowrap"
          }}
        >
          {GLYPHS}
        </span>
      </span>
      {showLabel && (
        <span
          aria-hidden="true"
          style={{
            font: "600 12px var(--font-body)",
            letterSpacing: "0.02em",
            color: "var(--astravia-text-secondary)"
          }}
        >
          {wordLabel}
        </span>
      )}
    </span>
  );

  if (!caption) return row;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      <span
        aria-hidden="true"
        style={{
          font: "600 10px var(--font-body)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "var(--astravia-text-subtle)"
        }}
      >
        {caption}
      </span>
      {row}
    </span>
  );
}
