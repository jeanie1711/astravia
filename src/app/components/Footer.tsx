import Image from "next/image";

// Recurring illustration cap, product feedback 2026-09-05: repeating this
// on every screen (not just the landing page) gives the app a consistent
// visual signature instead of feeling flat/text-only past the first
// screen. Purely decorative -- aria-hidden, no alt text needed.
export function Footer({ compact = false }: { compact?: boolean }) {
  return (
    <div aria-hidden="true" style={{ marginTop: compact ? 40 : 56, lineHeight: 0 }}>
      <Image
        src="/astravia-footer.png"
        alt=""
        width={1983}
        height={793}
        style={{ width: "100%", height: "auto", opacity: compact ? 0.9 : 1 }}
      />
    </div>
  );
}
