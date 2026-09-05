import { scoreToDisplayValue } from "../../scoring/score-city";
import type { Stars } from "../../scoring/types";

const STAR_LABEL: Record<Stars, string> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Star glyphs (product feedback 2026-09-05: an ombre bar tried in place of
// stars didn't read as clearly), plus a one-decimal number computed within
// the assigned star's own band (scoreToDisplayValue) so two results in the
// same tier -- e.g. two "Strong" 4-star cities -- no longer look identical.
// The filled-star COUNT still always equals the real, guardrail-capped
// `stars` value; only the decimal adds granularity underneath it.
export function StarRating({
  stars,
  score,
  size = 16,
  showLabel = false
}: {
  stars: Stars;
  score?: number;
  size?: number;
  showLabel?: boolean;
}) {
  const displayValue = score !== undefined ? scoreToDisplayValue(score, stars) : stars;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span role="img" aria-label={`${displayValue.toFixed(1)} out of 5: ${STAR_LABEL[stars]}`}>
        <span style={{ color: "var(--color-accent)", fontSize: size }}>{"★".repeat(stars)}</span>
        <span style={{ color: "var(--color-star-empty)", fontSize: size }}>{"★".repeat(5 - stars)}</span>
      </span>
      {score !== undefined && (
        <span
          aria-hidden="true"
          style={{
            font: `600 ${Math.max(11, Math.round(size * 0.75))}px var(--font-body)`,
            color: "var(--color-ink)",
            fontVariantNumeric: "tabular-nums"
          }}
        >
          {displayValue.toFixed(1)}
        </span>
      )}
      {showLabel && (
        <span
          aria-hidden="true"
          style={{
            font: "600 12px var(--font-body)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--color-muted)"
          }}
        >
          {STAR_LABEL[stars]}
        </span>
      )}
    </span>
  );
}
