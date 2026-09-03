// Curated destination/ranking city dataset import (docs/DECISIONS.md,
// approved 2026-09-03). Reads raw GeoNames dump files and emits
// src/data/cities.json. This is a one-time/occasional offline build step,
// not a runtime dependency -- CLAUDE.md §5/§6: no paid API, static bundled
// data. Source is swappable: only this script and data/raw/ change if the
// upstream dataset is ever replaced; nothing downstream depends on GeoNames
// specifically, only on the City[] shape in src/astro/types.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { haversineDistanceKm } from "../src/astro/geo-distance.js";
import type { City } from "../src/astro/types.js";

const RAW_DIR = "data/raw/geonames";
const OUTPUT_PATH = "src/data/cities.json";

const CAPITAL_FEATURE_CODE = "PPLC";
const MAJOR_METRO_POPULATION_THRESHOLD = 750_000;
const MIN_CITIES_PER_COUNTRY = 3;
const METRO_DEDUPE_RADIUS_KM = 40;

// Manually reviewed allow-list of well-known international relocation/
// study/work destinations that fall under the algorithmic thresholds above
// (docs/DECISIONS.md, approved 2026-09-03). Each entry is a GeoNames
// geonameid, verified present in data/raw/geonames/cities15000.txt at the
// time of review -- re-verify if the raw file is ever refreshed.
const MANUAL_ALLOWLIST_GEONAME_IDS: readonly string[] = [
  "1153671", // Chiang Mai, TH
  "1153669", // Chiang Rai, TH
  "1622846", // Ubud, ID
  "1580541", // Hoi An, VN
  "3521342", // Playa del Carmen, MX
  "2640729", // Oxford, GB
  "2653941", // Cambridge, GB
  "2638864", // Saint Andrews, GB
  "4984247", // Ann Arbor, US
  "5574991", // Boulder, US
  "5122432", // Ithaca, US
  "4839366", // New Haven, US
  "2907911", // Heidelberg, DE
  "2751773", // Leiden, NL
  "2666199", // Uppsala, SE
  "5746545", // Portland, US
  "2510911", // Sevilla, ES
  "2517117", // Granada, ES
  "3941584", // Cusco, PE
  "148730", // Zanzibar, TZ
  "3599699" // Antigua Guatemala, GT
];

type RawCityRow = {
  geonameId: string;
  name: string;
  latitude: number;
  longitude: number;
  featureCode: string;
  countryCode: string;
  admin1Code: string;
  population: number;
};

function parseCitiesFile(path: string): RawCityRow[] {
  const text = readFileSync(path, "utf-8");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  return lines.map((line) => {
    const c = line.split("\t");
    return {
      geonameId: c[0]!,
      name: c[1]!,
      latitude: parseFloat(c[4]!),
      longitude: parseFloat(c[5]!),
      featureCode: c[7]!,
      countryCode: c[8]!,
      admin1Code: c[10]!,
      population: parseInt(c[14] || "0", 10)
    };
  });
}

function parseCountryInfo(path: string): Map<string, string> {
  const text = readFileSync(path, "utf-8");
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const c = line.split("\t");
    map.set(c[0]!, c[4]!); // ISO alpha-2 -> country name
  }
  return map;
}

function parseAdmin1Codes(path: string): Map<string, string> {
  const text = readFileSync(path, "utf-8");
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const c = line.split("\t");
    map.set(c[0]!, c[1]!); // "CC.admin1code" -> region name
  }
  return map;
}

function selectCandidates(rows: RawCityRow[]): Map<string, RawCityRow> {
  const candidates = new Map<string, RawCityRow>();

  for (const row of rows) {
    if (row.featureCode === CAPITAL_FEATURE_CODE || row.population >= MAJOR_METRO_POPULATION_THRESHOLD) {
      candidates.set(row.geonameId, row);
    }
  }

  const byCountry = new Map<string, RawCityRow[]>();
  for (const row of rows) {
    const list = byCountry.get(row.countryCode);
    if (list) list.push(row);
    else byCountry.set(row.countryCode, [row]);
  }
  for (const list of byCountry.values()) {
    list.sort((a, b) => b.population - a.population);
    for (const row of list.slice(0, MIN_CITIES_PER_COUNTRY)) {
      candidates.set(row.geonameId, row);
    }
  }

  const byId = new Map(rows.map((row) => [row.geonameId, row]));
  for (const id of MANUAL_ALLOWLIST_GEONAME_IDS) {
    const row = byId.get(id);
    if (!row) {
      throw new Error(`Manual allow-list geonameid ${id} not found in raw source -- re-verify against the current cities15000.txt`);
    }
    candidates.set(id, row);
  }

  return candidates;
}

// Greedy metro de-duplication: population-priority, same-country only,
// keep the largest city in each ~40km cluster. Same algorithmic approach
// as src/scoring/dedupe.ts's runtime result de-duplication, at a tighter
// radius appropriate for curating the dense raw source rather than a
// short ranked-results list.
function dedupeMetros(candidates: RawCityRow[]): RawCityRow[] {
  const sorted = [...candidates].sort((a, b) => b.population - a.population);
  const kept: RawCityRow[] = [];

  for (const candidate of sorted) {
    const nearKept = kept.some(
      (k) =>
        k.countryCode === candidate.countryCode &&
        haversineDistanceKm(candidate.latitude, candidate.longitude, k.latitude, k.longitude) <= METRO_DEDUPE_RADIUS_KM
    );
    if (!nearKept) kept.push(candidate);
  }

  return kept;
}

function main(): void {
  const rows = parseCitiesFile(`${RAW_DIR}/cities15000.txt`);
  const countryNames = parseCountryInfo(`${RAW_DIR}/countryInfo.txt`);
  const regionNames = parseAdmin1Codes(`${RAW_DIR}/admin1CodesASCII.txt`);

  const candidateMap = selectCandidates(rows);
  const deduped = dedupeMetros(Array.from(candidateMap.values()));

  const cities: City[] = deduped
    .map((row): City => {
      const city: City = {
        id: row.geonameId,
        name: row.name,
        countryCode: row.countryCode,
        countryName: countryNames.get(row.countryCode) ?? row.countryCode,
        latitude: row.latitude,
        longitude: row.longitude,
        ...(row.population > 0 ? { population: row.population } : {}),
        ...(regionNames.get(`${row.countryCode}.${row.admin1Code}`)
          ? { region: regionNames.get(`${row.countryCode}.${row.admin1Code}`)! }
          : {})
      };
      return city;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  writeFileSync(OUTPUT_PATH, JSON.stringify(cities, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${cities.length} cities to ${OUTPUT_PATH}`);
}

main();
