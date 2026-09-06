import { scoreToDisplayValue } from "../../scoring/score-city";
import type { Stars } from "../../scoring/types";

// Renamed from Exceptional/Strong/Mixed (product feedback 2026-09-06):
// "Mixed" read as a poor result rather than "opportunity alongside
// challenge," and none of the labels made clear this is about match
// strength specifically, distinct from birth-time confidence.
const STAR_LABEL: Record<Stars, string> = {
  5: "Strongest match",
  4: "Strong match",
  3: "Layered match",
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
  showLabel = false,
  caption
}: {
  stars: Stars;
  score?: number;
  size?: number;
  showLabel?: boolean;
  // A small "Match strength" eyebrow above the row (product feedback
  // 2026-09-06): with birth-time confidence now shown elsewhere on the
  // same screens, this stars-and-word rating needs its own name so the two
  // don't read as one blended "quality" score.
  caption?: string;
}) {
  const fillValue = score !== undefined ? scoreToDisplayValue(score, stars) : stars;
  const fillPercent = Math.min(100, Math.max(0, (fillValue / 5) * 100));

  const row = (
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

  if (!caption) return row;

  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
      <span
        aria-hidden="true"
        style={{
          font: "600 10px var(--font-body)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--color-faint)"
        }}
      >
        {caption}
      </span>
      {row}
    </span>
  );
}
