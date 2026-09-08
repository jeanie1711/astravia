import raw from "./world-geo.json" with { type: "json" };

// World/country SVG outline data (docs/DECISIONS.md, 2026-09-08). Generated
// by scripts/import-world-geo.ts from Natural Earth (via the world-atlas
// npm package), public domain. Do not hand-edit world-geo.json; re-run
// `npm run import:world-geo` instead. Paths are already projected to the
// exact equirectangular frame WorldMap.tsx and CountryMiniMap.tsx expect
// (see `viewW`/`viewH`).
export type WorldGeo = {
  viewW: number;
  viewH: number;
  world: string;
  countries: Record<string, string>;
};

export const WORLD_GEO: WorldGeo = raw as WorldGeo;

export function getCountryOutline(countryCode: string): string | undefined {
  return WORLD_GEO.countries[countryCode];
}
