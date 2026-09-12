import type { Body } from "../astro/types";
import type { Language } from "../i18n/types";
import type { Goal } from "../scoring/types";
import type { Tone } from "./types";

// Small, reusable phrase vocabulary (2026-09-13 City Story redesign) that
// turns the 40-entry library's existing coreTheme/opportunity/tradeOff/
// feel/bestFor data into fuller prose, without hand-authoring unique text
// per city or per influence pair (955 cities x 4 goals x many combinations
// would make that impossible to maintain). Each table below has exactly
// one entry per planet (or per tone/goal) -- a bounded, reviewable set --
// derived from that planet's own already-approved coreTheme vocabulary
// across its four entries, not new astrological meaning. Per-language
// (2026-09-12 switcher) since these are prose fragments, not raw data.

export type VoiceTables = {
  // The planet's inner faculty as a short third-paragraph-opener phrase,
  // e.g. "A place where {rawMaterial} can become {outcome}...".
  RAW_MATERIAL: Record<Body, string>;
  // The fuller 3-part version for the opening paragraph: "{City} places
  // {FACULTY_PHRASE} at the centre of your {goal} story."
  FACULTY_PHRASE: Record<Body, string>;
  // What the planet's energy becomes when it succeeds -- pairs with
  // RAW_MATERIAL in the tagline: "{raw} can become {outcome}".
  OUTCOME: Record<Body, string>;
  // Closing-line opener: "In {city}, {OPEN_DOOR}."
  OPEN_DOOR: Record<Body, string>;
  // The reinforcing influence's own "what carries it through" quality --
  // used both in the tagline ("when it is backed by {QUALITY}") and the
  // closing line ("{QUALITY} may determine how far it leads").
  QUALITY: Record<Body, string>;
  // Weight/tension a challenging planet (Mars, Saturn, Uranus, Neptune,
  // Pluto -- CHALLENGING in combinations.ts) adds when it reinforces an
  // easeful primary, for the LAYERED-tier paragraph. Only these five
  // appear as the challenging half of a mixed pair.
  WEIGHT: Partial<Record<Body, string>>;
  FEEL_TONE_ADJECTIVE: Record<Tone, string>;
  GOAL_STORY_NOUN: Record<Goal, string>;
  // Short lowercase goal word for the City Story header's "Strongest {x}
  // match" line -- distinct from GOAL_STORY_NOUN and the shared
  // goalDisplayName(), which are full display names not built to sit
  // directly before the word "match".
  SHORT_GOAL_LABEL: Record<Goal, string>;
};

const VOICE_EN: VoiceTables = {
  RAW_MATERIAL: {
    Sun: "presence",
    Moon: "instinct",
    Mercury: "ideas",
    Venus: "charm",
    Mars: "drive",
    Jupiter: "optimism",
    Saturn: "discipline",
    Uranus: "originality",
    Neptune: "imagination",
    Pluto: "intensity"
  },
  FACULTY_PHRASE: {
    Sun: "your presence, confidence and visibility",
    Moon: "your instincts, care and emotional awareness",
    Mercury: "your voice, ideas and ability to connect",
    Venus: "your charm, taste and gift for connection",
    Mars: "your drive, initiative and willingness to act",
    Jupiter: "your optimism, growth and sense of possibility",
    Saturn: "your discipline, patience and staying power",
    Uranus: "your independence, originality and appetite for change",
    Neptune: "your imagination, empathy and intuition",
    Pluto: "your intensity, depth and capacity to transform"
  },
  OUTCOME: {
    Sun: "recognition",
    Moon: "belonging",
    Mercury: "influence",
    Venus: "connection",
    Mars: "momentum",
    Jupiter: "opportunity",
    Saturn: "achievement",
    Uranus: "reinvention",
    Neptune: "meaning",
    Pluto: "transformation"
  },
  OPEN_DOOR: {
    Sun: "your visibility may open the door",
    Moon: "your instincts may open the door",
    Mercury: "conversations may open the door",
    Venus: "connection may open the door",
    Mars: "bold action may open the door",
    Jupiter: "opportunity may open the door",
    Saturn: "consistency may open the door",
    Uranus: "a break from routine may open the door",
    Neptune: "a compelling vision may open the door",
    Pluto: "a willingness to go deep may open the door"
  },
  QUALITY: {
    Sun: "your ability to keep showing up",
    Moon: "your emotional steadiness",
    Mercury: "your ability to follow through on what you say",
    Venus: "your ability to keep things balanced",
    Mars: "your ability to manage the friction you create",
    Jupiter: "your ability to follow through on big opportunities",
    Saturn: "your ability to follow through",
    Uranus: "your comfort with unpredictability",
    Neptune: "your ability to stay grounded",
    Pluto: "your ability to handle intensity"
  },
  WEIGHT: {
    Mars: "urgency and friction",
    Saturn: "weight and responsibility",
    Uranus: "unpredictability",
    Neptune: "ambiguity",
    Pluto: "intensity"
  },
  FEEL_TONE_ADJECTIVE: {
    outward: "Energetic and visible",
    inward: "Quiet and reflective",
    relational: "Connected and relationship-focused",
    transformative: "Intense and fast-moving",
    mixed: "Emotionally attuned"
  },
  GOAL_STORY_NOUN: {
    CAREER: "professional",
    LOVE: "relationship",
    HOME: "home",
    GROWTH: "personal growth",
    OVERALL: "life"
  },
  SHORT_GOAL_LABEL: {
    CAREER: "career",
    LOVE: "love",
    HOME: "home",
    GROWTH: "growth",
    OVERALL: "overall"
  }
};

const VOICE_VI: VoiceTables = {
  RAW_MATERIAL: {
    Sun: "sự hiện diện",
    Moon: "bản năng",
    Mercury: "ý tưởng",
    Venus: "sức hút",
    Mars: "động lực",
    Jupiter: "sự lạc quan",
    Saturn: "kỷ luật",
    Uranus: "sự độc đáo",
    Neptune: "trí tưởng tượng",
    Pluto: "cường độ nội tâm"
  },
  FACULTY_PHRASE: {
    Sun: "sự hiện diện, sự tự tin và khả năng thu hút sự chú ý của bạn",
    Moon: "bản năng, sự quan tâm và sự nhạy cảm cảm xúc của bạn",
    Mercury: "tiếng nói, ý tưởng và khả năng kết nối của bạn",
    Venus: "sức hút, gu thẩm mỹ và tài kết nối của bạn",
    Mars: "động lực, sự chủ động và sự sẵn sàng hành động của bạn",
    Jupiter: "sự lạc quan, sự phát triển và cảm giác về những khả năng của bạn",
    Saturn: "kỷ luật, sự kiên nhẫn và sức bền của bạn",
    Uranus: "sự độc lập, sự độc đáo và mong muốn thay đổi của bạn",
    Neptune: "trí tưởng tượng, sự đồng cảm và trực giác của bạn",
    Pluto: "cường độ nội tâm, chiều sâu và khả năng chuyển hóa của bạn"
  },
  OUTCOME: {
    Sun: "sự công nhận",
    Moon: "sự gắn bó",
    Mercury: "tầm ảnh hưởng",
    Venus: "sự kết nối",
    Mars: "đà tiến",
    Jupiter: "cơ hội",
    Saturn: "thành tựu",
    Uranus: "sự tái tạo",
    Neptune: "ý nghĩa",
    Pluto: "sự chuyển hóa"
  },
  OPEN_DOOR: {
    Sun: "sự hiện diện của bạn có thể mở ra cánh cửa",
    Moon: "bản năng của bạn có thể mở ra cánh cửa",
    Mercury: "những cuộc trò chuyện có thể mở ra cánh cửa",
    Venus: "sự kết nối có thể mở ra cánh cửa",
    Mars: "hành động táo bạo có thể mở ra cánh cửa",
    Jupiter: "cơ hội có thể mở ra cánh cửa",
    Saturn: "sự kiên trì có thể mở ra cánh cửa",
    Uranus: "một sự thay đổi khỏi lối mòn có thể mở ra cánh cửa",
    Neptune: "một tầm nhìn đầy sức hút có thể mở ra cánh cửa",
    Pluto: "sự sẵn lòng đi sâu vào vấn đề có thể mở ra cánh cửa"
  },
  QUALITY: {
    Sun: "khả năng tiếp tục hiện diện của bạn",
    Moon: "sự vững vàng cảm xúc của bạn",
    Mercury: "khả năng giữ lời và theo đến cùng của bạn",
    Venus: "khả năng giữ mọi thứ cân bằng của bạn",
    Mars: "khả năng kiểm soát những va chạm bạn tạo ra",
    Jupiter: "khả năng theo đến cùng những cơ hội lớn của bạn",
    Saturn: "khả năng kiên trì theo đuổi đến cùng của bạn",
    Uranus: "sự thoải mái của bạn với những điều khó đoán",
    Neptune: "khả năng giữ mình vững vàng, thực tế của bạn",
    Pluto: "khả năng đối diện với cường độ mạnh mẽ của bạn"
  },
  WEIGHT: {
    Mars: "sự cấp bách và va chạm",
    Saturn: "gánh nặng và trách nhiệm",
    Uranus: "tính khó đoán",
    Neptune: "sự mơ hồ",
    Pluto: "cường độ mạnh mẽ"
  },
  FEEL_TONE_ADJECTIVE: {
    outward: "Tràn đầy năng lượng và dễ thấy",
    inward: "Tĩnh lặng và hướng nội",
    relational: "Gắn kết và thiên về các mối quan hệ",
    transformative: "Mãnh liệt và chuyển biến nhanh",
    mixed: "Nhạy cảm về mặt cảm xúc"
  },
  GOAL_STORY_NOUN: {
    CAREER: "sự nghiệp",
    LOVE: "tình cảm",
    HOME: "tổ ấm",
    GROWTH: "phát triển bản thân",
    OVERALL: "cuộc sống"
  },
  SHORT_GOAL_LABEL: {
    CAREER: "sự nghiệp",
    LOVE: "tình cảm",
    HOME: "nhà",
    GROWTH: "phát triển",
    OVERALL: "tổng thể"
  }
};

export function voiceFor(language: Language): VoiceTables {
  return language === "vi" ? VOICE_VI : VOICE_EN;
}

// "a, b and c" -- Oxford-comma-free, matching the rest of the app's list
// style (chip rows, bestFor lists).
export function joinList(items: string[], language: Language): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  const connector = language === "vi" ? " và " : " and ";
  if (items.length === 2) return `${items[0]}${connector}${items[1]}`;
  return `${items.slice(0, -1).join(", ")}${connector}${items[items.length - 1]}`;
}

export function capitalize(text: string): string {
  return text.length === 0 ? text : text.charAt(0).toUpperCase() + text.slice(1);
}
