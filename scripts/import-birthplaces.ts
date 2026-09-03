// Interim birthplace-search dataset (docs/DECISIONS.md: birthplace search is
// a separate, still-open dataset decision from the ~1,000-city destination
// list). As an interim stopgap for Milestone 3, this reuses the SAME
// already-approved GeoNames cities15000.txt source (no new dependency),
// but keeps every row (no population/curation filtering -- birthplace
// search needs small towns, not just ranking-worthy destinations) and adds
// the IANA timezone column the destination dataset doesn't need.
// Server-side only: never shipped to the client bundle (see
// src/app/api/place-search/route.ts).
import { readFileSync, writeFileSync } from "node:fs";

const RAW_DIR = "data/raw/geonames";
const OUTPUT_PATH = "src/data/birthplaces.json";

type Birthplace = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
  population: number;
};

function parseCountryInfo(path: string): Map<string, string> {
  const text = readFileSync(path, "utf-8");
  const map = new Map<string, string>();
  for (const line of text.split("\n")) {
    if (!line.trim() || line.startsWith("#")) continue;
    const c = line.split("\t");
    map.set(c[0]!, c[4]!);
  }
  return map;
}

function main(): void {
  const countryNames = parseCountryInfo(`${RAW_DIR}/countryInfo.txt`);
  const text = readFileSync(`${RAW_DIR}/cities15000.txt`, "utf-8");
  const lines = text.split("\n").filter((l) => l.trim().length > 0);

  const places: Birthplace[] = lines
    .map((line): Birthplace => {
      const c = line.split("\t");
      const countryCode = c[8]!;
      return {
        id: c[0]!,
        name: c[1]!,
        countryCode,
        countryName: countryNames.get(countryCode) ?? countryCode,
        latitude: parseFloat(c[4]!),
        longitude: parseFloat(c[5]!),
        timeZoneId: c[17]!,
        population: parseInt(c[14] || "0", 10)
      };
    })
    .sort((a, b) => b.population - a.population);

  writeFileSync(OUTPUT_PATH, JSON.stringify(places), "utf-8");
  console.log(`Wrote ${places.length} birthplace candidates to ${OUTPUT_PATH}`);
}

main();
