// Safety/integrity language validation (CLAUDE.md §13, 06-interpretation-
// library.md §10, Golden Test I004/I005). Used both as a build-time check
// over the static content library and as a defensive runtime check over
// composed output.
const PROHIBITED_PHRASES: readonly string[] = [
  "will definitely",
  "guaranteed",
  "destined",
  "soulmate",
  "you will become rich",
  "you will become wealthy",
  "do not move here",
  "cursed",
  "bad energy",
  "avoid this place",
  "dangerous"
];

// Practical domains astrology must never speak to (spec I005).
const PRACTICAL_DOMAIN_TERMS: readonly string[] = [
  "visa",
  "cost of living",
  "job market",
  "healthcare system",
  "school quality",
  "immigration",
  "safety rating"
];

function findMatches(text: string, terms: readonly string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term));
}

export function findProhibitedPhrases(text: string): string[] {
  return findMatches(text, PROHIBITED_PHRASES);
}

export function findPracticalDomainClaims(text: string): string[] {
  return findMatches(text, PRACTICAL_DOMAIN_TERMS);
}
