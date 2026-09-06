export type MiniMapPoint = { id: string; lat: number; lon: number; rank: number };

const VIEW = 100;
const PAD = 16;

// A small, non-interactive coverage panel for a country card (product
// feedback 2026-09-06, item 8): shows where that country's own strongest
// cities sit relative to each other, so a "3 cities, corridor" result
// reads as more than three lines of text. Projected within the country's
// own bounding box (padded), not a literal country outline -- see
// WorldMap.tsx for why this project has no coastline data to draw from.
export function CountryMiniMap({ points }: { points: MiniMapPoint[] }) {
  if (points.length === 0) return null;

  const lats = points.map((p) => p.lat);
  const lons = points.map((p) => p.lon);
  const latSpan = Math.max(Math.max(...lats) - Math.min(...lats), 0.5);
  const lonSpan = Math.max(Math.max(...lons) - Math.min(...lons), 0.5);
  const minLat = Math.min(...lats);
  const minLon = Math.min(...lons);

  function project(lat: number, lon: number): { x: number; y: number } {
    const x = PAD + ((lon - minLon) / lonSpan) * (VIEW - 2 * PAD);
    const y = PAD + ((1 - (lat - minLat) / latSpan)) * (VIEW - 2 * PAD);
    return { x, y };
  }

  return (
    <div
      style={{
        background: "var(--color-sky-bg)",
        borderRadius: 12,
        padding: 8,
        width: 84,
        height: 84,
        flexShrink: 0
      }}
    >
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} style={{ width: "100%", height: "100%" }}>
        {points.map((p) => {
          const { x, y } = project(p.lat, p.lon);
          const isTop = p.rank === 1;
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={isTop ? 7 : 5}
              fill={isTop ? "var(--color-accent-strong)" : "var(--color-surface)"}
              stroke="var(--color-accent-strong)"
              strokeWidth={1.2}
            />
          );
        })}
      </svg>
    </div>
  );
}
