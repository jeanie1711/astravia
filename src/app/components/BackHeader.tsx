"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Wordmark } from "./Wordmark";

// The one shared compact header for every screen past the landing page
// (product feedback 2026-09-07, §8): back navigation, a step/section
// label, the Astravia wordmark, and an optional right-side slot (Edit
// details, a save toggle) -- consolidates what used to be three separate
// ad-hoc header layouts (this component, results/page.tsx, and
// place/[cityId]/page.tsx) into one.
export function BackHeader({
  stepLabel,
  onBack,
  right
}: {
  stepLabel?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "20px 24px 0"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <button
          type="button"
          aria-label="Back"
          onClick={onBack ?? (() => router.back())}
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            borderRadius: "50%",
            border: "1px solid var(--astravia-border-strong)",
            background: "var(--astravia-surface)",
            color: "var(--astravia-ink)",
            font: "16px sans-serif",
            cursor: "pointer"
          }}
        >
          ←
        </button>
        {stepLabel && (
          <div
            className="astravia-header-label"
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--astravia-text-subtle)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}
          >
            {stepLabel}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <Wordmark />
        {right}
      </div>
    </div>
  );
}
