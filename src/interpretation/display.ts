import type { Angle, Body } from "../astro/types";
import type { Language } from "../i18n/types";
import type { Goal } from "../scoring/types";

type Stability = "EXACT" | "HIGH" | "MEDIUM" | "TIME_SENSITIVE";

// Presentation-only lookups: no business logic, just approved display copy.
const GOAL_DISPLAY_NAME: Record<Language, Record<Goal, string>> = {
  en: {
    CAREER: "Career",
    LOVE: "Love & Relationships",
    HOME: "Home & Family",
    GROWTH: "Personal Growth",
    OVERALL: "Overall"
  },
  vi: {
    CAREER: "Sự nghiệp",
    LOVE: "Tình cảm & Các mối quan hệ",
    HOME: "Nhà cửa & Gia đình",
    GROWTH: "Phát triển bản thân",
    OVERALL: "Tổng thể"
  }
};

export function goalDisplayName(goal: Goal, language: Language): string {
  return GOAL_DISPLAY_NAME[language][goal];
}

const BODY_SYMBOL: Record<Body, string> = {
  Sun: "☉",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇"
};

export function bodySymbol(body: Body): string {
  return BODY_SYMBOL[body];
}

const BODY_NAME: Record<Language, Record<Body, string>> = {
  en: {
    Sun: "Sun",
    Moon: "Moon",
    Mercury: "Mercury",
    Venus: "Venus",
    Mars: "Mars",
    Jupiter: "Jupiter",
    Saturn: "Saturn",
    Uranus: "Uranus",
    Neptune: "Neptune",
    Pluto: "Pluto"
  },
  vi: {
    Sun: "Mặt Trời",
    Moon: "Mặt Trăng",
    Mercury: "Sao Thủy",
    Venus: "Sao Kim",
    Mars: "Sao Hỏa",
    Jupiter: "Sao Mộc",
    Saturn: "Sao Thổ",
    Uranus: "Sao Thiên Vương",
    Neptune: "Sao Hải Vương",
    Pluto: "Sao Diêm Vương"
  }
};

export function bodyName(body: Body, language: Language): string {
  return BODY_NAME[language][body];
}

export function influenceLabel(body: Body, angle: Angle, language: Language): string {
  return `${bodySymbol(body)} ${bodyName(body, language)}–${angle}`;
}

// Star wording (06-interpretation-library.md §7) -- approved fixed
// templates, substituting the goal display name.
export function starWording(stars: 1 | 2 | 3 | 4 | 5, goal: Goal, language: Language): string {
  const goalName = goalDisplayName(goal, language);
  if (language === "vi") {
    switch (stars) {
      case 5:
        return `Một trong những nơi rõ ràng nhất của bạn cho ${goalName}.`;
      case 4:
        return `Một nơi phù hợp mạnh cho ${goalName}, kèm theo một số đánh đổi đáng kể.`;
      case 3:
        return "Một nơi có cả cơ hội lẫn thách thức đan xen.";
      case 2:
        return `Có một ảnh hưởng mạnh hiện diện, nhưng có thể sẽ đòi hỏi nhiều hơn cho ${goalName}.`;
      case 1:
        return `Nơi này không được nhấn mạnh nhiều cho ${goalName} trong mô hình này.`;
    }
  }
  switch (stars) {
    case 5:
      return `One of your clearest locations for ${goalName}.`;
    case 4:
      return `A strong location for ${goalName}, with some meaningful trade-offs.`;
    case 3:
      return "A layered location with both opportunity and challenge.";
    case 2:
      return `A strong influence is present, but it may feel demanding for ${goalName}.`;
    case 1:
      return `This location is not strongly emphasised for ${goalName} in this model.`;
  }
}

// Birth-time confidence short label (05-result-content-framework.md §G).
export function confidenceLabel(stability: Stability, language: Language): string {
  if (language === "vi") {
    switch (stability) {
      case "EXACT":
        return "Tính theo giờ sinh chính xác";
      case "HIGH":
        return "Độ tin cậy cao";
      case "MEDIUM":
        return "Độ tin cậy trung bình";
      case "TIME_SENSITIVE":
        return "Nhạy cảm với giờ sinh";
    }
  }
  switch (stability) {
    case "EXACT":
      return "Exact-time calculation";
    case "HIGH":
      return "High confidence";
    case "MEDIUM":
      return "Medium confidence";
    case "TIME_SENSITIVE":
      return "Time-sensitive";
  }
}

// Birth-time confidence wording (06-interpretation-library.md §6).
export function confidenceExplanation(stability: Stability, language: Language): string {
  if (language === "vi") {
    switch (stability) {
      case "EXACT":
        return "Được tính bằng giờ sinh chính xác bạn đã nhập.";
      case "HIGH":
        return "Nơi này vẫn là một trong những kết quả phù hợp nhất của bạn trên toàn bộ khoảng giờ sinh.";
      case "MEDIUM":
        return "Nơi này vẫn có ý nghĩa, dù mức độ phù hợp có thay đổi tùy theo giờ sinh chính xác của bạn.";
      case "TIME_SENSITIVE":
        return "Gợi ý này phụ thuộc đáng kể vào giờ sinh chính xác của bạn.";
    }
  }
  switch (stability) {
    case "EXACT":
      return "Calculated using the exact birth time you entered.";
    case "HIGH":
      return "This location remains one of your stronger matches across your full birth-time range.";
    case "MEDIUM":
      return "This location remains meaningful, although its strength changes depending on your exact birth time.";
    case "TIME_SENSITIVE":
      return "This recommendation depends significantly on your exact birth time.";
  }
}
