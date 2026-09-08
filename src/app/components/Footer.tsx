import Image from "next/image";

// Recurring illustration cap: repeating this on every screen (not just the
// landing page) gives the app a consistent visual signature. The
// illustration itself keeps its own warm tones (product feedback
// 2026-09-07, §9: integrate it naturally with the new Open Sky base rather
// than recoloring the whole interface to match it) -- a soft top fade
// blends its edge into the pale sky background instead. Purely decorative
// -- aria-hidden, no alt text needed.
export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      aria-hidden="true"
      style={{
        marginTop: compact ? 40 : 56,
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
  );
}
