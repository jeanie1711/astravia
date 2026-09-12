import type { Language } from "../i18n/types";
import type { ArchetypeId } from "../scoring/archetype";

// Display copy for the 12 narrative archetype categories
// (06-interpretation-library.md §4 / 05-result-content-framework.md §9).
// "Archetypes are editorial summaries, not astrological entities... useful
// for content composition" -- these are short, generic labels, not
// per-influence prose (that lives in library.ts's 40 entries).
export type ArchetypeCopy = {
  name: string;
  description: string;
};

const ARCHETYPE_COPY: Record<Language, Record<ArchetypeId, ArchetypeCopy>> = {
  en: {
    VISIBILITY: { name: "The Visibility Place", description: "Public identity and professional direction come into focus." },
    EXPANSION: { name: "The Expansion Place", description: "Opportunity and growth are the dominant theme." },
    CONNECTION: { name: "The Connection Place", description: "Attraction, social ease and collaboration stand out." },
    BELONGING: { name: "The Belonging Place", description: "Home, roots and emotional grounding are central." },
    CONNECTOR: { name: "The Connector Place", description: "Communication, ideas and networks are emphasised." },
    MOMENTUM: { name: "The Momentum Place", description: "Ambition and decisive action are foregrounded." },
    BUILDER: { name: "The Builder Place", description: "Structure, responsibility and long-term achievement lead the story." },
    REINVENTION: { name: "The Reinvention Place", description: "Independence and a radical self-update are emphasised." },
    VISION: { name: "The Vision Place", description: "Imagination and ideals shape the story, with more ambiguity." },
    TRANSFORMATION: { name: "The Transformation Place", description: "Deep change and power dynamics are foregrounded." },
    LAYERED: { name: "The Layered Place", description: "A strong supportive signal sits alongside a strong tension signal." },
    BALANCED: { name: "The Balanced Place", description: "Meaningful support appears across several life themes rather than one dominant line." },
    UNCLASSIFIED: { name: "The Emerging Place", description: "No single influence dominates the story here." }
  },
  vi: {
    VISIBILITY: { name: "Nơi Của Sự Hiện Diện", description: "Bản sắc trước công chúng và định hướng nghề nghiệp trở nên rõ ràng hơn." },
    EXPANSION: { name: "Nơi Của Sự Mở Rộng", description: "Cơ hội và sự phát triển là chủ đề nổi bật." },
    CONNECTION: { name: "Nơi Của Sự Kết Nối", description: "Sức hút, sự dễ hòa nhập xã hội và tinh thần hợp tác nổi bật." },
    BELONGING: { name: "Nơi Của Sự Gắn Bó", description: "Nhà cửa, cội nguồn và sự vững vàng cảm xúc là trọng tâm." },
    CONNECTOR: { name: "Nơi Của Sự Giao Tiếp", description: "Giao tiếp, ý tưởng và các mối quan hệ được nhấn mạnh." },
    MOMENTUM: { name: "Nơi Của Đà Tiến", description: "Tham vọng và hành động quyết đoán được đưa lên hàng đầu." },
    BUILDER: { name: "Nơi Của Sự Xây Dựng", description: "Cấu trúc, trách nhiệm và thành tựu dài hạn dẫn dắt câu chuyện." },
    REINVENTION: { name: "Nơi Của Sự Tái Tạo", description: "Sự độc lập và một bước chuyển mình mạnh mẽ được nhấn mạnh." },
    VISION: { name: "Nơi Của Tầm Nhìn", description: "Trí tưởng tượng và lý tưởng định hình câu chuyện, với nhiều điều còn mơ hồ." },
    TRANSFORMATION: { name: "Nơi Của Sự Chuyển Hóa", description: "Sự thay đổi sâu sắc và những biến động quyền lực được đưa lên hàng đầu." },
    LAYERED: { name: "Nơi Đan Xen", description: "Một tín hiệu nâng đỡ mạnh mẽ song hành cùng một tín hiệu căng thẳng mạnh mẽ." },
    BALANCED: { name: "Nơi Cân Bằng", description: "Sự nâng đỡ có ý nghĩa xuất hiện ở nhiều chủ đề cuộc sống, thay vì chỉ tập trung vào một hướng nổi bật." },
    UNCLASSIFIED: { name: "Nơi Đang Định Hình", description: "Không có ảnh hưởng nào chiếm ưu thế rõ rệt trong câu chuyện ở đây." }
  }
};

export function getArchetypeCopy(archetypeId: string, language: Language): ArchetypeCopy {
  const table = ARCHETYPE_COPY[language];
  return table[archetypeId as ArchetypeId] ?? table.UNCLASSIFIED;
}
