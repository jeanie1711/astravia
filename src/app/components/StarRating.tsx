const STAR_LABEL: Record<number, string> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Rating indicator: an ombre-filled bar (relative strength, no digits or
// percentages -- CLAUDE.md §11) paired with the plain-language word label
// (05-result-content-framework.md §4's "Exceptional/Strong/Mixed/
// Challenging/Weak" table). Replaces discrete star glyphs (product
// feedback 2026-09-05): two "Exceptional" places can otherwise look
// visually identical despite a real difference underneath, and text alone
// carries the categorical meaning either way. The bar's fill is driven by
// the absolute internal score (0-1), not a comparison to other items on
// screen, so it reads correctly even alone on the City Story page.
export function StarRating({
  stars,
  score,
  size = 16,
  showLabel = false
}: {
  stars: 1 | 2 | 3 | 4 | 5;
  score?: number;
  size?: number;
  showLabel?: boolean;
}) {
  // Falls back to a tier-based fill (e.g. 5 -> 90%) if the raw score isn't
  // passed in, so the bar still renders sensibly wherever internalScore
  // isn't threaded through yet.
  const fill = Math.max(0.08, Math.min(1, score ?? (stars * 2 - 1) / 10));
  const barWidth = size * 5;

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span
        role="img"
        aria-label={`${stars} out of 5: ${STAR_LABEL[stars]}`}
        style={{
          display: "inline-block",
          width: barWidth,
          height: Math.max(5, Math.round(size * 0.35)),
          borderRadius: 100,
          background: "var(--color-border)",
          overflow: "hidden"
        }}
      >
        <span
          style={{
            display: "block",
            width: `${fill * 100}%`,
            height: "100%",
            borderRadius: 100,
            background: "linear-gradient(90deg, var(--color-tag-bg), var(--color-accent) 65%, var(--color-accent-strong))"
          }}
        />
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
