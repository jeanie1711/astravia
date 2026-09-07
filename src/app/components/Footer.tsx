import Image from "next/image";

// One fixed line per brand voice, shown wherever the footer illustration
// already appears: a small, quiet way for Astravia's own point of view to
// show up past the landing page, instead of the rest of the journey
// reading like an unbranded dashboard.
const BRAND_LINE = "Your map is not a verdict. It is a place to begin.";

// Recurring illustration cap: repeating this on every screen (not just the
// landing page) gives the app a consistent visual signature. The
// illustration itself keeps its own warm tones (product feedback
// 2026-09-07, §9: integrate it naturally with the new Open Sky base rather
// than recoloring the whole interface to match it) -- a soft top fade
// blends its edge into the pale sky background instead. Purely decorative
// -- aria-hidden, no alt text needed.
export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ marginTop: compact ? 40 : 56 }}>
      <div
        aria-hidden="true"
        style={{
          lineHeight: 0,
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 8%)",
          maskImage: "linear-gradient(180deg, transparent 0%, #000 8%)"
        }}
      >
        <Image
          src="/astravia-footer.png"
          alt=""
          width={1983}
          height={793}
          style={{ width: "100%", height: "auto", opacity: compact ? 0.85 : 0.95 }}
        />
      </div>
      <p
        style={{
          margin: "14px 0 0",
          font: "italic 400 12px var(--font-display)",
          color: "var(--astravia-text-subtle)",
          textAlign: "center"
        }}
      >
        {BRAND_LINE}
      </p>
    </div>
  );
}
