import { distanceToMeridianKm, distanceToPolylineKm } from "./geo-distance.js";
import type { Angle, AstroLine, Body, City } from "./types.js";

export type InstantCityDistance = {
  cityId: string;
  body: Body;
  angle: Angle;
  distanceKm: number;
};

function distanceForLine(city: City, line: AstroLine): number {
  if (line.angle === "MC" || line.angle === "IC") {
    if (line.longitude === undefined) {
      throw new Error(`${line.angle} line for ${line.body} is missing a longitude`);
    }
    return distanceToMeridianKm(city.latitude, city.longitude, line.longitude);
  }

  if (!line.points || line.points.length === 0) {
    throw new Error(`${line.angle} line for ${line.body} is missing sampled points`);
  }
  return distanceToPolylineKm({ lat: city.latitude, lon: city.longitude }, line.points);
}

// Computes each city's distance to every body/angle line at a single
// instant. A body/angle may be represented by multiple AstroLine segments
// (antimeridian splits, or separate ASC/DSC polyline runs broken by
// circumpolar gaps); the city's distance to that body/angle is the minimum
// across all of its segments.
export function computeCityDistancesAtInstant(
  lines: AstroLine[],
  cities: City[]
): InstantCityDistance[] {
  const linesByKey = new Map<string, AstroLine[]>();
  for (const line of lines) {
    const key = `${line.body}:${line.angle}`;
    const group = linesByKey.get(key);
    if (group) {
      group.push(line);
    } else {
      linesByKey.set(key, [line]);
    }
  }

  const results: InstantCityDistance[] = [];
  for (const city of cities) {
    for (const [key, group] of linesByKey) {
      const [body, angle] = key.split(":") as [Body, Angle];
      let minDistance = Infinity;
      for (const line of group) {
        const distance = distanceForLine(city, line);
        if (distance < minDistance) minDistance = distance;
      }
      results.push({ cityId: city.id, body, angle, distanceKm: minDistance });
    }
  }
  return results;
}
