// Structural types for the calculation layer only.
// No goal/theme/narrative vocabulary belongs in this file (see CLAUDE.md §3).

export type Body =
  | "Sun"
  | "Moon"
  | "Mercury"
  | "Venus"
  | "Mars"
  | "Jupiter"
  | "Saturn"
  | "Uranus"
  | "Neptune"
  | "Pluto";

export const BODIES: readonly Body[] = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto"
];

export type Angle = "MC" | "IC" | "ASC" | "DSC";

export const ANGLES: readonly Angle[] = ["MC", "IC", "ASC", "DSC"];

export type UncertaintyMinutes = 0 | 15 | 30 | 60;

export type BirthInput = {
  birthDate: string; // YYYY-MM-DD
  birthLocalTime: string; // HH:mm[:ss]
  birthPlaceLabel: string;
  latitude: number; // -90..+90
  longitude: number; // -180..+180, east positive
  timeZoneId: string; // IANA, e.g. "Asia/Ho_Chi_Minh"
  uncertaintyMinutes?: UncertaintyMinutes;
};

// Result of resolving BirthInput's local civil time against its historical IANA timezone.
export type ResolvedInstant = {
  utcIso: string;
};

export type LocalTimeResolutionError =
  | { kind: "AMBIGUOUS_DST_FOLD"; earlierUtcIso: string; laterUtcIso: string }
  | { kind: "NONEXISTENT_DST_GAP" }
  | { kind: "INVALID_DATE_OR_TIME" }
  | { kind: "MISSING_TIMEZONE" };

export type LocalTimeResolution =
  | { ok: true; resolved: ResolvedInstant }
  | { ok: false; error: LocalTimeResolutionError };

// Three independently-computed scenario instants for a given uncertainty window.
export type UncertaintyScenarios = {
  lowerUtcIso: string;
  baselineUtcIso: string;
  upperUtcIso: string;
};

export type BodyEquatorial = {
  body: Body;
  raHours: number;
  raDeg: number;
  decDeg: number;
};

export type AstroLine = {
  body: Body;
  angle: Angle;
  points?: Array<{ lat: number; lon: number }>; // ASC/DSC
  longitude?: number; // MC/IC
};

export type City = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  population?: number;
  region?: string;
};

export type CityInfluence = {
  cityId: string;
  body: Body;
  angle: Angle;
  distanceKm: number;
  scenarioDistancesKm: number[];
};

export type Sensitivity = {
  scenarioTimesUtc: string[];
  distancesKm: number[];
  strengthBands: StrengthBand[];
  remainsRelevant: boolean;
};

export type StrengthBand =
  | "VERY_STRONG" // 0-100 km
  | "STRONG" // >100-250 km
  | "MODERATE" // >250-500 km
  | "WEAK_SECONDARY" // >500-750 km
  | "NOT_USED"; // >750 km
