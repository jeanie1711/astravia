import { classifyStrengthBand } from "../astro/geo-distance";
import type { Angle, Body } from "../astro/types";
import { angleDomain, planetCategory } from "./category";
import { distanceStrength } from "./distance-strength";
import type { CandidateInfluence, ParanCandidate, ScorableGoal, SelectedInfluences } from "./types";

const NOT_USED_THRESHOLD_KM = 750;
const PRIMARY_MIN_STRENGTH = 0.35;
const SECONDARY_MIN_STRENGTH = 0.2;
const MAX_SECONDARY = 3;

export type RawInfluenceDistance = {
  body: Body;
  angle: Angle;
  distanceKm: number;
};

// Builds candidate influences for one city at one scenario instant
// (spec §5: "Candidate influence if distance < 750 km"). Not goal-specific
// -- a candidate's category (§3.2) is intrinsic to its body; which goal(s)
// it's relevant to is resolved at selection time from its angle (§3.3),
// not baked into the candidate itself.
export function buildCandidateInfluences(influences: RawInfluenceDistance[]): CandidateInfluence[] {
  const candidates: CandidateInfluence[] = [];

  for (const influence of influences) {
    if (influence.distanceKm >= NOT_USED_THRESHOLD_KM) continue;

    candidates.push({
      body: influence.body,
      angle: influence.angle,
      distanceKm: influence.distanceKm,
      strengthBand: classifyStrengthBand(influence.distanceKm),
      category: planetCategory(influence.body),
      strength: distanceStrength(influence.distanceKm)
    });
  }

  candidates.sort((a, b) => b.strength - a.strength);
  return candidates;
}

// Selects the primary and up to three secondary influences from a
// strength-sorted candidate list, for one specific goal (spec §5).
//
// v0.2, real behavior change from v0.1: the primary MUST come from a
// candidate whose angle matches the goal's own domain (§3.3) -- a
// non-matching angle contributes nothing to primary selection at all,
// not "weakly" as v0.1's per-goal relevance did. Secondary has no domain
// restriction: a different-domain (or same-domain) candidate can still be
// the secondary/reinforcing influence, which is exactly what makes the
// Layered coherence tier meaningful (§6).
//
// Secondary MUST be a different body than the primary. Found via real
// Golden Case data, not a synthetic fixture: a body's MC and IC longitude
// are always exactly 180 degrees apart, which places them on the SAME
// meridian great circle -- so a city's distance to a body's MC line and to
// that same body's IC line are always identical. Whenever a body is
// primary via MC (or IC), its own IC (or MC) counterpart would otherwise
// always be tied for the single strongest remaining candidate, becoming a
// mechanical "secondary" that isn't a second signal at all -- just the
// same line seen from its other angle. v0.1 avoided this by accident (the
// opposite angle's per-goal relevance was usually low); v0.2 has to rule
// it out explicitly since a candidate's strength no longer depends on goal.
//
// `cityParans` (04 §5.1): every paran within range of this city, in
// whatever order -- not pre-filtered to the primary, since the primary
// isn't known until this function determines it. A paran is only eligible
// for the reinforcement role if it involves the primary's exact body and
// angle; the OTHER side of that paran becomes the effective reinforcement
// (`paranReinforcement`) if it beats the best plain secondary, since a
// real second line is the more literal signal on a tie.
export function selectInfluences(
  candidates: CandidateInfluence[],
  goal: ScorableGoal,
  cityParans: ParanCandidate[] = []
): SelectedInfluences {
  const domainMatches = candidates.filter((c) => angleDomain(c.angle) === goal);
  const [topDomainMatch] = domainMatches;
  const primary = topDomainMatch && topDomainMatch.strength > PRIMARY_MIN_STRENGTH ? topDomainMatch : undefined;

  const remaining = primary ? candidates.filter((c) => c.body !== primary.body) : candidates;
  const secondary = remaining.filter((c) => c.strength > SECONDARY_MIN_STRENGTH).slice(0, MAX_SECONDARY);

  let paranReinforcement: CandidateInfluence | undefined;
  if (primary) {
    const involvingPrimary = cityParans
      .map((p) => {
        if (p.bodyA === primary.body && p.angleA === primary.angle) return { body: p.bodyB, angle: p.angleB, distanceKm: p.distanceKm };
        if (p.bodyB === primary.body && p.angleB === primary.angle) return { body: p.bodyA, angle: p.angleA, distanceKm: p.distanceKm };
        return undefined;
      })
      .filter((p): p is { body: Body; angle: Angle; distanceKm: number } => p !== undefined)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const [bestParan] = involvingPrimary;
    const paranStrength = bestParan ? distanceStrength(bestParan.distanceKm) : 0;
    const plainSecondaryStrength = secondary[0]?.strength ?? 0;

    if (bestParan && paranStrength > SECONDARY_MIN_STRENGTH && paranStrength > plainSecondaryStrength) {
      paranReinforcement = {
        body: bestParan.body,
        angle: bestParan.angle,
        distanceKm: bestParan.distanceKm,
        strengthBand: classifyStrengthBand(bestParan.distanceKm),
        category: planetCategory(bestParan.body),
        strength: paranStrength
      };
    }
  }

  return { primary, secondary, paranReinforcement };
}
