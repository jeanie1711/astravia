import type { Point } from "./asc-dsc";
import { normalizeLon } from "./normalize";
import type { StrengthBand } from "./types";

// Mean Earth radius per spec §11.
export const EARTH_RADIUS_KM = 6371.0088;

const DEG_TO_RAD = Math.PI / 180;

function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

// Haversine great-circle distance between two points. Spec §11.
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  const angular = 2 * Math.asin(Math.min(1, Math.sqrt(a)));
  return angular * EARTH_RADIUS_KM;
}

function angularDistanceRad(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dPhi = toRad(lat2 - lat1);
  const dLambda = toRad(lon2 - lon1);
  const a =
    Math.sin(dPhi / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function initialBearingRad(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const dLambda = toRad(lon2 - lon1);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return Math.atan2(y, x);
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

// Shortest great-circle distance from a city point to the MC/IC meridian
// (a full pole-to-pole great circle at a fixed longitude), not a naive
// longitude-degree difference. Spec §11.
//
// Derivation: the meridian great circle at longitude lon0 has plane normal
// n = (-sin(lon0), cos(lon0), 0) in geocentric Cartesian coordinates. For a
// point P on the unit sphere, P . n = cos(lat) * sin(lon - lon0), and the
// angular distance from P to the great circle is asin(|P . n|).
export function distanceToMeridianKm(latDeg: number, lonDeg: number, meridianLonDeg: number): number {
  const deltaLon = normalizeLon(lonDeg - meridianLonDeg);
  const projection = Math.cos(toRad(latDeg)) * Math.sin(toRad(deltaLon));
  const angular = Math.asin(clamp(Math.abs(projection), 0, 1));
  return angular * EARTH_RADIUS_KM;
}

// Shortest great-circle (cross-track) distance from a point to a single
// geodesic segment [a, b], clamped to the segment: if the perpendicular
// foot falls outside [a, b], the distance to the nearer endpoint is used
// instead. Spec §11: "production should use point-to-geodesic/polyline
// segment distance if practical."
//
// Correctness fix (found 2026-09-05 while adding a polyline-distance
// optimization, docs/DECISIONS.md): the along-track distance MUST be
// computed with atan2, not acos. acos only returns values in [0, pi], so
// it cannot distinguish the perpendicular foot landing between a and b
// from it landing an equal angular distance BEHIND a (in the opposite
// direction, off the far end of the segment) -- both cases produced the
// same positive "alongTrack" value, so a point almost directly behind `a`
// could wrongly pass the `alongTrack <= deltaSegment` check and return
// the (small) cross-track distance to a foot that was never actually on
// the segment at all, instead of correctly falling back to the nearer
// endpoint. atan2 preserves the sign (negative = behind `a`), fixing it.
// A brute-force cross-check in tests/astro/geo-distance.test.ts caught
// this via an inconsistency with a new pruning optimization -- the bug
// itself predates that work and affects every ASC/DSC line-to-city
// distance this function has ever computed.
export function distanceToSegmentKm(point: Point, a: Point, b: Point): number {
  const deltaSegment = angularDistanceRad(a.lat, a.lon, b.lat, b.lon);
  if (deltaSegment === 0) {
    return haversineDistanceKm(point.lat, point.lon, a.lat, a.lon);
  }

  const delta13 = angularDistanceRad(a.lat, a.lon, point.lat, point.lon);
  if (delta13 === 0) {
    return 0;
  }

  const theta13 = initialBearingRad(a.lat, a.lon, point.lat, point.lon);
  const theta12 = initialBearingRad(a.lat, a.lon, b.lat, b.lon);

  const crossTrack = Math.asin(Math.sin(delta13) * Math.sin(theta13 - theta12));
  const alongTrack = Math.atan2(Math.sin(delta13) * Math.cos(theta13 - theta12), Math.cos(delta13));

  if (alongTrack >= 0 && alongTrack <= deltaSegment) {
    return Math.abs(crossTrack) * EARTH_RADIUS_KM;
  }

  return Math.min(
    haversineDistanceKm(point.lat, point.lon, a.lat, a.lon),
    haversineDistanceKm(point.lat, point.lon, b.lat, b.lon)
  );
}

// Distance from a city to a paran (spec §19.6). A paran has no longitude
// dependency -- it's a full latitude band -- so the nearest point on it to
// a city is always directly along that city's own meridian, at
// (latParanDeg, city's own longitude). Since a meridian is a great circle,
// this is exact, not an approximation, unlike distanceToPolylineKm's
// segment-based approach for the latitude-and-longitude-dependent ASC/DSC
// curves.
export function distanceToParanKm(cityLatDeg: number, paranLatDeg: number): number {
  return Math.abs(toRad(cityLatDeg - paranLatDeg)) * EARTH_RADIUS_KM;
}

// Influence-distance bands feeding scoring (spec §12). Purely geometric
// distance categorization -- no goal/quality judgment belongs here.
export function classifyStrengthBand(distanceKm: number): StrengthBand {
  if (distanceKm <= 100) return "VERY_STRONG";
  if (distanceKm <= 250) return "STRONG";
  if (distanceKm <= 500) return "MODERATE";
  if (distanceKm <= 750) return "WEAK_SECONDARY";
  return "NOT_USED";
}

// Per-polyline segment lengths, cached by array identity: within one
// computeCityDistancesAtInstant() call, the SAME polyline array is passed
// to distanceToPolylineKm once per city (up to ~955 times), and a
// segment's own length never depends on the query point, so computing it
// once and reusing it avoids ~955x redundant work. Garbage-collected
// naturally once a request's line data goes out of scope (WeakMap).
const segmentLengthCache = new WeakMap<Point[], number[]>();

function getSegmentLengthsKm(polyline: Point[]): number[] {
  let lengths = segmentLengthCache.get(polyline);
  if (!lengths) {
    lengths = [];
    for (let i = 0; i < polyline.length - 1; i++) {
      lengths.push(haversineDistanceKm(polyline[i]!.lat, polyline[i]!.lon, polyline[i + 1]!.lat, polyline[i + 1]!.lon));
    }
    segmentLengthCache.set(polyline, lengths);
  }
  return lengths;
}

// Shortest distance from a point to an ordered polyline (a sampled ASC/DSC
// segment): the minimum over all consecutive-point segments.
//
// Performance note (found 2026-09-05, docs/DECISIONS.md): a naive
// brute-force scan calls the trig-heavy distanceToSegmentKm for every one
// of a polyline's ~700 sampled segments, for every city -- measured at
// ~7.4s for one scenario instant across the full ~955-city dataset (a
// full /api/calculate call does this 3 times, per G007). Optimized below
// to give the mathematically IDENTICAL result -- no approximation, no
// change to any returned value -- by skipping the expensive exact
// computation for any segment a cheap, rigorous lower bound already
// proves cannot beat the best distance found so far.
//
// The bound (triangle inequality, always valid for any metric -- no
// assumption about the segment's shape): for a segment [a, b] of length L
// and any point Q on the geodesic between them, dist(a,Q) + dist(Q,b) = L
// (Q lies on the shortest path), so dist(point,Q) >= dist(point,a) -
// dist(a,Q) >= dist(point,a) - L, and symmetrically for b. The larger
// (tighter) of the two, max(dist(point,a), dist(point,b)) - L, is a valid
// lower bound on the segment's true minimum distance to `point`.
//
// An earlier version of this bound used only the segment's endpoint
// LATITUDES (great-circle distance >= latitude difference alone). That
// is a valid bound for a straight meridian hop, but not for an arbitrary
// geodesic segment: a great-circle path between two points can bulge to
// a latitude beyond either endpoint's own latitude (classic great-circle
// vs. rhumb-line behavior), so a latitude-only bound could overestimate
// the true minimum and wrongly skip the closest segment. Caught by
// tests/astro/geo-distance.test.ts's brute-force cross-check before
// shipping -- kept as a cautionary note, not repeated here.
export function distanceToPolylineKm(point: Point, polyline: Point[]): number {
  if (polyline.length === 0) {
    throw new Error("distanceToPolylineKm: polyline must have at least one point");
  }
  if (polyline.length === 1) {
    const only = polyline[0]!;
    return haversineDistanceKm(point.lat, point.lon, only.lat, only.lon);
  }

  const segmentCount = polyline.length - 1;
  const segmentLengths = getSegmentLengthsKm(polyline);

  // Cheap (haversine, no cross-track math) distance to every vertex, plus
  // which vertex is nearest -- used to seed a tight initial `best` below
  // so the bound has something meaningful to prune against immediately.
  const vertexDistances: number[] = new Array(polyline.length);
  let nearestVertex = 0;
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineDistanceKm(point.lat, point.lon, polyline[i]!.lat, polyline[i]!.lon);
    vertexDistances[i] = d;
    if (d < vertexDistances[nearestVertex]!) nearestVertex = i;
  }

  let best = Infinity;
  if (nearestVertex > 0) {
    best = Math.min(best, distanceToSegmentKm(point, polyline[nearestVertex - 1]!, polyline[nearestVertex]!));
  }
  if (nearestVertex < segmentCount) {
    best = Math.min(best, distanceToSegmentKm(point, polyline[nearestVertex]!, polyline[nearestVertex + 1]!));
  }

  for (let i = 0; i < segmentCount; i++) {
    const bound = Math.max(vertexDistances[i]!, vertexDistances[i + 1]!) - segmentLengths[i]!;
    if (bound >= best) continue;
    const d = distanceToSegmentKm(point, polyline[i]!, polyline[i + 1]!);
    if (d < best) best = d;
  }

  return best;
}
