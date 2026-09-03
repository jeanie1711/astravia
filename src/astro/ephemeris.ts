import * as AstronomyEngine from "astronomy-engine";
import type { Body, BodyEquatorial } from "./types";

// Adapter around the astronomy-engine dependency (CLAUDE.md §6, §15):
// isolates the rest of the calculation layer from this specific library so
// it can be validated/replaced without rewriting scoring/interpretation.

function toEngineBody(body: Body): AstronomyEngine.Body {
  return AstronomyEngine.Body[body];
}

// Geocentric equatorial coordinates, equator/equinox-of-date, matching the
// same frame used by SiderealTime() -- spec §6-7 requires this consistency
// rather than mixing J2000 RA with sidereal time of date.
//
// astronomy-engine's Equator() is topocentric only (it requires an Observer
// and corrects for parallax), which is the wrong frame for astrocartography
// lines that must hold for every city on Earth. Instead we take the
// geocentric J2000 (EQJ) vector from GeoVector(), rotate it into the
// equator-of-date (EQD) frame, then read off RA/Dec from that vector.
export function equatorialOfDate(body: Body, utcIso: string): BodyEquatorial {
  const time = AstronomyEngine.MakeTime(new Date(utcIso));
  const geoVectorJ2000 = AstronomyEngine.GeoVector(toEngineBody(body), time, true);
  const rotation = AstronomyEngine.Rotation_EQJ_EQD(time);
  const vectorOfDate = AstronomyEngine.RotateVector(rotation, geoVectorJ2000);
  const equatorial = AstronomyEngine.EquatorFromVector(vectorOfDate);

  return {
    body,
    raHours: equatorial.ra,
    raDeg: equatorial.ra * 15,
    decDeg: equatorial.dec
  };
}
