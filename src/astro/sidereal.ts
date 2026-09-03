import * as AstronomyEngine from "astronomy-engine";

// Greenwich Apparent Sidereal Time, in degrees, for a given UTC instant.
// Uses the same astronomy-engine time frame as ephemeris.ts's
// equatorialOfDate() so MC/IC/ASC/DSC formulas combine RA and GST from a
// consistent equinox-of-date frame (spec §7).
export function greenwichSiderealTimeDeg(utcIso: string): number {
  const time = AstronomyEngine.MakeTime(new Date(utcIso));
  const gastHours = AstronomyEngine.SiderealTime(time);
  return gastHours * 15;
}
