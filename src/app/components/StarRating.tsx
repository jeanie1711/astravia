import { scoreToDisplayValue } from "../../scoring/score-city";
import type { Stars } from "../../scoring/types";

const STAR_LABEL: Record<Stars, string> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

const GLYPHS = "★★★★★";

// Star glyphs with a partial fill (product feedback 2026-09-05: no printed
// number -- the fill itself should carry the granularity). `score`, when
// given, positions the fill within the assigned star's own band via
// scoreToDisplayValue, so e.g. a fraction of 0.3 into the next star shows
// as roughly a third of that star filled, without ever reaching the next
// whole star. Two layered ★★★★★ strings: a faint full row underneath, an
// accent-colored row on top clipped to `fillPercent` width.
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
  const fillValue = score !== undefined ? scoreToDisplayValue(score, stars) : stars;
  const fillPercent = Math.min(100, Math.max(0, (fillValue / 5) * 100));

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        role="img"
        aria-label={`${stars} out of 5: ${STAR_LABEL[stars]}`}
        style={{ position: "relative", display: "inline-block", fontSize: size, lineHeight: 1, whiteSpace: "nowrap" }}
      >
        <span style={{ color: "var(--color-star-empty)" }}>{GLYPHS}</span>
        <span
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "block",
            overflow: "hidden",
            width: `${fillPercent}%`,
            color: "var(--color-accent)",
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
