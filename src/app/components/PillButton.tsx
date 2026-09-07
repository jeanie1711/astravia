import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

// Primary: deep teal gradient fill, white text (.astravia-btn-primary in
// globals.css supplies the gradient + hover lift, since inline styles
// can't express :hover). Secondary: pearl surface, teal text, a quiet
// border. The old bold coral "accent" variant is retired -- Sunlit
// Editorial keeps large CTAs in teal; gold stays reserved for small
// emphasis details elsewhere (product feedback 2026-09-07, §18).
const VARIANT_STYLE: Record<Variant, React.CSSProperties> = {
  primary: { color: "var(--astravia-white)", border: "none" },
  secondary: {
    background: "var(--astravia-surface)",
    color: "var(--astravia-ink)",
    border: "1px solid var(--astravia-border-strong)"
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
      className={variant === "primary" ? ["astravia-btn-primary", className].filter(Boolean).join(" ") : className}
      style={{
        width: fullWidth ? "100%" : undefined,
        minHeight: 52,
        padding: "0 22px",
        borderRadius: "var(--astravia-radius-pill)",
        font: "600 16px var(--font-body)",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.4 : 1,
        ...VARIANT_STYLE[variant],
        ...style
      }}
    />
  );
}
