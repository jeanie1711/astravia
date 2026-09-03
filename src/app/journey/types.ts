import type { City } from "../../astro/types";
import type { CityResult } from "../../interpretation/types";
import type { CountryResult, Goal, RankedCity } from "../../scoring/types";

export type UncertaintyMinutes = 0 | 15 | 30 | 60;

// The in-progress birth input as the user fills it in across S02/S03.
// Kept in sessionStorage only -- never in a URL (CLAUDE.md §14).
export type BirthDraft = {
  birthDate: string;
  birthLocalTime: string;
  birthPlaceLabel: string;
  latitude: number;
  longitude: number;
  timeZoneId: string;
};

export type CalculateRequest = {
  birth: BirthDraft;
  uncertaintyMinutes: UncertaintyMinutes;
  goal: Goal;
};

export type CalculateResult = {
  city: City;
  ranked: RankedCity;
};

export type CalculateResponse = {
  goal: Goal;
  results: CalculateResult[];
  // Cities referenced only via a Country card's topCityIds (§11: a
  // country's best cities need not crack the global top-20 `results` list
  // to drive that country's own score). Composed here too so every city
  // named anywhere in the response is actually clickable.
  extraResults: CalculateResult[];
  stories: Record<string, CityResult>;
  pattern: string | undefined;
  countries: CountryResult[];
  // Display names for every city referenced anywhere in the response,
  // including country topCityIds that may fall outside the top-20 global
  // `results` list (e.g. a country's 2nd/3rd best city).
  cityNames: Record<string, { name: string; countryName: string }>;
  countryNames: Record<string, string>;
  versions: { calculation: string; scoring: string; interpretation: string };
};

export type CalculateErrorResponse = {
  error: string;
  kind?: string;
};

export type JourneyState = {
  birth?: BirthDraft;
  uncertaintyMinutes: UncertaintyMinutes;
  goal?: Goal;
  results?: CalculateResponse;
};

export const INITIAL_JOURNEY_STATE: JourneyState = {
  uncertaintyMinutes: 0
};
