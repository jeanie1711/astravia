import { normalizeLon } from "./normalize.js";
import type { AstroLine, Body } from "./types.js";

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export const ASC_DSC_LATITUDE_MIN = -89;
export const ASC_DSC_LATITUDE_MAX = 89;
export const ASC_DSC_LATITUDE_STEP = 0.25;

export type Point = { lat: number; lon: number };

// Solves the geometric-horizon (h=0) rise/set hour angle for a given
// latitude and body declination. Spec: 03-astro-calculation-spec.md §9.
// Returns undefined when the body is circumpolar (never rises/sets) at
// this latitude for this declination -- callers must not fabricate a point.
export function horizonHourAngleDeg(latDeg: number, decDeg: number): number | undefined {
  const cosH = -Math.tan(latDeg * DEG_TO_RAD) * Math.tan(decDeg * DEG_TO_RAD);
  if (Math.abs(cosH) > 1) {
    return undefined;
  }
  return Math.acos(cosH) * RAD_TO_DEG; // H0, in [0, 180]
}

function ascLongitude(raDeg: number, h0Deg: number, gstDeg: number): number {
  const hAsc = -h0Deg;
  return normalizeLon(raDeg + hAsc - gstDeg);
}

function dscLongitude(raDeg: number, h0Deg: number, gstDeg: number): number {
  const hDsc = h0Deg;
  return normalizeLon(raDeg + hDsc - gstDeg);
}

// Splits a sequence of sampled points into contiguous polyline segments.
// A `undefined` slot means no rise/set solution existed at that latitude
// (a circumpolar gap) and always breaks the segment. A jump of more than
// 180 degrees in longitude between consecutive points means the line
// crossed the antimeridian and must also be split (G008), to avoid a false
// straight segment being drawn/measured across the whole map.
export function splitIntoSegments(slots: Array<Point | undefined>): Point[][] {
  const segments: Point[][] = [];
  let current: Point[] = [];

  for (const point of slots) {
    if (!point) {
      if (current.length > 0) {
        segments.push(current);
        current = [];
      }
      continue;
    }
    const previous = current[current.length - 1];
    if (previous && Math.abs(point.lon - previous.lon) > 180) {
      segments.push(current);
      current = [];
    }
    current.push(point);
  }
  if (current.length > 0) {
    segments.push(current);
  }
  return segments;
}

// Computes ASC and DSC polylines for one body at one instant, sampling
// latitude from -89 to +89 in 0.25 degree steps (spec §9 sampling rules).
export function computeAscDscLines(body: Body, raDeg: number, decDeg: number, gstDeg: number): AstroLine[] {
  const ascSlots: Array<Point | undefined> = [];
  const dscSlots: Array<Point | undefined> = [];

  const stepsCount = Math.round((ASC_DSC_LATITUDE_MAX - ASC_DSC_LATITUDE_MIN) / ASC_DSC_LATITUDE_STEP);

  for (let i = 0; i <= stepsCount; i++) {
    const lat = ASC_DSC_LATITUDE_MIN + i * ASC_DSC_LATITUDE_STEP;
    const h0 = horizonHourAngleDeg(lat, decDeg);

    if (h0 === undefined) {
      ascSlots.push(undefined);
      dscSlots.push(undefined);
      continue;
    }

    ascSlots.push({ lat, lon: ascLongitude(raDeg, h0, gstDeg) });
    dscSlots.push({ lat, lon: dscLongitude(raDeg, h0, gstDeg) });
  }

  const lines: AstroLine[] = [];
  for (const segment of splitIntoSegments(ascSlots)) {
    lines.push({ body, angle: "ASC", points: segment });
  }
  for (const segment of splitIntoSegments(dscSlots)) {
    lines.push({ body, angle: "DSC", points: segment });
  }
  return lines;
}
