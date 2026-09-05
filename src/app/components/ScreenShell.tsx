import type { CSSProperties, ReactNode } from "react";
import { Footer } from "./Footer";

export function ScreenShell({
  children,
  maxWidth = 440,
  showFooter = true
}: {
  children: ReactNode;
  maxWidth?: number;
  // Opt out only for screens where the illustration would fight the
  // layout (e.g. a full-viewport centered loading state) -- everywhere
  // else keeps it, per product feedback 2026-09-05 (recurring visual
  // signature, not just on the landing page).
  showFooter?: boolean;
}) {
  const style: CSSProperties = {
    maxWidth,
    width: "100%",
    margin: "0 auto",
    background: "var(--color-bg)",
    minHeight: "100vh",
    paddingBottom: 60,
    boxSizing: "border-box"
  };
  return (
    <div style={style}>
      {children}
      {showFooter && <Footer compact />}
    </div>
  );
}
