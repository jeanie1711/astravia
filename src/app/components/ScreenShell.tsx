import type { CSSProperties, ReactNode } from "react";

export function ScreenShell({
  children,
  maxWidth = 440
}: {
  children: ReactNode;
  maxWidth?: number;
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
  return <div style={style}>{children}</div>;
}
