// World/country outline import (product feedback 2026-09-08: the results
// map's dots-on-a-grid read as "hard to understand" with no geography to
// anchor them). Fetches a small, well-known public-domain world atlas
// (Natural Earth 110m, via the `world-atlas` npm package's CDN-hosted
// TopoJSON) at build time, projects it with the exact same equirectangular
// projection WorldMap.tsx uses for pins, and writes flat SVG path strings
// to src/data/world-geo.json. This is a one-time/occasional offline build
// step, not a runtime dependency (CLAUDE.md §5/§15: no new service, no
// added cost, no network call from the deployed app) -- only the small
// static JSON output ships with the app.
//
// Source: world-atlas@2 (https://github.com/topojson/world-atlas), derived
// from Natural Earth (https://www.naturalearthdata.com/), which is
// explicitly public domain -- no attribution legally required, credited
// here anyway. Re-run with `npm run import:world-geo` if this ever needs
// regenerating; nothing downstream depends on this exact source, only on
// the { world, countries } shape below.
import { writeFileSync } from "node:fs";
import * as topojson from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countries from "i18n-iso-countries";

const OUTPUT_PATH = "src/data/world-geo.json";

// Matches WorldMap.tsx's VIEW_W/VIEW_H and project() exactly, so pins and
// this outline always line up.
const VIEW_W = 400;
const VIEW_H = 200;

function project(lon: number, lat: number): [number, number] {
  const x = ((lon + 180) / 360) * VIEW_W;
  const y = ((90 - lat) / 180) * VIEW_H;
  return [round(x), round(y)];
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// 110m resolution is already coarse; this just drops points within ~0.6
// projected units of the last kept point, which removes near-collinear
// runs without a full Douglas-Peucker pass.
function thin(points: Array<[number, number]>, tolerance = 0.6): Array<[number, number]> {
  if (points.length <= 3) return points;
  const out: Array<[number, number]> = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const [px, py] = out[out.length - 1]!;
    const [x, y] = points[i]!;
    if (Math.hypot(x - px, y - py) >= tolerance || i === points.length - 1) {
      out.push(points[i]!);
    }
  }
  return out;
}

function ringToPath(ring: number[][]): string {
  const projected = thin(ring.map(([lon, lat]) => project(lon!, lat!)));
  if (projected.length < 3) return "";
  return "M" + projected.map(([x, y]) => `${x},${y}`).join("L") + "Z";
}

function geometryToPath(geometry: GeoJSON.Geometry | null): string {
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringToPath).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.map((poly) => poly.map(ringToPath).join(" ")).join(" ");
  }
  return "";
}

async function fetchTopology(url: string): Promise<Topology> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as Topology;
}

async function main() {
  const [landTopo, countriesTopo] = await Promise.all([
    fetchTopology("https://cdn.jsdelivr.net/npm/world-atlas@2/land-110m.json"),
    fetchTopology("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
  ]);

  const land = topojson.feature(landTopo, landTopo.objects.land as GeometryCollection);
  const worldPath = ("features" in land ? land.features : [land])
    .map((f) => geometryToPath(f.geometry))
    .join(" ");

  const countryFC = topojson.feature(countriesTopo, countriesTopo.objects.countries as GeometryCollection);
  const countryFeatures = "features" in countryFC ? countryFC.features : [countryFC];

  const countryPaths: Record<string, string> = {};
  for (const feature of countryFeatures) {
    const numeric = String(feature.id).padStart(3, "0");
    const alpha2 = countries.numericToAlpha2(numeric);
    // A handful of disputed territories (Kosovo, Somaliland, N. Cyprus) have
    // no standard ISO 3166-1 numeric code and are skipped -- CountryMiniMap
    // falls back to a plain dot panel for any country code with no entry
    // here, so this is a graceful, non-breaking gap, not a missing feature.
    if (!alpha2) continue;
    const path = geometryToPath(feature.geometry);
    if (path) countryPaths[alpha2] = path;
  }

  writeFileSync(
    OUTPUT_PATH,
    JSON.stringify({ viewW: VIEW_W, viewH: VIEW_H, world: worldPath, countries: countryPaths })
  );

  console.log(`Wrote ${OUTPUT_PATH}: world outline (${worldPath.length} chars), ${Object.keys(countryPaths).length} country outlines.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
