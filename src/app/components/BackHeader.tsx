"use client";

import { useRouter } from "next/navigation";

export function BackHeader({ stepLabel, onBack }: { stepLabel: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 24px 0" }}>
      <button
        type="button"
        aria-label="Back"
        onClick={onBack ?? (() => router.back())}
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: "1px solid var(--color-border-strong)",
          background: "var(--color-surface)",
          color: "var(--color-ink)",
          font: "16px sans-serif",
          cursor: "pointer"
        }}
      >
        ←
      </button>
      <div
        style={{
          font: "600 11px var(--font-body)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-faint)"
        }}
      >
        {stepLabel}
      </div>
    </div>
  );
}
