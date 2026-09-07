// Astravia wordmark: a small sunlit-gold star plus the deep-teal name
// (product feedback 2026-09-07, §8). Reused in the compact app header and
// the landing-page hero at a larger size, so the star/name relationship
// stays identical everywhere instead of being redrawn per screen.
export function Wordmark({ size = 13 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        font: `600 ${size}px var(--font-display)`,
        color: "var(--astravia-ink)",
        whiteSpace: "nowrap"
      }}
    >
      <span
        aria-hidden="true"
        style={{ color: "var(--astravia-overall)", fontSize: size + 3, lineHeight: 1 }}
      >
        ✦
      </span>
      Astravia
    </span>
  );
}
