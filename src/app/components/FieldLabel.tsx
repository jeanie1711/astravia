export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: "600 11px var(--font-body)",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-muted)",
        marginBottom: 8
      }}
    >
      {children}
    </div>
  );
}

export const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: 10,
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface)",
  font: "15px var(--font-body)",
  color: "var(--color-ink)",
  boxSizing: "border-box"
};

export const errorTextStyle: React.CSSProperties = {
  font: "400 13px var(--font-body)",
  color: "#B3453C",
  marginTop: 6
};
