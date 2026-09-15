import { NextResponse } from "next/server";
import birthplacesRaw from "../../../data/birthplaces.json" with { type: "json" };

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

// Lowercases and strips diacritics (Vietnamese "đ"/"Đ" included, which
// doesn't decompose under NFD like accented Latin vowels do) so a query
// typed without accents -- the common way to type Vietnamese on a phone
// keyboard -- still matches an accented dataset entry, e.g. "buon" ->
// "Buôn Ma Thuột".
function foldDiacritics(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const BIRTHPLACES = (birthplacesRaw as Birthplace[]).map((p) => ({ ...p, foldedName: foldDiacritics(p.name) }));
const MAX_RESULTS = 8;
const MIN_QUERY_LENGTH = 2;

export type PlaceSearchResult = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

// Server-side only birthplace search (see docs/DECISIONS.md interim
// resolution) -- the 34k-row dataset never reaches the client, only the
// handful of matches per query do.
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const query = foldDiacritics((searchParams.get("q") ?? "").trim());

  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ results: [] });
  }

  const matches = BIRTHPLACES.filter((p) => p.foldedName.startsWith(query))
    .slice(0, MAX_RESULTS * 3)
    .sort((a, b) => b.population - a.population)
    .slice(0, MAX_RESULTS);

  const results: PlaceSearchResult[] = matches.map((p) => ({
    id: p.id,
    label: `${p.name}, ${p.countryName}`,
    latitude: p.latitude,
    longitude: p.longitude,
    timeZoneId: p.timeZoneId
  }));

  return NextResponse.json({ results });
}
