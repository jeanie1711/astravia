const STAR_LABEL: Record<number, string> = {
  5: "Exceptional",
  4: "Strong",
  3: "Mixed",
  2: "Challenging",
  1: "Weak"
};

// Stars must carry a text label for screen readers, and never communicate
// meaning by color alone (02-user-flow-screen-spec.md, Accessibility).
export function StarRating({ stars, size = 16 }: { stars: 1 | 2 | 3 | 4 | 5; size?: number }) {
  return (
    <span role="img" aria-label={`${stars} out of 5 stars: ${STAR_LABEL[stars]}`}>
      <span style={{ color: "var(--color-accent)", fontSize: size }}>{"★".repeat(stars)}</span>
      <span style={{ color: "var(--color-star-empty)", fontSize: size }}>{"★".repeat(5 - stars)}</span>
    </span>
  );
}
