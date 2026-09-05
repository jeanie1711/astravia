// Shared comparator for anything carrying both a capped `stars` tier and a
// raw `internalScore` (RankedCity, CountryResult). Star tier is the
// PRIMARY sort key everywhere a ranking decision is made -- the global
// city list, a country's own best/second/third city selection, and
// country-vs-country ranking -- so a guardrail-capped result (CLAUDE.md
// §11: S002/S003/the tension+LOW-coherence cap, or a country's five-star
// qualifying-city rule) can never outrank an uncapped result from a
// higher tier just because its hidden raw score happens to be higher.
//
// Product decision 2026-09-05 (docs/DECISIONS.md): Top City and a
// country's "best matches" were selecting/ordering by raw internalScore
// alone, which let a guardrail-capped result (e.g. "4 stars, but really a
// 0.9 internally") legitimately outrank an uncapped result shown
// elsewhere as a full "5 stars" -- surfacing as an apparent contradiction
// once both were visible on screen. Both contexts now share this one
// comparator instead of quietly using two different orderings.
export function compareByStarsThenScore(
  a: { stars: number; internalScore: number },
  b: { stars: number; internalScore: number }
): number {
  return b.stars - a.stars || b.internalScore - a.internalScore;
}
