import type { Language } from "../i18n/types";

// Safety/integrity language validation (CLAUDE.md §13, 06-interpretation-
// library.md §10, Golden Test I004/I005). Used both as a build-time check
// over the static content library and as a defensive runtime check over
// composed output.
const PROHIBITED_PHRASES: Record<Language, readonly string[]> = {
  en: [
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
  ],
  vi: [
    "chắc chắn sẽ",
    "đảm bảo",
    "định mệnh",
    "tri kỷ",
    "bạn sẽ trở nên giàu có",
    "bạn sẽ trở nên thịnh vượng",
    "đừng chuyển đến đây",
    "bị nguyền rủa",
    "năng lượng xấu",
    "hãy tránh xa nơi này",
    "nguy hiểm"
  ]
};

// Practical domains astrology must never speak to (spec I005).
const PRACTICAL_DOMAIN_TERMS: Record<Language, readonly string[]> = {
  en: ["visa", "cost of living", "job market", "healthcare system", "school quality", "immigration", "safety rating"],
  vi: ["visa", "thị thực", "chi phí sinh hoạt", "thị trường việc làm", "hệ thống y tế", "chất lượng trường học", "nhập cư", "mức độ an toàn"]
};

function findMatches(text: string, terms: readonly string[]): string[] {
  const lower = text.toLowerCase();
  return terms.filter((term) => lower.includes(term));
}

export function findProhibitedPhrases(text: string, language: Language): string[] {
  return findMatches(text, PROHIBITED_PHRASES[language]);
}

export function findPracticalDomainClaims(text: string, language: Language): string[] {
  return findMatches(text, PRACTICAL_DOMAIN_TERMS[language]);
}
