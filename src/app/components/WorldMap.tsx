"use client";

import { useState } from "react";
import { WORLD_GEO } from "../../data/world-geo";
import { useTranslation } from "../../i18n/useTranslation";

export type MapPin = {
  id: string;
  rank: number;
  lat: number;
  lon: number;
  title: string;
  subtitle: string;
};

const VIEW_W = WORLD_GEO.viewW;
const VIEW_H = WORLD_GEO.viewH;

// Equirectangular projection -- must match scripts/import-world-geo.ts
// exactly, since that script pre-projects the world outline at this same
// VIEW_W/VIEW_H so pins and coastlines line up.
function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * VIEW_W;
  const y = ((90 - lat) / 180) * VIEW_H;
  return { x, y };
}

// A simplified world map with a handful of ranked pins (product feedback
// 2026-09-08: plain dots on a graticule read as "hard to understand" with
// no geography to anchor them). The landmass outline is real, projected
// Natural Earth data (see src/data/world-geo.ts), not a decorative shape --
// still well short of a literal "interactive astrocartography map"
// (no pan/zoom, no drawn astrocartography lines). Tap a pin to preview
// that result inline. The #1 pin uses sunlit gold, its one reserved
// "discovery moment" role.
export function WorldMap({
  pins,
  onSelect
}: {
  pins: MapPin[];
  onSelect: (id: string) => void;
}) {
  const t = useTranslation();
  const [activeId, setActiveId] = useState<string | undefined>(pins[0]?.id);
  const active = pins.find((p) => p.id === activeId);

  return (
    <div
      style={{
        background: "linear-gradient(180deg, var(--astravia-surface-alt) 0%, var(--astravia-background) 100%)",
        border: "1px solid var(--astravia-border)",
        borderRadius: "var(--astravia-radius-card)",
        padding: "16px 16px 0",
        marginBottom: 20,
        overflow: "hidden"
      }}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <path d={WORLD_GEO.world} fill="var(--astravia-border)" stroke="none" fillRule="evenodd" />
        <line
          x1={0}
          y1={VIEW_H / 2}
          x2={VIEW_W}
          y2={VIEW_H / 2}
          stroke="var(--astravia-border-strong)"
          strokeWidth={0.6}
          strokeDasharray="2 3"
          opacity={0.7}
        />

        {pins.map((pin) => {
          const { x, y } = project(pin.lat, pin.lon);
          const isTop = pin.rank === 1;
          const isActive = pin.id === activeId;
          const r = isTop ? 9 : 6.5;
          return (
            <g
              key={pin.id}
              transform={`translate(${x}, ${y})`}
              onClick={() => setActiveId(pin.id)}
              style={{ cursor: "pointer" }}
              role="button"
              aria-label={t.common.pinAriaLabel(pin.title, pin.rank)}
            >
              {isTop && <circle r={r + 5} fill="var(--astravia-overall)" opacity={0.22} />}
              <circle
                r={r}
                fill={isActive ? "var(--astravia-ink)" : "var(--astravia-surface)"}
                stroke={isTop ? "var(--astravia-overall)" : "var(--astravia-text-subtle)"}
                strokeWidth={1.5}
              />
              <text
                textAnchor="middle"
                dy="0.32em"
                fontSize={isTop ? 9 : 8}
                fontWeight={700}
                fill={isActive ? "var(--astravia-white)" : "var(--astravia-ink)"}
                style={{ pointerEvents: "none" }}
              >
                {pin.rank}
              </text>
            </g>
          );
        })}
      </svg>

      {active && (
        <button
          type="button"
          onClick={() => onSelect(active.id)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            border: "none",
            borderTop: "1px solid var(--astravia-border)",
            background: "transparent",
            padding: "12px 4px",
            cursor: "pointer",
            textAlign: "left",
            font: "inherit"
          }}
        >
          <span>
            <span style={{ font: "600 14px var(--font-body)", color: "var(--astravia-ink)" }}>{active.title}</span>
            <span style={{ font: "400 12px var(--font-body)", color: "var(--astravia-text-secondary)", marginLeft: 8 }}>
              {active.subtitle}
            </span>
          </span>
          <span style={{ font: "600 12px var(--font-body)", color: "var(--astravia-ink)" }}>{t.common.viewLabel}</span>
        </button>
      )}
    </div>
  );
}
