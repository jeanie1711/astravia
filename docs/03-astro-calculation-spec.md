# Astro Calculation Specification v0.1

**Purpose:** Deterministic astronomical calculation contract for the MVP.  
**Audience:** Product owner, Claude Code, developer/tester.  
**Status:** Build-ready baseline; validate against reference charts before public commercial launch.

## 1. Scope

The MVP calculates astrocartography angular lines for:

- Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- MC (culminating), IC (anti-culminating), ASC (rising), DSC (setting)
- 40 planet-angle combinations in total
- City-to-line proximity
- Birth-time sensitivity for an uncertainty range

Out of scope: houses, aspects, nodes, Chiron, parans, local-space astrology, relocated natal charts, transits, progressions, synastry.

## 2. Calculation principles

1. Astronomical calculation and astrological interpretation are separate modules.
2. The same birth input must always produce the same astronomical output.
3. No LLM may calculate planetary positions, line geometry, distance, or score.
4. Preserve full precision internally; round only for display.
5. All date/time conversion must use the historical timezone applicable on the birth date.
6. Atmospheric refraction is not used for astrocartography line geometry.
7. Calculations must be unit-tested before UI work is considered complete.

## 3. Recommended MVP astronomy dependency

Use `astronomy-engine` for Sun/Moon/planet equatorial coordinates. It supports browser and Node.js and exposes equatorial right ascension/declination. It is MIT-licensed.

Do not silently replace the astronomy dependency. Any replacement requires re-running the Golden Test suite and documenting deltas.

## 4. Input schema

```ts
type BirthInput = {
  birthDate: string;          // YYYY-MM-DD
  birthLocalTime: string;     // HH:mm[:ss]
  birthPlaceLabel: string;
  latitude: number;           // -90..+90
  longitude: number;          // -180..+180, east positive
  timeZoneId: string;         // IANA, e.g. "Asia/Ho_Chi_Minh"
  uncertaintyMinutes?: 0 | 15 | 30 | 60;
}
```

Validation:
- Reject impossible dates/times.
- Require an IANA timezone ID after place resolution.
- If local time is ambiguous because of a DST fold, ask user to choose earlier/later occurrence or flag as unresolved.
- If local time falls in a DST gap, do not silently normalize it; flag it.
- Store the resolved UTC instant used for calculation.

## 5. Time conversion

Pipeline:

```text
Local civil birth date/time
+ historical IANA timezone
→ resolved UTC instant
→ astronomy calculation
```

Never infer UTC from the city's current UTC offset.

For uncertainty `u`:
- baseline: `T`
- lower: `T - u`
- upper: `T + u`

MVP minimum: three scenarios. A later version may sample more densely.

## 6. Equatorial coordinates

For each body at UTC instant T obtain geocentric equatorial:
- right ascension α in sidereal hours, convert to degrees: `RAdeg = α × 15`
- declination δ in degrees

Use equator/equinox-of-date coordinates consistently. Do not mix J2000 RA with sidereal time of date without an explicit coordinate transform.

Output:

```ts
type BodyEquatorial = {
  body: Body;
  raHours: number;
  raDeg: number;
  decDeg: number;
}
```

## 7. Greenwich sidereal time

Obtain Greenwich apparent/consistent sidereal time for the same UTC instant and coordinate frame used by the RA calculation.

Represent:
`GSTdeg = GSThours × 15`

Normalize longitudes with:

```ts
normalizeLon(x) => ((x + 180) % 360 + 360) % 360 - 180
```

## 8. MC and IC lines

At a longitude where the body is on the local meridian:

`LST = RA`

Since:
`LST = GST + longitude`

then:

`longitude_MC = normalizeLon(RAdeg - GSTdeg)`

IC is the opposite meridian:

`longitude_IC = normalizeLon(longitude_MC + 180)`

For the MVP, MC/IC are meridians: constant longitude across latitude.

## 9. ASC and DSC lines

For each sampled geographic latitude φ and body declination δ, solve the altitude-zero horizon equation:

`sin(h) = sin(φ)sin(δ) + cos(φ)cos(δ)cos(H)`

At geometric horizon `h = 0`:

`cos(H) = -tan(φ)tan(δ)`

If `|cos(H)| > 1`, the body does not rise/set at that latitude for that instant; no ASC/DSC point is emitted there.

Otherwise:

`H0 = arccos(-tan(φ)tan(δ))`

Hour angle convention:
`H = LST - RA`

Rising:
`H_ASC = -H0`

Setting:
`H_DSC = +H0`

Therefore:

`longitude_ASC = normalizeLon(RAdeg + H_ASCdeg - GSTdeg)`

`longitude_DSC = normalizeLon(RAdeg + H_DSCdeg - GSTdeg)`

### Sampling
MVP:
- latitude range: -89° to +89°
- step: 0.25°
- store ordered polyline points `[lat, lon]`
- split a polyline when crossing the antimeridian to prevent false map segments

A later optimization may solve nearest distance analytically; the MVP prioritizes correctness and testability.

## 10. City dataset

MVP target: 500–2,000 curated world cities.

Required fields:

```ts
type City = {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  latitude: number;
  longitude: number;
  population?: number;
  region?: string;
}
```

Rules:
- Avoid ranking many adjacent suburbs as separate “top places”.
- Use one canonical city record per metro for initial ranking.
- Country ranking must not equal capital-city ranking.

## 11. Distance from city to line

MC/IC:
- calculate shortest great-circle distance from city to the line meridian, not naive longitude-degree difference.

ASC/DSC:
- calculate minimum great-circle distance from city to polyline segments.
- MVP may first calculate distance to dense sampled points, but production should use point-to-geodesic/polyline segment distance if practical.

Use haversine for point-to-point checks:

`a = sin²(Δφ/2) + cosφ1 cosφ2 sin²(Δλ/2)`
`d = 2R asin(sqrt(a))`

Use `R = 6371.0088 km`.

Return exact internal distance and rounded display distance.

## 12. Influence-distance bands

These bands feed scoring; they are not claims of scientific effect.

| Distance | Internal strength band |
|---|---|
| 0–100 km | Very strong |
| >100–250 km | Strong |
| >250–500 km | Moderate |
| >500–750 km | Weak/secondary |
| >750 km | Not used for primary scoring |

Use a continuous decay function in scoring rather than abrupt jumps where possible.

## 13. Birth-time sensitivity output

For each city/influence calculate distance at lower/baseline/upper scenario.

```ts
type Sensitivity = {
  scenarioTimesUtc: string[];
  distancesKm: number[];
  strengthBands: string[];
  remainsRelevant: boolean;
}
```

The scoring specification determines `High`, `Medium`, or `Time-sensitive`.

## 14. Calculation output contract

```ts
type AstroLine = {
  body: Body;
  angle: "MC" | "IC" | "ASC" | "DSC";
  points?: Array<{lat:number; lon:number}>; // ASC/DSC
  longitude?: number;                      // MC/IC
}

type CityInfluence = {
  cityId: string;
  body: Body;
  angle: Angle;
  distanceKm: number;
  scenarioDistancesKm: number[];
}
```

The calculation layer MUST NOT contain words such as “career”, “love”, “good”, “bad”, “supportive”, or “challenging”.

## 15. Error handling

Fail visibly for:
- unresolved birthplace
- missing timezone
- ambiguous/nonexistent local time not resolved
- astronomy dependency error
- invalid coordinates
- no valid rising/setting solution at a latitude

Never fabricate a line or fallback to an LLM.

## 16. Acceptance criteria

Calculation module is accepted when:
1. Golden astronomical tests pass within tolerance.
2. MC/IC opposition is 180° ± numerical tolerance.
3. ASC/DSC geometry passes horizon checks.
4. Results are deterministic.
5. Birth-time scenario recomputation is independent, not an approximate longitude shift.
6. No interpretation logic exists inside calculation files.

## 17. Suggested source structure

```text
src/astro/
  types.ts
  time.ts
  ephemeris.ts
  sidereal.ts
  mc-ic.ts
  asc-dsc.ts
  normalize.ts
  geo-distance.ts
  city-proximity.ts
  sensitivity.ts
```

## 18. Validation before public launch

Compare at least 20–30 diverse birth cases against a trusted reference implementation. Include:
- both hemispheres
- near-equator and high-latitude births
- DST and non-DST dates
- dates across several decades
- antimeridian cases
- high-declination Moon cases

Document every material difference rather than “tuning” the output to match one example.
