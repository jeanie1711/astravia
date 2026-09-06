import Image from "next/image";

// One fixed line per brand voice, shown wherever the footer illustration
// already appears (product feedback 2026-09-06, item 12): a small, quiet
// way for Astravia's own point of view to show up past the landing page,
// instead of the rest of the journey reading like an unbranded dashboard.
const BRAND_LINE = "Your map is not a verdict. It is a place to begin.";

// Recurring illustration cap, product feedback 2026-09-05: repeating this
// on every screen (not just the landing page) gives the app a consistent
// visual signature instead of feeling flat/text-only past the first
// screen. The image itself is purely decorative -- aria-hidden, no alt
// text needed.
export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ marginTop: compact ? 40 : 56 }}>
      <div aria-hidden="true" style={{ lineHeight: 0 }}>
        <Image
          src="/astravia-footer.png"
          alt=""
          width={1983}
          height={793}
          style={{ width: "100%", height: "auto", opacity: compact ? 0.9 : 1 }}
        />
      </div>
      <p
        style={{
          margin: "14px 0 0",
          font: "italic 400 12px var(--font-display)",
          color: "var(--color-faint)",
          textAlign: "center"
        }}
      >
        {BRAND_LINE}
      </p>
    </div>
  );
}
