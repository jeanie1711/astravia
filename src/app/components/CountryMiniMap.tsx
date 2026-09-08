import { getCountryOutline, WORLD_GEO } from "../../data/world-geo";

export type MiniMapPoint = { id: string; lat: number; lon: number; rank: number };

const PAD = 6;
const MIN_SPAN = 8;

// Same equirectangular projection used for the world map and baked into
// each country's pre-projected outline (scripts/import-world-geo.ts) --
// reusing it means a city pin and its country's boundary always land in
// the same coordinate frame, so this component can just crop to whichever
// rectangle contains both.
function project(lat: number, lon: number): [number, number] {
  const x = ((lon + 180) / 360) * WORLD_GEO.viewW;
  const y = ((90 - lat) / 180) * WORLD_GEO.viewH;
  return [x, y];
}

function pathBounds(path: string): [number, number, number, number] | undefined {
  const matches = [...path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)];
  if (matches.length === 0) return undefined;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [, xs, ys] of matches) {
    const x = Number(xs);
    const y = Number(ys);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

// A small country-outline panel for a country card: real, projected
// Natural Earth boundary data (product feedback 2026-09-08 -- plain dots
// with no shape read as unclear), with that country's own top cities
// marked on it. Falls back to a plain dot panel (no drawn boundary) for
// the ~70 small territories 110m-resolution data doesn't include --
// see data/raw/world-atlas/SOURCES.md.
export function CountryMiniMap({ countryCode, points }: { countryCode: string; points: MiniMapPoint[] }) {
  if (points.length === 0) return null;

  const outline = getCountryOutline(countryCode);
  const projectedPoints = points.map((p) => ({ ...p, xy: project(p.lat, p.lon) }));

  const outlineBounds = outline ? pathBounds(outline) : undefined;
  let minX = Math.min(...projectedPoints.map((p) => p.xy[0]));
  let maxX = Math.max(...projectedPoints.map((p) => p.xy[0]));
  let minY = Math.min(...projectedPoints.map((p) => p.xy[1]));
  let maxY = Math.max(...projectedPoints.map((p) => p.xy[1]));
  if (outlineBounds) {
    minX = Math.min(minX, outlineBounds[0]);
    minY = Math.min(minY, outlineBounds[1]);
    maxX = Math.max(maxX, outlineBounds[2]);
    maxY = Math.max(maxY, outlineBounds[3]);
  }

  // A single city (or a geographically tiny country) would otherwise
  // zoom into a near-zero-area box -- floor the span so the shape/pins
  // stay legible instead of the viewBox collapsing to a point.
  const spanX = Math.max(maxX - minX, MIN_SPAN);
  const spanY = Math.max(maxY - minY, MIN_SPAN);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const viewBox = `${cx - spanX / 2 - PAD} ${cy - spanY / 2 - PAD} ${spanX + PAD * 2} ${spanY + PAD * 2}`;

  return (
    <div
      style={{
        background: "var(--astravia-surface-alt)",
        borderRadius: 12,
        padding: 8,
        width: 84,
        height: 84,
        flexShrink: 0
      }}
    >
      <svg viewBox={viewBox} style={{ width: "100%", height: "100%", overflow: "visible" }}>
        {outline && <path d={outline} fill="var(--astravia-border-strong)" fillRule="evenodd" stroke="none" />}
        {projectedPoints.map((p) => {
          const isTop = p.rank === 1;
          return (
            <circle
              key={p.id}
              cx={p.xy[0]}
              cy={p.xy[1]}
              r={isTop ? spanX * 0.05 + 1.6 : spanX * 0.035 + 1.1}
              fill={isTop ? "var(--astravia-overall)" : "var(--astravia-surface)"}
              stroke={isTop ? "var(--astravia-overall)" : "var(--astravia-ink)"}
              strokeWidth={spanX * 0.012 + 0.5}
            />
          );
        })}
      </svg>
    </div>
  );
}
