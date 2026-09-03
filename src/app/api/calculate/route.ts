import { NextResponse } from "next/server";
import { computeCityInfluencesAcrossScenarios, type CityInfluenceSensitivity } from "../../../astro/sensitivity.js";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../../astro/time.js";
import type { City } from "../../../astro/types.js";
import { MODEL_VERSIONS } from "../../../config/versions.js";
import { CITIES } from "../../../data/cities.js";
import { composeCityStory, type InfluenceDistance } from "../../../interpretation/compose-city-story.js";
import { detectPattern } from "../../../interpretation/compose-pattern.js";
import type { CityResult } from "../../../interpretation/types.js";
import { computeOverall } from "../../../scoring/overall.js";
import { dedupeByProximity } from "../../../scoring/dedupe.js";
import { toScenarioInfluences } from "../../../scoring/from-calculation.js";
import { computeCountryResult } from "../../../scoring/score-country.js";
import { scoreCity } from "../../../scoring/score-city.js";
import { SCORABLE_GOALS, type RankedCity, type ScorableGoal } from "../../../scoring/types.js";
import type { CalculateRequest, CalculateResponse } from "../../journey/types.js";

const TOP_RESULTS_COUNT = 20;
const TOP_COUNTRIES_COUNT = 5;
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

  const stories: Record<string, CityResult> = {};
  for (const rankedCity of top) {
    const city = citiesById.get(rankedCity.cityId)!;
    const group = byCity.get(rankedCity.cityId) ?? [];
    const influenceDistances: InfluenceDistance[] = group.map((g) => ({
      body: g.cityInfluence.body,
      angle: g.cityInfluence.angle,
      distanceKm: g.cityInfluence.distanceKm,
      scenarioDistancesKm: g.cityInfluence.scenarioDistancesKm
    }));
    stories[rankedCity.cityId] = composeCityStory(rankedCity, city.name, city.countryName, influenceDistances);
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

  const cityNames: CalculateResponse["cityNames"] = {};
  const countryNames: CalculateResponse["countryNames"] = {};
  const referencedCityIds = new Set<string>([...top.map((r) => r.cityId), ...countries.flatMap((co) => co.topCityIds)]);
  for (const id of referencedCityIds) {
    const city = citiesById.get(id);
    if (!city) continue;
    cityNames[id] = { name: city.name, countryName: city.countryName };
    countryNames[city.countryCode] = city.countryName;
  }

  const response: CalculateResponse = {
    goal,
    results: top.map((r) => ({ city: citiesById.get(r.cityId)!, ranked: r })),
    stories,
    pattern,
    countries,
    cityNames,
    countryNames,
    versions: MODEL_VERSIONS
  };

  return NextResponse.json(response);
}
