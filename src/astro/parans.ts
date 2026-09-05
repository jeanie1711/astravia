import { ASC_DSC_LATITUDE_MAX, ASC_DSC_LATITUDE_MIN, ASC_DSC_LATITUDE_STEP, horizonHourAngleDeg } from "./asc-dsc";
import { equatorialOfDate } from "./ephemeris";
import { normalizeLon } from "./normalize";
import { BODIES, type Angle, type Body } from "./types";

// Paran geometry. Spec: 03-astro-calculation-spec.md §19.
//
// A paran is the latitude at which two bodies are simultaneously angular
// (MC/IC/ASC/DSC) for an observer there. Every angle event happens at a
// specific local sidereal time (LST): MC at RA, IC at RA+180 (both
// latitude-independent), ASC at RA-H0(lat,dec), DSC at RA+H0(lat,dec)
// (both latitude-dependent, via the same horizon equation asc-dsc.ts
// already uses). A paran solves LST_angleA(bodyA, phi) = LST_angleB(bodyB,
// phi) for phi -- notably, GST never enters this equation, so a paran
// depends only on the two bodies' RA/Dec at the birth instant.

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const BISECTION_ITERATIONS = 30; // fixed count, not tolerance-based -- deterministic/reproducible (CLAUDE.md)
const DEC_NEAR_EQUATOR_EPSILON = 1e-9;

export type Paran = {
  bodyA: Body;
  angleA: Angle;
  bodyB: Body;
  angleB: Angle;
  latitudeDeg: number;
};

function normalizeDeg360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

// Reduces an angular difference to its shortest signed representation in
// (-180, 180] -- reusing normalizeLon's exact formula (it operates on the
// same "any angle in degrees" domain a longitude does; a paran-timing
// difference is not literally a longitude, but the wraparound math is
// identical).
export function wrap180(deg: number): number {
  return normalizeLon(deg);
}

// §19.3: MC/IC(bodyA-side) x ASC/DSC(bodyB-side), closed form.
// raAprime is bodyA's MC (=RA) or IC (=RA+180) right ascension already
// resolved by the caller; sign is -1 for bodyB's ASC or +1 for its DSC.
// Returns undefined when this specific sub-combination has no solution
// (the opposite `sign` may still have one -- callers check both).
// Exported for direct, hand-verifiable unit testing (tests/astro/parans.test.ts).
export function closedFormParanLatitude(raAprimeDeg: number, raBDeg: number, decBDeg: number, sign: -1 | 1): number | undefined {
  const reduced = normalizeDeg360(sign * (raAprimeDeg - raBDeg));
  if (reduced > 180) return undefined; // H0 only has solutions in [0, 180]
  const hTargetDeg = reduced;

  const tanDecB = Math.tan(decBDeg * DEG_TO_RAD);
  if (Math.abs(tanDecB) < DEC_NEAR_EQUATOR_EPSILON) {
    // bodyB essentially on the celestial equator: the equation degenerates
    // to either "every latitude" (cos(hTarget)~0 too) or "no latitude" --
    // neither is a meaningful single-latitude paran, so skip both.
    return undefined;
  }

  const cosHTarget = Math.cos(hTargetDeg * DEG_TO_RAD);
  const tanPhi = -cosHTarget / tanDecB;
  return Math.atan(tanPhi) * RAD_TO_DEG;
}

// §19.4: ASC/DSC(bodyA-side) x ASC/DSC(bodyB-side), numerical.
// signA/signB: -1 for ASC, +1 for DSC on that body.
// Exported for direct unit testing.
export function angularGapAtLatitude(
  latDeg: number,
  raADeg: number,
  decADeg: number,
  signA: -1 | 1,
  raBDeg: number,
  decBDeg: number,
  signB: -1 | 1
): number | undefined {
  const h0A = horizonHourAngleDeg(latDeg, decADeg);
  const h0B = horizonHourAngleDeg(latDeg, decBDeg);
  if (h0A === undefined || h0B === undefined) return undefined; // circumpolar gap
  const lstA = raADeg + signA * h0A;
  const lstB = raBDeg + signB * h0B;
  return wrap180(lstA - lstB);
}

export function numericalParanLatitudes(
  raADeg: number,
  decADeg: number,
  signA: -1 | 1,
  raBDeg: number,
  decBDeg: number,
  signB: -1 | 1
): number[] {
  const roots: number[] = [];
  const stepsCount = Math.round((ASC_DSC_LATITUDE_MAX - ASC_DSC_LATITUDE_MIN) / ASC_DSC_LATITUDE_STEP);

  let prevLat: number | undefined;
  let prevGap: number | undefined;

  const gapAt = (lat: number) => angularGapAtLatitude(lat, raADeg, decADeg, signA, raBDeg, decBDeg, signB);

  for (let i = 0; i <= stepsCount; i++) {
    const lat = ASC_DSC_LATITUDE_MIN + i * ASC_DSC_LATITUDE_STEP;
    const gap = gapAt(lat);

    if (gap !== undefined && prevGap !== undefined && prevLat !== undefined) {
      const isOppositeSign = (prevGap <= 0 && gap >= 0) || (prevGap >= 0 && gap <= 0);
      // A jump near +-180 between adjacent samples is the wrap180
      // discontinuity, not a genuine zero-crossing (same convention
      // asc-dsc.ts's splitIntoSegments already uses for antimeridian jumps).
      const isGenuineCrossing = isOppositeSign && Math.abs(gap - prevGap) < 180;

      if (isGenuineCrossing) {
        let lo = prevLat;
        let hi = lat;
        let loGap = prevGap;
        for (let iter = 0; iter < BISECTION_ITERATIONS; iter++) {
          const mid = (lo + hi) / 2;
          const midGap = gapAt(mid);
          if (midGap === undefined) break; // circumpolar boundary inside the bracket -- rare; stop refining, keep current estimate
          if ((loGap <= 0 && midGap >= 0) || (loGap >= 0 && midGap <= 0)) {
            hi = mid;
          } else {
            lo = mid;
            loGap = midGap;
          }
        }
        roots.push((lo + hi) / 2);
      }
    }

    prevLat = lat;
    prevGap = gap;
  }

  return roots;
}

const MC_IC: readonly Angle[] = ["MC", "IC"];
const ASC_DSC: ReadonlyArray<[Angle, -1 | 1]> = [
  ["ASC", -1],
  ["DSC", 1]
];

// Computes every paran between every pair of the 10 bodies at one UTC
// instant (§19.5). MC/IC x MC/IC is intentionally excluded (§19.2 -- not a
// real paran). Cheap to compute exhaustively: closed-form is O(1), the
// numerical case is a few hundred trig evaluations; no relevance
// pre-filter is needed.
export function computeAllParansAtInstant(utcIso: string): Paran[] {
  const equatorial = new Map<Body, { raDeg: number; decDeg: number }>();
  for (const body of BODIES) {
    equatorial.set(body, equatorialOfDate(body, utcIso));
  }

  const parans: Paran[] = [];

  for (let i = 0; i < BODIES.length; i++) {
    for (let j = i + 1; j < BODIES.length; j++) {
      const bodyA = BODIES[i]!;
      const bodyB = BODIES[j]!;
      const { raDeg: raA, decDeg: decA } = equatorial.get(bodyA)!;
      const { raDeg: raB, decDeg: decB } = equatorial.get(bodyB)!;

      // bodyA's MC/IC vs bodyB's ASC/DSC (closed form)
      for (const angleA of MC_IC) {
        const raAPrime = angleA === "MC" ? raA : raA + 180;
        for (const [angleB, sign] of ASC_DSC) {
          const lat = closedFormParanLatitude(raAPrime, raB, decB, sign);
          if (lat !== undefined) parans.push({ bodyA, angleA, bodyB, angleB, latitudeDeg: lat });
        }
      }

      // bodyB's MC/IC vs bodyA's ASC/DSC (closed form, other direction)
      for (const angleB of MC_IC) {
        const raBPrime = angleB === "MC" ? raB : raB + 180;
        for (const [angleA, sign] of ASC_DSC) {
          const lat = closedFormParanLatitude(raBPrime, raA, decA, sign);
          if (lat !== undefined) parans.push({ bodyA, angleA, bodyB, angleB, latitudeDeg: lat });
        }
      }

      // bodyA's ASC/DSC vs bodyB's ASC/DSC (numerical, all 4 combinations)
      for (const [angleA, signA] of ASC_DSC) {
        for (const [angleB, signB] of ASC_DSC) {
          const lats = numericalParanLatitudes(raA, decA, signA, raB, decB, signB);
          for (const lat of lats) {
            parans.push({ bodyA, angleA, bodyB, angleB, latitudeDeg: lat });
          }
        }
      }
    }
  }

  return parans;
}
