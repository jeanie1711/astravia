import { influenceKey, pairKey } from "../scoring/combination-rules.js";
import type { Body } from "../astro/types.js";
import type { Influence } from "../scoring/types.js";

// Narrative synthesis phrases for the 25 combination rules
// (06-interpretation-library.md §3), keyed by the same pair identity as
// scoring/combination-rules.ts's coherence classification. This module
// only holds prose -- it never recalculates coherence (CLAUDE.md §3: "the
// interpretation layer must not recalculate astronomy" extends to not
// re-deriving scoring's classifications either).
export type CombinationSynthesis = {
  synthesis: string;
  story: string;
};

const EXACT_PAIR_SYNTHESIS = new Map<string, CombinationSynthesis>();
const BODY_PAIR_SYNTHESIS = new Map<string, CombinationSynthesis>();

function addExact(a: Influence, b: Influence, synthesis: CombinationSynthesis): void {
  EXACT_PAIR_SYNTHESIS.set(pairKey(influenceKey(a.body, a.angle), influenceKey(b.body, b.angle)), synthesis);
}

function addBody(a: Body, b: Body, synthesis: CombinationSynthesis): void {
  BODY_PAIR_SYNTHESIS.set(pairKey(a, b), synthesis);
}

const sunMc: Influence = { body: "Sun", angle: "MC" };
const venusAsc: Influence = { body: "Venus", angle: "ASC" };
const mercuryMc: Influence = { body: "Mercury", angle: "MC" };

// 1
addExact(sunMc, { body: "Jupiter", angle: "MC" }, {
  synthesis: "Visibility meets expansion.",
  story: "Recognition and leadership combine with broader opportunity. Watch overconfidence."
});
// 2
addExact(sunMc, mercuryMc, {
  synthesis: "Visibility meets communication.",
  story: "Strong for consulting, speaking, product or business communication, and knowledge work."
});
// 3
addExact(sunMc, venusAsc, {
  synthesis: "Professional visibility meets social ease.",
  story: "Good for relationship-led careers; watch people-pleasing."
});
// 4
addExact(sunMc, { body: "Neptune", angle: "ASC" }, {
  synthesis: "Visibility meets inspiration -- and ambiguity.",
  story: "The career opportunity remains, with more importance placed on clarity and boundaries."
});
// 5
addExact(sunMc, { body: "Saturn", angle: "ASC" }, {
  synthesis: "Visibility meets responsibility.",
  story: "A strong builder story; achievement may feel earned rather than effortless."
});
// 6
const plutoMcAscSynthesis: CombinationSynthesis = {
  synthesis: "Visibility meets transformation and power.",
  story: "High intensity; leadership and control dynamics are foregrounded."
};
addExact(sunMc, { body: "Pluto", angle: "MC" }, plutoMcAscSynthesis);
addExact(sunMc, { body: "Pluto", angle: "ASC" }, plutoMcAscSynthesis);
// 7
const venusJupiterSynthesis: CombinationSynthesis = {
  synthesis: "Connection meets expansion.",
  story: "Social openness, helpful people and confidence; watch excess and idealisation."
};
addExact(venusAsc, { body: "Jupiter", angle: "ASC" }, venusJupiterSynthesis);
addExact(venusAsc, { body: "Jupiter", angle: "DSC" }, venusJupiterSynthesis);
// 8
addExact(venusAsc, { body: "Saturn", angle: "ASC" }, {
  synthesis: "Connection meets maturity.",
  story: "Relationships may be meaningful but ask for boundaries and commitment."
});
// 9
addExact(venusAsc, { body: "Uranus", angle: "ASC" }, {
  synthesis: "Attraction meets reinvention.",
  story: "Exciting networks and a new identity; less predictable."
});
// 10
addExact(venusAsc, { body: "Neptune", angle: "ASC" }, {
  synthesis: "Magnetism meets idealism.",
  story: "Creative and romantic; add a note on projection and boundaries."
});
// 11
addExact({ body: "Moon", angle: "IC" }, { body: "Jupiter", angle: "IC" }, {
  synthesis: "Belonging meets expansion.",
  story: "One of the clearest home/family narratives; still worth a note against idealising."
});
// 12
addExact({ body: "Moon", angle: "IC" }, { body: "Venus", angle: "IC" }, {
  synthesis: "Belonging meets harmony.",
  story: "A strong home, family and lifestyle narrative."
});
// 13
addExact({ body: "Jupiter", angle: "IC" }, { body: "Venus", angle: "IC" }, {
  synthesis: "A generous, comfortable home-base signature.",
  story: "Watch excess and comfort-seeking."
});
// 14
addExact(mercuryMc, { body: "Jupiter", angle: "MC" }, {
  synthesis: "Ideas meet expansion.",
  story: "Teaching, consulting, international business, publishing and networks."
});
// 15
const mercuryUranusSynthesis: CombinationSynthesis = {
  synthesis: "Communication meets innovation.",
  story: "Strong for tech and new ideas; watch fragmentation."
};
addExact(mercuryMc, { body: "Uranus", angle: "MC" }, mercuryUranusSynthesis);
addExact(mercuryMc, { body: "Uranus", angle: "ASC" }, mercuryUranusSynthesis);
// 16
addExact({ body: "Mars", angle: "MC" }, { body: "Jupiter", angle: "MC" }, {
  synthesis: "Momentum meets expansion.",
  story: "Excellent launch energy; watch overreach and burnout."
});
// 17
addExact({ body: "Mars", angle: "MC" }, { body: "Saturn", angle: "MC" }, {
  synthesis: "Drive meets discipline.",
  story: "High execution potential; heavy workload or frustration if blocked."
});
// 18
addBody("Mars", "Pluto", {
  synthesis: "Intensity compounds.",
  story: "Never romanticised -- power, conflict and burnout risk are foregrounded."
});
// 19
addBody("Saturn", "Pluto", {
  synthesis: "Deep restructuring under pressure.",
  story: "Strong transformation, but demanding; positive language is kept measured."
});
// 20
addBody("Uranus", "Neptune", {
  synthesis: "Reinvention meets imagination.",
  story: "Inspiring but destabilising; practical grounding matters."
});
// 21
addBody("Uranus", "Saturn", {
  synthesis: "Freedom meets structure.",
  story: "A productive tension between change and responsibility."
});
// 22
addBody("Neptune", "Jupiter", {
  synthesis: "Vision meets expansion.",
  story: "Inspiring; worth checking against unrealistic expectations."
});
// 23
addBody("Moon", "Neptune", {
  synthesis: "Sensitivity is amplified.",
  story: "Creative and intuitive; boundaries and emotional clarity matter."
});
// 24
addBody("Venus", "Pluto", {
  synthesis: "Attraction meets intensity.",
  story: "Magnetic but not necessarily easy; power dynamics matter."
});
// 25
addBody("Mercury", "Neptune", {
  synthesis: "Ideas meet imagination.",
  story: "Creative communication; clarity and fact-checking matter."
});

// Looks up the documented synthesis for a primary/secondary pair. Returns
// undefined when no explicit rule covers this pair (composers fall back to
// controlled composition from the two entries' own core themes).
export function lookupSynthesis(a: Influence, b: Influence): CombinationSynthesis | undefined {
  const exact = EXACT_PAIR_SYNTHESIS.get(pairKey(influenceKey(a.body, a.angle), influenceKey(b.body, b.angle)));
  if (exact) return exact;
  return BODY_PAIR_SYNTHESIS.get(pairKey(a.body, b.body));
}
