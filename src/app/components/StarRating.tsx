const STAR_LABEL: Record<number, string> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Stars must carry a text label for screen readers, and never communicate
// meaning by color alone (02-user-flow-screen-spec.md, Accessibility).
// showLabel also surfaces that label visibly (not just to screen readers) --
// spelling out "Exceptional"/"Strong"/etc. next to the stars removes the
// need for the user to infer meaning purely from counting glyphs.
export function StarRating({
  stars,
  size = 16,
  showLabel = false
}: {
  stars: 1 | 2 | 3 | 4 | 5;
  size?: number;
  showLabel?: boolean;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span role="img" aria-label={`${stars} out of 5 stars: ${STAR_LABEL[stars]}`}>
        <span style={{ color: "var(--color-accent)", fontSize: size }}>{"★".repeat(stars)}</span>
        <span style={{ color: "var(--color-star-empty)", fontSize: size }}>{"★".repeat(5 - stars)}</span>
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
