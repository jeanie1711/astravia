import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "accent";

const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: { background: "var(--color-ink)", color: "var(--color-ink-on-dark)", border: "none" },
  secondary: {
    background: "var(--color-surface)",
    color: "var(--color-ink)",
    border: "1px solid var(--color-border-strong)"
  },
  // Background comes from the .astravia-btn-accent class (gradient + hover
  // lift, defined in globals.css -- inline styles can't express :hover).
  accent: {
    color: "var(--color-surface)",
    border: "none",
    boxShadow: "var(--shadow-cta)"
  }
};

export function PillButton({
  variant = "primary",
  fullWidth = true,
  style,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; fullWidth?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className={variant === "accent" ? ["astravia-btn-accent", className].filter(Boolean).join(" ") : className}
      style={{
        width: fullWidth ? "100%" : undefined,
        padding: "16px",
        borderRadius: 100,
        font: "600 16px var(--font-body)",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.4 : 1,
        ...VARIANT_STYLE[variant],
        ...style
      }}
    />
  );
}
