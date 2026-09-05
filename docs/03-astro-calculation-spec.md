# Astro Calculation Specification v0.3

> **2026-09-05:** Parans moved from "out of scope" (v0.1) to "approved, geometry specified" (v0.3) per `docs/PROPOSAL-canonical-framework.md` / `docs/04-scoring-ranking-spec.md` v0.2. Full algorithm in §19. **Not yet implemented in code** — `src/astro/` has no paran module yet; see `04-scoring-ranking-spec.md` §16 for the overall implementation tracker. Everything else in this document is unchanged from v0.1 and remains exactly as implemented.

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
- Parans (approved 2026-09-05; geometry not yet specified — see §19)

Out of scope: houses, aspects, nodes, Chiron, local-space astrology, relocated natal charts, transits, progressions, synastry.

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

## 19. Parans (v0.3 addendum — geometry specified 2026-09-05)

**What a paran is:** the latitude at which two planetary lines are simultaneously angular (rising, setting, culminating, or anti-culminating) for an observer at that latitude. Unlike MC/IC (fixed-longitude lines) or ASC/DSC (curved lines sampled per latitude), a paran is a **horizontal band**: valid at every longitude along that one latitude, not tied to a single point on the map.

**Why it matters here:** real ACG literature (Jim Lewis onward) treats a paran crossing as a distinct, often more nuanced signal than a single line — two influences blending at a specific latitude. `docs/04-scoring-ranking-spec.md` v0.2 §5.1/§6 wants parans eligible as a reinforcing signal in scoring and as their own named signal type in a City Story (`06-interpretation-library.md` §5), separate from "a second nearby line."

### 19.1 The shared clock: local sidereal time at each angle

Every angle event happens at a specific **local sidereal time (LST)**, independent of where on Earth's rotation that LST occurs (longitude only shifts *where* that LST falls, not *whether* it does — this is the same LST=RA identity `mc-ic.ts` already uses, just not yet expressed as its own quantity):

| Angle | LST at which body X (RA, dec) reaches it | Latitude-dependent? |
|---|---|---|
| MC | `RA` | No |
| IC | `RA + 180°` | No |
| ASC | `RA - H0(lat, dec)` | Yes |
| DSC | `RA + H0(lat, dec)` | Yes |

where `H0(lat, dec) = arccos(-tan(lat)·tan(dec))` is exactly `horizonHourAngleDeg()` in `asc-dsc.ts` (undefined/no solution when `|tan(lat)·tan(dec)| > 1`, i.e. the body is circumpolar at that latitude — same circumpolar-gap rule as the existing ASC/DSC sampling).

**A paran between (bodyA, angleA) and (bodyB, angleB) is any latitude φ where `LST_angleA(bodyA, φ) ≡ LST_angleB(bodyB, φ) (mod 360°)`.** Notably, GST does not appear in this condition at all — a paran depends only on the two bodies' RA/Dec at the birth instant, never on the specific rotation of the Earth at that moment. (Sanity check: this matches how real ACG software treats parans as a property of the birth chart itself, not of a specific map orientation.)

### 19.2 MC/IC × MC/IC — excluded

Both sides are latitude-independent, so the equation `RA_A[+180°] ≡ RA_B[+180°] (mod 360°)` either holds at *every* latitude (only when the two right ascensions coincide almost exactly — not a meaningful location) or at *no* latitude. **Do not compute this combination**; it is not a real paran (this matches standard ACG practice, which only pairs a culmination/anti-culmination with a rising/setting event, never two culminations with each other).

### 19.3 MC/IC × ASC/DSC — closed form

Four sub-combinations (MC-ASC, MC-DSC, IC-ASC, IC-DSC), each reducing to one algebraic solve. Let `RA_A' = RA_A` (MC) or `RA_A + 180°` (IC), and let `sign = -1` for ASC or `+1` for DSC on the B side:

```
RA_A' = RA_B + sign · H0(B, φ)
→ H0(B, φ) = sign · (RA_A' − RA_B)     (reduce to [0°, 360°) first)
```

`H0` is only defined in `[0°, 180°]` (it's an `arccos` result), so:
1. Reduce `sign · (RA_A' − RA_B)` into `[0°, 360°)`, call it `h_target`.
2. If `h_target > 180°`, **no solution** for this specific sub-combination (the other one, with the opposite `sign`, may still have one — check both independently).
3. Otherwise invert the horizon equation for `φ` given a target `H0`:
   ```
   cos(h_target) = -tan(φ)·tan(dec_B)
   → φ = arctan( -cos(h_target) / tan(dec_B) )
   ```
   This has exactly one solution in `(-90°, 90°)` for any `h_target`, **except** when `dec_B ≈ 0°` (body B on the celestial equator): then `tan(dec_B) ≈ 0` and the equation degenerates — if `cos(h_target) ≈ 0` too (i.e. `h_target ≈ 90°`), every latitude satisfies it (a genuine but astronomically rare edge case — treat as "no single-latitude paran" and skip); otherwise there is no solution. Guard the division explicitly rather than letting it produce `±Infinity`.

### 19.4 ASC/DSC × ASC/DSC — numerical root-finding

No closed form, since both sides are nonlinear in `φ`. Define, for a candidate sub-combination `(signA, signB)` (each `-1` for ASC or `+1` for DSC):

```
f(φ) = wrap180( [RA_A + signA·H0(A, φ)] − [RA_B + signB·H0(B, φ)] )
```

where `wrap180(x)` reduces `x` into `(-180°, 180°]` (so `f` measures the *shortest* angular gap, avoiding a false "no crossing" verdict from a 359°→1° wraparound). A paran latitude is any `φ` where `f(φ) = 0`.

Algorithm (deterministic, reusing the existing ASC/DSC sampling convention rather than inventing a new one):
1. Sample `φ` from `ASC_DSC_LATITUDE_MIN` to `ASC_DSC_LATITUDE_MAX` in `ASC_DSC_LATITUDE_STEP` steps (same constants `asc-dsc.ts` already exports — `-89°` to `89°`, `0.25°`).
2. At each sample, compute `H0(A, φ)` and `H0(B, φ)`; skip (leave a gap) where either is undefined (circumpolar).
3. Evaluate `f(φ)` at each valid sample. Wherever consecutive valid samples have opposite signs of `f`, a root lies between them (Intermediate Value Theorem — `f` is continuous within a circumpolar-free interval).
4. Refine each bracketed root with **fixed-iteration bisection** (30 iterations is enough for sub-millimeter precision on a great circle; run exactly this many every time so results are bit-reproducible across runs, per CLAUDE.md determinism) rather than a tolerance-based stopping condition.
5. A single sub-combination can have zero, one, or more than one root (rare, but possible near the extremes of each body's declination) — return all of them.

There are 4 sub-combinations per body pair here (ASC-ASC, ASC-DSC, DSC-ASC, DSC-DSC), each run independently through the same procedure.

### 19.5 Scope: which pairs to compute

10 bodies → 45 unordered pairs. Per pair: 4 closed-form sub-combinations (§19.3, one from each body's MC/IC against the other's ASC/DSC — note this must be run **both directions**, A's MC/IC against B's ASC/DSC *and* B's MC/IC against A's ASC/DSC, i.e. 8 closed-form checks per pair) + 4 numerical sub-combinations (§19.4). That's up to 12 candidate parans per pair, 540 across all 45 pairs, before discarding no-solution cases — cheap to compute exhaustively (closed-form is O(1), numerical is a few hundred `arccos` evaluations per sub-combination); no relevance pre-filter is needed for performance. Compute all of them for a birth chart once, alongside the existing MC/IC/ASC/DSC lines.

### 19.6 City-to-paran distance

A paran has no longitude dependency, so the nearest point on it to a city at `(latCity, lonCity)` is always directly along that city's own meridian, at `(latParan, lonCity)`. Since a meridian is a great circle, the distance is exact, not an approximation:

```ts
function distanceToParanKm(latCityDeg: number, latParanDeg: number): number {
  return Math.abs(toRad(latCityDeg - latParanDeg)) * EARTH_RADIUS_KM; // EARTH_RADIUS_KM from geo-distance.ts
}
```

Feed this into the same `classifyStrengthBand()`/`distanceStrength()` machinery already used for lines (`04-scoring-ranking-spec.md` §3.1) — a paran is scored by proximity exactly like a line is, just measured in one dimension instead of two.

### 19.7 Uncertainty scenarios

RA/Dec shift slightly across a birth-time uncertainty window exactly as they do for the existing MC/IC/ASC/DSC lines, so paran latitudes shift too. Recompute parans independently for each scenario (lower/baseline/upper), the same way `sensitivity.ts` already does for lines — no new stability rule is needed; G007 (independent recomputation per scenario) applies unchanged.

### 19.8 Output shape

```ts
type Paran = {
  bodyA: Body; angleA: "MC" | "IC" | "ASC" | "DSC";
  bodyB: Body; angleB: "MC" | "IC" | "ASC" | "DSC";
  latitudeDeg: number;
};
```

### 19.9 Validation before implementation lands

Per `03-astro-calculation-spec.md` §18's existing standard: before this is trusted in production scoring, cross-check at least a handful of hand-computed or third-party-software-computed parans (several published ACG tools list paran tables per chart) against this implementation's output, across a spread of birth locations/dates including at least one high-declination body (to exercise the circumpolar-gap paths in both §19.3 and §19.4) and one near-equatorial-declination body (to exercise the `dec_B ≈ 0°` edge case in §19.3). Document any discrepancy rather than silently adjusting the formulas to match one example.
