import type { Point } from "./asc-dsc.js";
import { normalizeLon } from "./normalize.js";
import type { StrengthBand } from "./types.js";

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

  const cosDenominator = Math.cos(crossTrack);
  const alongTrackCos = clamp(Math.cos(delta13) / cosDenominator, -1, 1);
  const alongTrack = Math.acos(alongTrackCos);

  if (alongTrack >= 0 && alongTrack <= deltaSegment) {
    return Math.abs(crossTrack) * EARTH_RADIUS_KM;
  }

  return Math.min(
    haversineDistanceKm(point.lat, point.lon, a.lat, a.lon),
    haversineDistanceKm(point.lat, point.lon, b.lat, b.lon)
  );
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

// Shortest distance from a point to an ordered polyline (a sampled ASC/DSC
// segment): the minimum over all consecutive-point segments.
export function distanceToPolylineKm(point: Point, polyline: Point[]): number {
  if (polyline.length === 0) {
    throw new Error("distanceToPolylineKm: polyline must have at least one point");
  }
  if (polyline.length === 1) {
    const only = polyline[0]!;
    return haversineDistanceKm(point.lat, point.lon, only.lat, only.lon);
  }

  let min = Infinity;
  for (let i = 0; i < polyline.length - 1; i++) {
    const a = polyline[i]!;
    const b = polyline[i + 1]!;
    const d = distanceToSegmentKm(point, a, b);
    if (d < min) min = d;
  }
  return min;
}
