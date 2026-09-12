// Shared "how astrocartography works" content -- used by the landing
// page's collapsible explainer and the full PDF report's introduction
// page, so the two stay in sync instead of drifting copies.

import type { Language } from "../../i18n/types";

export type PlanetEntry = { symbol: string; name: string; theme: string };
export type AngleEntry = { id: string; fullName: string; position: string; meaning: string };

const PLANETS_EN: PlanetEntry[] = [
  { symbol: "☉", name: "Sun", theme: "identity, vitality, recognition" },
  { symbol: "☽", name: "Moon", theme: "emotional life, instinct, care" },
  { symbol: "☿", name: "Mercury", theme: "communication, ideas, curiosity" },
  { symbol: "♀", name: "Venus", theme: "attraction, harmony, connection" },
  { symbol: "♂", name: "Mars", theme: "drive, action, assertiveness" },
  { symbol: "♃", name: "Jupiter", theme: "growth, opportunity, optimism" },
  { symbol: "♄", name: "Saturn", theme: "responsibility, structure, discipline" },
  { symbol: "♅", name: "Uranus", theme: "independence, change, innovation" },
  { symbol: "♆", name: "Neptune", theme: "imagination, sensitivity, ideals" },
  { symbol: "♇", name: "Pluto", theme: "transformation, intensity, power" }
];

const PLANETS_VI: PlanetEntry[] = [
  { symbol: "☉", name: "Mặt Trời", theme: "bản sắc, sức sống, sự công nhận" },
  { symbol: "☽", name: "Mặt Trăng", theme: "đời sống cảm xúc, bản năng, sự chăm sóc" },
  { symbol: "☿", name: "Sao Thủy", theme: "giao tiếp, ý tưởng, sự tò mò" },
  { symbol: "♀", name: "Sao Kim", theme: "sự thu hút, hài hòa, kết nối" },
  { symbol: "♂", name: "Sao Hỏa", theme: "động lực, hành động, sự quyết đoán" },
  { symbol: "♃", name: "Sao Mộc", theme: "phát triển, cơ hội, sự lạc quan" },
  { symbol: "♄", name: "Sao Thổ", theme: "trách nhiệm, cấu trúc, kỷ luật" },
  { symbol: "♅", name: "Sao Thiên Vương", theme: "sự độc lập, thay đổi, đổi mới" },
  { symbol: "♆", name: "Sao Hải Vương", theme: "trí tưởng tượng, sự nhạy cảm, lý tưởng" },
  { symbol: "♇", name: "Sao Diêm Vương", theme: "sự chuyển hóa, cường độ, sức mạnh" }
];

const ANGLES_EN: AngleEntry[] = [
  {
    id: "MC",
    fullName: "Medium Coeli",
    position: "The highest point in the sky, directly overhead.",
    meaning: "Career, reputation, and public life"
  },
  {
    id: "IC",
    fullName: "Imum Coeli",
    position: "The point opposite MC, directly underfoot.",
    meaning: "Home, roots, and private life"
  },
  {
    id: "ASC",
    fullName: "Ascendant",
    position: "The eastern horizon, where a planet is rising.",
    meaning: "Identity, and how you show up in the world"
  },
  {
    id: "DSC",
    fullName: "Descendant",
    position: "The western horizon, where a planet is setting.",
    meaning: "Relationships, and the people around you"
  }
];

const ANGLES_VI: AngleEntry[] = [
  {
    id: "MC",
    fullName: "Thiên Đỉnh",
    position: "Điểm cao nhất trên bầu trời, ngay phía trên đầu bạn.",
    meaning: "Sự nghiệp, danh tiếng và đời sống nơi công chúng"
  },
  {
    id: "IC",
    fullName: "Thiên Để",
    position: "Điểm đối diện với MC, ngay dưới chân bạn.",
    meaning: "Nhà cửa, cội nguồn và đời sống riêng tư"
  },
  {
    id: "ASC",
    fullName: "Điểm Mọc",
    position: "Đường chân trời phía đông, nơi một hành tinh đang mọc lên.",
    meaning: "Bản sắc cá nhân, và cách bạn thể hiện mình với thế giới"
  },
  {
    id: "DSC",
    fullName: "Điểm Lặn",
    position: "Đường chân trời phía tây, nơi một hành tinh đang lặn xuống.",
    meaning: "Các mối quan hệ, và những người xung quanh bạn"
  }
];

export function planetsFor(language: Language): PlanetEntry[] {
  return language === "vi" ? PLANETS_VI : PLANETS_EN;
}

export function anglesFor(language: Language): AngleEntry[] {
  return language === "vi" ? ANGLES_VI : ANGLES_EN;
}
