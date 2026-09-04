import { NextResponse } from "next/server";
import { computeCityInfluencesAcrossScenarios, type CityInfluenceSensitivity } from "../../../astro/sensitivity";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../../astro/time";
import type { City } from "../../../astro/types";
import { MODEL_VERSIONS } from "../../../config/versions";
import { CITIES } from "../../../data/cities";
import { composeCityStory, type InfluenceDistance } from "../../../interpretation/compose-city-story";
import { detectPattern } from "../../../interpretation/compose-pattern";
import type { CityResult } from "../../../interpretation/types";
import { computeOverall } from "../../../scoring/overall";
import { dedupeByProximity } from "../../../scoring/dedupe";
import { toScenarioInfluences } from "../../../scoring/from-calculation";
import { computeCountryResult } from "../../../scoring/score-country";
import { scoreCity } from "../../../scoring/score-city";
import { SCORABLE_GOALS, type RankedCity, type ScorableGoal } from "../../../scoring/types";
import type { CalculateRequest, CalculateResponse, CalculateResult } from "../../journey/types";

// Kept small on purpose (product feedback 2026-09-04): the UI only ever
// shows the top 3 of each, but we keep a little headroom server-side for
// pattern detection and de-duplication overlap, not for display.
const TOP_RESULTS_COUNT = 10;
const TOP_COUNTRIES_COUNT = 3;
const PATTERN_SAMPLE_SIZE = 10;

function groupByCity(all: CityInfluenceSensitivity[]): Map<string, CityInfluenceSensitivity[]> {
  const map = new Map<string, CityInfluenceSensitivity[]>();
  for (const item of all) {
    const list = map.get(item.cityInfluence.cityId);
    if (list) list.push(item);
    else map.set(item.cityInfluence.cityId, [item]);
  }
  return map;
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: CalculateRequest;
  try {
    body = (await request.json()) as CalculateRequest;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { birth, uncertaintyMinutes, goal } = body;

  const resolution = resolveBirthInstant({
    birthDate: birth.birthDate,
    birthLocalTime: birth.birthLocalTime,
    birthPlaceLabel: birth.birthPlaceLabel,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timeZoneId: birth.timeZoneId,
    uncertaintyMinutes
  });

  if (!resolution.ok) {
    return NextResponse.json({ error: "Could not resolve birth instant", kind: resolution.error.kind }, { status: 422 });
  }

  const scenarios = buildUncertaintyScenarios(resolution.resolved.utcIso, uncertaintyMinutes);
  const allInfluences = computeCityInfluencesAcrossScenarios(scenarios, CITIES as City[]);
  const byCity = groupByCity(allInfluences);

  function scoreForGoal(cityId: string, g: ScorableGoal): RankedCity {
    const group = byCity.get(cityId);
    if (!group) throw new Error(`No influence data for city ${cityId}`);
    return scoreCity(cityId, g, toScenarioInfluences(group), uncertaintyMinutes);
  }

  const ranked: RankedCity[] =
    goal === "OVERALL"
      ? CITIES.map((c) => {
          const perGoal = Object.fromEntries(SCORABLE_GOALS.map((g) => [g, scoreForGoal(c.id, g)])) as Record<
            ScorableGoal,
            RankedCity
          >;
          return computeOverall(c.id, perGoal);
        })
      : CITIES.map((c) => scoreForGoal(c.id, goal as ScorableGoal));

  ranked.sort((a, b) => b.internalScore - a.internalScore);

  const citiesById = new Map<string, City>(CITIES.map((c) => [c.id, c as City]));
  const deduped = dedupeByProximity(ranked, citiesById);

  const top = deduped.slice(0, TOP_RESULTS_COUNT);

  function composeStoryFor(rankedCity: RankedCity): CityResult {
    const city = citiesById.get(rankedCity.cityId)!;
    const group = byCity.get(rankedCity.cityId) ?? [];
    const influenceDistances: InfluenceDistance[] = group.map((g) => ({
      body: g.cityInfluence.body,
      angle: g.cityInfluence.angle,
      distanceKm: g.cityInfluence.distanceKm,
      scenarioDistancesKm: g.cityInfluence.scenarioDistancesKm
    }));
    return composeCityStory(rankedCity, city.name, city.countryName, influenceDistances);
  }

  const stories: Record<string, CityResult> = {};
  for (const rankedCity of top) {
    stories[rankedCity.cityId] = composeStoryFor(rankedCity);
  }

  const pattern = detectPattern(top.slice(0, PATTERN_SAMPLE_SIZE));

  const byCountry = new Map<string, RankedCity[]>();
  for (const r of deduped) {
    const city = citiesById.get(r.cityId)!;
    const list = byCountry.get(city.countryCode);
    if (list) list.push(r);
    else byCountry.set(city.countryCode, [r]);
  }
  const countries = Array.from(byCountry.entries())
    .map(([countryCode, cities]) => computeCountryResult(countryCode, [...cities].sort((a, b) => b.internalScore - a.internalScore)))
    .sort((a, b) => b.internalScore - a.internalScore)
    .slice(0, TOP_COUNTRIES_COUNT);

  // A country's best cities (spec §11) needn't crack the global top-20 to
  // drive that country's own score. Compose+expose those too so every city
  // named in the Countries section is actually clickable, not just listed.
  const topIds = new Set(top.map((r) => r.cityId));
  const rankedById = new Map(deduped.map((r) => [r.cityId, r]));
  const extraCityIds = new Set(countries.flatMap((co) => co.topCityIds).filter((id) => !topIds.has(id)));
  const extraResults: CalculateResult[] = [];
  for (const id of extraCityIds) {
    const rankedCity = rankedById.get(id);
    const city = citiesById.get(id);
    if (!rankedCity || !city) continue;
    stories[id] = composeStoryFor(rankedCity);
    extraResults.push({ city, ranked: rankedCity });
  }

  const cityNames: CalculateResponse["cityNames"] = {};
  const countryNames: CalculateResponse["countryNames"] = {};
  const referencedCityIds = new Set<string>([...topIds, ...extraCityIds]);
  for (const id of referencedCityIds) {
    const city = citiesById.get(id);
    if (!city) continue;
    cityNames[id] = { name: city.name, countryName: city.countryName };
    countryNames[city.countryCode] = city.countryName;
  }

  const response: CalculateResponse = {
    goal,
    results: top.map((r) => ({ city: citiesById.get(r.cityId)!, ranked: r })),
    extraResults,
    stories,
    pattern,
    countries,
    cityNames,
    countryNames,
    versions: MODEL_VERSIONS
  };

  return NextResponse.json(response);
}
