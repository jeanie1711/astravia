import { useTranslation } from "../../i18n/useTranslation";

export function SaveButton({
  saved,
  onToggle,
  size = 18,
  onDark = false
}: {
  saved: boolean;
  onToggle: () => void;
  size?: number;
  // Reserved for a save toggle placed on a dark/colored surface -- unused
  // now that the hero card is a pearl-white surface (§13), kept for any
  // future dark surface.
  onDark?: boolean;
}) {
  const t = useTranslation();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? t.common.unsaveAriaLabel : t.common.saveAriaLabel}
      aria-pressed={saved}
      style={{
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 4,
        lineHeight: 1,
        fontSize: size,
        color: saved ? "var(--astravia-overall)" : onDark ? "var(--astravia-white)" : "var(--astravia-text-subtle)",
        transition: "transform 0.15s ease",
        transform: saved ? "scale(1.08)" : "scale(1)"
      }}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
