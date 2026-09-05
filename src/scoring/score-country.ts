import { scoreToStars, STAR_LABELS } from "./score-city";
import type { CountryNarrative, CountryResult, RankedCity, StabilityLabel } from "./types";

// Country ranking (spec §11): "never score a country from its capital
// only." Takes the top (already de-duplicated, see dedupe.ts) distinct-
// metro cities for one goal within a country and aggregates them.
const BEST_WEIGHT = 0.45;
const SECOND_WEIGHT = 0.25;
const THIRD_WEIGHT = 0.15;
const BREADTH_WEIGHT = 0.1;
const STABILITY_WEIGHT = 0.05;

const QUALIFYING_SCORE_THRESHOLD = 0.45; // spec's 3-star threshold (§9)
const MIN_QUALIFYING_CITIES_FOR_FIVE_STARS = 2;
const CORRIDOR_SECOND_TO_BEST_RATIO = 0.7;

const STABILITY_QUALITY: Record<StabilityLabel, number> = {
  EXACT: 1,
  HIGH: 1,
  MEDIUM: 0.5,
  TIME_SENSITIVE: 0
};

// Cities must already represent distinct metros (see dedupe.ts) and be
// sorted with compareByStarsThenScore (star tier first, then internalScore
// as tiebreak -- see rank-order.ts) so "best/second/third" means the same
// thing here as it does for the global Top City ranking.
export function computeCountryResult(countryCode: string, citiesInCountry: RankedCity[]): CountryResult {
  const [best, second, third] = citiesInCountry;

  const bestScore = best?.internalScore ?? 0;
  const secondScore = second?.internalScore ?? 0;
  const thirdScore = third?.internalScore ?? 0;

  const topThree = citiesInCountry.slice(0, 3);
  const qualifyingCount = topThree.filter((c) => c.internalScore >= QUALIFYING_SCORE_THRESHOLD).length;
  const breadth = Math.min(1, qualifyingCount / 3);

  const stabilityConsistency =
    topThree.length > 0
      ? topThree.reduce((sum, c) => sum + STABILITY_QUALITY[c.stability], 0) / topThree.length
      : 0;

  const raw =
    BEST_WEIGHT * bestScore +
    SECOND_WEIGHT * secondScore +
    THIRD_WEIGHT * thirdScore +
    BREADTH_WEIGHT * breadth +
    STABILITY_WEIGHT * stabilityConsistency;

  const internalScore = Math.min(1, Math.max(0, raw));
  let stars = scoreToStars(internalScore);

  // Spec §11: require at least two qualifying cities for a 5-star country
  // rating unless a documented small-country exception applies (none is
  // implemented for MVP, so the cap always applies).
  if (stars === 5 && qualifyingCount < MIN_QUALIFYING_CITIES_FOR_FIVE_STARS) {
    stars = 4;
  }

  const narrative = classifyNarrative(bestScore, secondScore, qualifyingCount);

  return {
    countryCode,
    internalScore,
    stars,
    label: STAR_LABELS[stars],
    narrative,
    topCityIds: topThree.map((c) => c.cityId)
  };
}

// Documented simplification for MVP: MIXED narrative properly requires
// comparing which goals different cities excel at (cross-goal input this
// single-goal aggregation doesn't have). It is used here as the fallback
// when the single-goal evidence doesn't clearly show either a CORRIDOR
// (several comparably strong cities) or an ANCHOR (one dominant city).
function classifyNarrative(bestScore: number, secondScore: number, qualifyingCount: number): CountryNarrative {
  if (bestScore < QUALIFYING_SCORE_THRESHOLD) {
    return "MIXED";
  }
  if (qualifyingCount >= 2 && secondScore / bestScore >= CORRIDOR_SECOND_TO_BEST_RATIO) {
    return "CORRIDOR";
  }
  if (qualifyingCount === 1 || secondScore / bestScore < CORRIDOR_SECOND_TO_BEST_RATIO) {
    return "ANCHOR";
  }
  return "MIXED";
}
