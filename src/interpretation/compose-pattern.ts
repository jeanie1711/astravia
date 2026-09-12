import type { Language } from "../i18n/types";
import type { Influence, RankedCity, StabilityLabel } from "../scoring/types";

// "Your Pattern" (06-interpretation-library.md §8): derived only from
// aggregate structured calculation/scoring data, never claims a fixed
// psychological trait, and is omitted entirely when no threshold is met
// (product brief §11, result-content-framework §10).
const MIN_PATTERN_COUNT = 3;

// Renamed "Your Pattern" -> "Your location story" in the UI (product
// feedback 2026-09-06): the sentence alone read like a report conclusion.
// `chips` are short labels for the same already-approved sentence, not new
// interpretive claims -- one fixed set per pattern branch below.
export type PatternResult = { sentence: string; chips: string[] };

function includesInfluence(influences: Influence[], body: Influence["body"], angle?: Influence["angle"]): boolean {
  return influences.some((i) => i.body === body && (angle === undefined || i.angle === angle));
}

function cityHasInfluence(city: RankedCity, body: Influence["body"], angle?: Influence["angle"]): boolean {
  const primaryMatches = city.primaryInfluence ? includesInfluence([city.primaryInfluence], body, angle) : false;
  return primaryMatches || includesInfluence(city.secondaryInfluences, body, angle);
}

function countByStability(cities: RankedCity[], labels: StabilityLabel[]): number {
  return cities.filter((c) => labels.includes(c.stability)).length;
}

const PATTERN_COPY_EN = {
  sunMc: {
    sentence: "Visibility and professional identity repeat across several of your strongest locations.",
    chips: ["Visibility", "Professional identity", "Public recognition"]
  },
  venus: {
    sentence: "Connection, collaboration and social ease are recurring themes across your map.",
    chips: ["Connection", "Collaboration", "Social ease"]
  },
  saturnOrPluto: {
    sentence:
      "Many of your strongest places pair opportunity with responsibility or transformation; your map is not primarily an \"easy path\" pattern.",
    chips: ["Reinvention", "Purpose over ease", "Growth through responsibility"]
  },
  highStability: {
    sentence: "Your strongest recommendations remain relatively consistent across your birth-time range.",
    chips: ["Consistency", "Stable across birth times"]
  },
  timeSensitive: {
    sentence:
      "Your ranking changes noticeably across your birth-time range, so exact birth time matters more for this chart.",
    chips: ["Time-sensitive", "Birth time matters here"]
  }
} satisfies Record<string, PatternResult>;

const PATTERN_COPY_VI: typeof PATTERN_COPY_EN = {
  sunMc: {
    sentence: "Sự hiện diện và bản sắc nghề nghiệp lặp lại xuyên suốt nhiều nơi mạnh nhất trong bản đồ của bạn.",
    chips: ["Sự hiện diện", "Bản sắc nghề nghiệp", "Sự công nhận trước công chúng"]
  },
  venus: {
    sentence: "Sự kết nối, hợp tác và sự tự nhiên trong giao tiếp xã hội là những chủ đề lặp lại xuyên suốt bản đồ của bạn.",
    chips: ["Kết nối", "Hợp tác", "Sự tự nhiên trong giao tiếp"]
  },
  saturnOrPluto: {
    sentence:
      "Nhiều nơi mạnh nhất của bạn kết hợp cơ hội với trách nhiệm hoặc sự chuyển hóa; bản đồ của bạn không thiên về mô hình \"con đường dễ dàng\".",
    chips: ["Tái tạo bản thân", "Mục đích hơn là sự dễ dàng", "Phát triển qua trách nhiệm"]
  },
  highStability: {
    sentence: "Những gợi ý mạnh nhất của bạn duy trì khá ổn định trên toàn bộ khoảng giờ sinh.",
    chips: ["Tính nhất quán", "Ổn định qua các giờ sinh"]
  },
  timeSensitive: {
    sentence:
      "Thứ hạng của bạn thay đổi đáng kể trên toàn bộ khoảng giờ sinh, vì vậy giờ sinh chính xác quan trọng hơn đối với bản đồ này.",
    chips: ["Nhạy cảm với giờ sinh", "Giờ sinh quan trọng ở đây"]
  }
};

// Returns one pattern sentence plus its chips, or undefined if no
// documented threshold is met (the Results page then omits the "Your
// location story" section entirely).
export function detectPattern(topCities: RankedCity[], language: Language): PatternResult | undefined {
  const copy = language === "vi" ? PATTERN_COPY_VI : PATTERN_COPY_EN;

  const sunMcCount = topCities.filter((c) => cityHasInfluence(c, "Sun", "MC")).length;
  if (sunMcCount >= MIN_PATTERN_COUNT) return copy.sunMc;

  const venusAngularCount = topCities.filter((c) => cityHasInfluence(c, "Venus")).length;
  if (venusAngularCount >= MIN_PATTERN_COUNT) return copy.venus;

  const saturnOrPlutoSecondaryCount = topCities.filter(
    (c) => includesInfluence(c.secondaryInfluences, "Saturn") || includesInfluence(c.secondaryInfluences, "Pluto")
  ).length;
  if (saturnOrPlutoSecondaryCount >= MIN_PATTERN_COUNT) return copy.saturnOrPluto;

  const highStabilityCount = countByStability(topCities, ["HIGH", "EXACT"]);
  if (highStabilityCount >= MIN_PATTERN_COUNT) return copy.highStability;

  const timeSensitiveCount = countByStability(topCities, ["TIME_SENSITIVE"]);
  if (timeSensitiveCount >= MIN_PATTERN_COUNT) return copy.timeSensitive;

  return undefined;
}
