import { computeAscDscLines } from "./asc-dsc.js";
import { equatorialOfDate } from "./ephemeris.js";
import { icLongitude, mcLongitude } from "./mc-ic.js";
import { greenwichSiderealTimeDeg } from "./sidereal.js";
import { BODIES, type AstroLine } from "./types.js";

// Computes all 40 planet-angle astrocartography lines for a single UTC
// instant. This is the composition point for the calculation layer's
// per-instant work; sensitivity.ts calls it independently for each
// birth-time scenario (G007 -- no scenario may be derived by shifting
// another scenario's result).
export function computeAllLinesAtInstant(utcIso: string): AstroLine[] {
  const gstDeg = greenwichSiderealTimeDeg(utcIso);
  const lines: AstroLine[] = [];

  for (const body of BODIES) {
    const { raDeg, decDeg } = equatorialOfDate(body, utcIso);

    const mcLon = mcLongitude(raDeg, gstDeg);
    lines.push({ body, angle: "MC", longitude: mcLon });
    lines.push({ body, angle: "IC", longitude: icLongitude(mcLon) });

    lines.push(...computeAscDscLines(body, raDeg, decDeg, gstDeg));
  }

  return lines;
}
