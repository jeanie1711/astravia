export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: "600 13px var(--font-body)",
        color: "var(--astravia-ink)",
        marginBottom: 8
      }}
    >
      {children}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  padding: "12px 16px",
  borderRadius: "var(--astravia-radius-control)",
  border: "1px solid var(--astravia-border-strong)",
  background: "var(--astravia-surface)",
  font: "15px var(--font-body)",
  // Set after "font" -- that shorthand implicitly resets line-height to
  // "normal", and some mobile browsers size a native <input type="date">/
  // type="time">'s internal picker chrome off the computed line-height,
  // where "normal" can resolve much taller than this input's own padding
  // implies, especially in in-app WebViews (Instagram, etc).
  lineHeight: 1.4,
  color: "var(--astravia-ink)",
  colorScheme: "light",
  boxSizing: "border-box"
};

export const errorTextStyle: React.CSSProperties = {
  font: "400 13px var(--font-body)",
  color: "#b3453c",
  marginTop: 6
};
