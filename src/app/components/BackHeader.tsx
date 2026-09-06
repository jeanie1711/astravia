"use client";

import { useRouter } from "next/navigation";

export function BackHeader({ stepLabel, onBack }: { stepLabel: string; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "24px 24px 0"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
      {/* Small persistent brand mark (product feedback 2026-09-06, item 12)
          -- past the landing page the journey previously had no Astravia
          identity at all, just step labels. */}
      <div
        aria-hidden="true"
        style={{ font: "600 12px var(--font-display)", color: "var(--color-faint-2)", whiteSpace: "nowrap" }}
      >
        ✦ Astravia
      </div>
    </div>
  );
}
