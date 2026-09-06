export function SaveButton({
  saved,
  onToggle,
  size = 18,
  onDark = false
}: {
  saved: boolean;
  onToggle: () => void;
  size?: number;
  // Hero card renders on a coral gradient banner -- needs a light glyph
  // instead of the usual ink-colored one to stay legible.
  onDark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      aria-label={saved ? "Remove from saved places" : "Save this place"}
      aria-pressed={saved}
      style={{
        border: "none",
        background: "none",
        cursor: "pointer",
        padding: 4,
        lineHeight: 1,
        fontSize: size,
        color: saved ? "var(--color-accent-strong)" : onDark ? "var(--color-ink-on-dark)" : "var(--color-faint)",
        transition: "transform 0.15s ease",
        transform: saved ? "scale(1.08)" : "scale(1)"
      }}
    >
      {saved ? "♥" : "♡"}
    </button>
  );
}
