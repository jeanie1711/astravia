"use client";

import { useState } from "react";

export type MapPin = {
  id: string;
  rank: number;
  lat: number;
  lon: number;
  title: string;
  subtitle: string;
};

const VIEW_W = 400;
const VIEW_H = 200;

// Plain equirectangular projection -- deliberately not a literal coastline
// map (a "simplified world map" was requested, and there's no verified,
// licensed coastline dataset already in this project to draw from). A
// graticule plus real projected pin positions reads as a map without
// asserting geography we can't back up.
function project(lat: number, lon: number): { x: number; y: number } {
  const x = ((lon + 180) / 360) * VIEW_W;
  const y = ((90 - lat) / 180) * VIEW_H;
  return { x, y };
}

const MERIDIANS = [-120, -60, 0, 60, 120];
const PARALLELS = [-60, -30, 0, 30, 60];

// A simplified world/region map with a handful of ranked pins: Astravia is
// a location-discovery product and previously had no map at all. Tap a
// pin to preview that result inline -- no pan/zoom, no drawn
// astrocartography lines, well short of the "interactive astrocartography
// map" CLAUDE.md's scope guard excludes. The #1 pin uses sunlit gold, its
// one reserved "discovery moment" role (product feedback 2026-09-07, §3).
export function WorldMap({
  pins,
  onSelect
}: {
  pins: MapPin[];
  onSelect: (id: string) => void;
}) {
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
        {MERIDIANS.map((lon) => {
          const { x } = project(0, lon);
          return (
            <line
              key={`m-${lon}`}
              x1={x}
              y1={0}
              x2={x}
              y2={VIEW_H}
              stroke="var(--astravia-border-strong)"
              strokeWidth={0.5}
              strokeDasharray="2 4"
              opacity={0.6}
            />
          );
        })}
        {PARALLELS.map((lat) => {
          const { y } = project(lat, 0);
          return (
            <line
              key={`p-${lat}`}
              x1={0}
              y1={y}
              x2={VIEW_W}
              y2={y}
              stroke="var(--astravia-border-strong)"
              strokeWidth={lat === 0 ? 0.8 : 0.5}
              strokeDasharray={lat === 0 ? undefined : "2 4"}
              opacity={lat === 0 ? 0.8 : 0.6}
            />
          );
        })}

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
              aria-label={`${pin.title}, rank ${pin.rank}`}
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
          <span style={{ font: "600 12px var(--font-body)", color: "var(--astravia-ink)" }}>View →</span>
        </button>
      )}
    </div>
  );
}
