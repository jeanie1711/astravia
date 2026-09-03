import { normalizeLon } from "./normalize";

// MC/IC longitude formulas. Spec: 03-astro-calculation-spec.md §8.
//
// At the longitude where a body sits on the local meridian, LST = RA.
// Since LST = GST + longitude, longitude_MC = RA - GST (normalized).
// IC is the opposite meridian, 180° away.
export function mcLongitude(raDeg: number, gstDeg: number): number {
  return normalizeLon(raDeg - gstDeg);
}

export function icLongitude(mcLongitudeDeg: number): number {
  return normalizeLon(mcLongitudeDeg + 180);
}
