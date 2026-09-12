import type { Interpretation } from "./types";

// Vietnamese counterpart of library.en.ts's 40 primary interpretation
// objects (2026-09-12 language switcher). Same body x angle coverage,
// same tone assignments -- only the display copy is translated, in
// spirit rather than word-for-word, keeping CLAUDE.md §13's reflective
// register ("có thể", "thường gắn liền với") instead of absolute claims.
export const ENTRIES_VI: Array<Omit<Interpretation, "id">> = [
  // Mặt Trời
  {
    body: "Sun",
    angle: "MC",
    archetype: "Nơi Của Sự Hiện Diện",
    coreTheme: "sự hiện diện, bản sắc nghề nghiệp, sự công nhận",
    opportunity: ["khả năng lãnh đạo", "sự tự tin trong vai trò trước công chúng", "định hướng sự nghiệp rõ ràng hơn", "xây dựng danh tiếng"],
    tradeOff: ["áp lực phải thể hiện tốt", "sự nhạy cảm với vị thế", "công việc có thể lấn át bản sắc cá nhân"],
    feel: ["Như thể việc ở lại phía sau trở nên khó khăn hơn."],
    bestFor: ["vai trò lãnh đạo", "chuyển hướng sự nghiệp", "khởi nghiệp", "công việc trước công chúng"],
    tone: "outward"
  },
  {
    body: "Sun",
    angle: "IC",
    archetype: "Nền Tảng Nội Tâm",
    coreTheme: "cội nguồn, bản sắc riêng tư, sự gắn bó",
    opportunity: ["xây dựng một nền tảng vững vàng hơn", "kết nối lại với bản thân/gia đình", "tạo dựng một mái nhà mang ý nghĩa cá nhân sâu sắc"],
    tradeOff: ["những mối bận tâm riêng tư có thể lấn át tham vọng bên ngoài", "các mối quan hệ gia đình có thể trở nên rõ nét hơn"],
    feel: ["Như thể cuộc sống hướng sự chú ý của bạn vào bên trong, để hiểu ý nghĩa thật sự của mái nhà."],
    bestFor: ["an cư", "tập trung vào gia đình", "tái thiết lập nội tâm", "xây dựng tổ ấm"],
    tone: "inward"
  },
  {
    body: "Sun",
    angle: "ASC",
    archetype: "Nơi Của Sự Định Hình Bản Thân",
    coreTheme: "bản sắc, sức sống, sự thể hiện bản thân",
    opportunity: ["sự tự tin", "một chương mới của cuộc đời", "sự hiện diện thông qua việc là chính mình", "tinh thần chủ động"],
    tradeOff: ["quá tập trung vào bản thân", "áp lực phải định hình bản thân nhanh chóng"],
    feel: ["Như thể bạn được mời gọi để chiếm nhiều không gian hơn."],
    bestFor: ["tái tạo bản thân", "thương hiệu cá nhân", "sự độc lập", "khởi đầu mới"],
    tone: "outward"
  },
  {
    body: "Sun",
    angle: "DSC",
    archetype: "Nơi Của Sự Công Nhận Qua Người Khác",
    coreTheme: "mối quan hệ đối tác, sự hiện diện thông qua các mối quan hệ",
    opportunity: ["gặp gỡ những người có ảnh hưởng", "sự hợp tác", "bản sắc rõ ràng hơn trong mối quan hệ"],
    tradeOff: ["phóng chiếu bản sắc lên đối phương", "cạnh tranh sự chú ý"],
    feel: ["Như thể người khác trở thành tấm gương phản chiếu con người bạn đang trở thành."],
    bestFor: ["hợp tác đối tác", "công việc với khách hàng", "sự cộng tác", "học hỏi qua các mối quan hệ"],
    tone: "relational"
  },
  // Mặt Trăng
  {
    body: "Moon",
    angle: "MC",
    archetype: "Nơi Của Cảm Xúc Trước Công Chúng",
    coreTheme: "sự bộc lộ cảm xúc, sự quan tâm, khả năng đáp ứng trước công chúng",
    opportunity: ["công việc tiếp xúc trực tiếp với mọi người", "kết nối cộng đồng", "những lựa chọn nghề nghiệp theo trực giác"],
    tradeOff: ["nhạy cảm với tâm trạng đám đông", "công việc và cảm xúc có thể hòa lẫn vào nhau"],
    feel: ["Như thể ra-đa cảm xúc của bạn được bật lên cao hơn trong đời sống công chúng."],
    bestFor: ["cộng đồng", "công việc chăm sóc", "kết nối với khán giả", "lãnh đạo theo trực giác"],
    tone: "mixed"
  },
  {
    body: "Moon",
    angle: "IC",
    archetype: "Nơi Của Sự Gắn Bó",
    coreTheme: "mái nhà, gia đình, cội rễ cảm xúc",
    opportunity: ["xây tổ ấm", "kết nối gia đình", "hồi phục cảm xúc", "cảm giác thuộc về"],
    tradeOff: ["hoài niệm", "các khuôn mẫu gia đình trở nên mạnh hơn", "nhạy cảm với môi trường xung quanh"],
    feel: ["Như thể mái nhà quan trọng hơn thành tựu ở nơi này."],
    bestFor: ["gia đình", "nơi an cư", "chăm sóc người khác", "sự vững vàng cảm xúc"],
    tone: "inward"
  },
  {
    body: "Moon",
    angle: "ASC",
    archetype: "Nơi Của Bản Thân Nhạy Cảm",
    coreTheme: "bản sắc cảm xúc, bản năng, sự tiếp nhận",
    opportunity: ["trực giác", "sự bộc lộ cảm xúc chân thật", "những kết nối nuôi dưỡng tâm hồn"],
    tradeOff: ["thất thường trong cảm xúc", "ranh giới cá nhân dễ bị xâm phạm", "môi trường xung quanh ảnh hưởng mạnh đến cảm giác an lành"],
    feel: ["Như thể bạn cảm nhận được nơi này trước khi kịp hiểu nó."],
    bestFor: ["thấu hiểu bản thân", "cộng đồng", "sự chăm sóc", "chiêm nghiệm sáng tạo"],
    tone: "inward"
  },
  {
    body: "Moon",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Cảm Xúc",
    coreTheme: "sự gắn kết, sự gần gũi, trao đổi cảm xúc",
    opportunity: ["mối liên kết thân mật", "những mối quan hệ nuôi dưỡng lẫn nhau", "cảm giác được thấu hiểu"],
    tradeOff: ["sự phụ thuộc", "sự phóng chiếu cảm xúc", "độ nhạy cảm trong mối quan hệ tăng cao"],
    feel: ["Như thể các mối quan hệ nhanh chóng trở nên ý nghĩa về mặt cảm xúc."],
    bestFor: ["mối quan hệ đối tác", "gắn kết gia đình", "kết nối cảm xúc"],
    tone: "relational"
  },
  // Sao Thủy
  {
    body: "Mercury",
    angle: "MC",
    archetype: "Nơi Của Sự Kết Nối",
    coreTheme: "giao tiếp, ý tưởng, mạng lưới quan hệ nghề nghiệp",
    opportunity: ["viết lách", "tư vấn", "giảng dạy", "bán hàng", "truyền thông", "công việc tri thức", "mở rộng quan hệ"],
    tradeOff: ["quá tải tinh thần", "ưu tiên bị phân tán", "luôn trong trạng thái di chuyển liên tục"],
    feel: ["Như thể những cuộc trò chuyện liên tục mở ra những cánh cửa mới."],
    bestFor: ["tư vấn", "sáng tạo nội dung", "giáo dục", "truyền thông công nghệ/kinh doanh", "mở rộng quan hệ"],
    tone: "outward"
  },
  {
    body: "Mercury",
    angle: "IC",
    archetype: "Tổ Ấm Của Sự Suy Nghĩ",
    coreTheme: "học hỏi, trò chuyện và sự dịch chuyển quanh tổ ấm",
    opportunity: ["làm việc từ xa", "học tập", "viết lách tại nhà", "một mái nhà năng động về mặt trí tuệ"],
    tradeOff: ["khó tắt hẳn công việc để nghỉ ngơi", "cảm giác bồn chồn khi ở nhà"],
    feel: ["Như thể mái nhà trở thành nơi để suy nghĩ, học hỏi và trao đổi ý tưởng."],
    bestFor: ["làm việc từ xa", "học tập", "viết lách", "lối sống linh hoạt"],
    tone: "inward"
  },
  {
    body: "Mercury",
    angle: "ASC",
    archetype: "Nơi Của Bản Thân Tò Mò",
    coreTheme: "sự tò mò, khả năng thích nghi, sự nhạy bén trong giao tiếp xã hội",
    opportunity: ["học hỏi", "ngôn ngữ", "gặp gỡ mọi người", "thử nghiệm điều mới", "sự di chuyển"],
    tradeOff: ["năng lượng bồn chồn", "sự chú ý bị phân mảnh"],
    feel: ["Như thể bạn trở nên tò mò, nói nhiều và năng động di chuyển hơn."],
    bestFor: ["học tập", "mở rộng quan hệ", "du lịch", "công việc thiên về giao tiếp"],
    tone: "outward"
  },
  {
    body: "Mercury",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Qua Trò Chuyện",
    coreTheme: "sự thương lượng, trao đổi, những mối quan hệ kích thích trí tuệ",
    opportunity: ["khách hàng", "cộng sự", "người cố vấn", "hợp đồng", "học hỏi qua người khác"],
    tradeOff: ["phân tích quá mức", "mối quan hệ mang tính giao dịch", "tranh luận thay thế cho sự gần gũi"],
    feel: ["Như thể một cuộc trò chuyện đúng lúc có thể thay đổi cả hướng đi của bạn."],
    bestFor: ["tư vấn", "hợp tác đối tác", "dịch vụ khách hàng", "học hỏi"],
    tone: "relational"
  },
  // Sao Kim
  {
    body: "Venus",
    angle: "MC",
    archetype: "Nơi Của Sự Hiện Diện Xã Hội",
    coreTheme: "sức hút, thẩm mỹ, sự hợp tác trong đời sống công chúng",
    opportunity: ["công việc sáng tạo", "sự khéo léo ngoại giao", "danh tiếng xã hội", "những mối quan hệ nghề nghiệp hỗ trợ lẫn nhau"],
    tradeOff: ["làm hài lòng người khác quá mức", "né tránh xung đột cần thiết", "ưu tiên sự thoải mái hơn tham vọng"],
    feel: ["Như thể việc được yêu mến và sự hiện diện bắt đầu củng cố lẫn nhau."],
    bestFor: ["sự nghiệp sáng tạo", "xây dựng thương hiệu", "ngành dịch vụ - lưu trú", "hợp tác đối tác", "ngoại giao"],
    tone: "outward"
  },
  {
    body: "Venus",
    angle: "IC",
    archetype: "Tổ Ấm Xinh Đẹp",
    coreTheme: "sự thoải mái, hài hòa, gắn bó và niềm vui tại nhà",
    opportunity: ["đời sống gia đình dễ chịu", "các mối quan hệ", "thẩm mỹ", "tiếp đãi khách", "an cư"],
    tradeOff: ["sự dễ dãi, thiếu động lực", "chi tiêu quá mức cho sự thoải mái", "né tránh xung đột"],
    feel: ["Như thể việc tạo dựng một cuộc sống mà bạn thực sự tận hưởng trở thành ưu tiên hàng đầu."],
    bestFor: ["tổ ấm", "gia đình", "các mối quan hệ", "phong cách sống", "ngành dịch vụ - lưu trú"],
    tone: "inward"
  },
  {
    body: "Venus",
    angle: "ASC",
    archetype: "Nơi Của Sức Hút",
    coreTheme: "sức hấp dẫn, sự tự nhiên trong giao tiếp xã hội, giá trị bản thân",
    opportunity: ["tình bạn", "hẹn hò", "sự hợp tác", "sự tự tin sáng tạo", "cuộc sống thường nhật dễ chịu"],
    tradeOff: ["tìm kiếm sự công nhận từ người khác", "nuông chiều bản thân quá mức", "né tránh những cuộc trò chuyện khó khăn"],
    feel: ["Như thể sự kết nối đến với bạn tự nhiên hơn một chút."],
    bestFor: ["các mối quan hệ", "đời sống xã hội", "bản sắc sáng tạo", "cộng đồng"],
    tone: "outward"
  },
  {
    body: "Venus",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Đối Tác",
    coreTheme: "mối quan hệ đối tác, sức hấp dẫn, sự hợp tác",
    opportunity: ["tình yêu lãng mạn", "liên minh hợp tác", "khách hàng biết hỗ trợ", "sự khéo léo ngoại giao"],
    tradeOff: ["lý tưởng hóa đối phương", "nhượng bộ quá nhiều vì sự hài hòa"],
    feel: ["Như thể các mối quan hệ dịch chuyển gần hơn vào trung tâm câu chuyện."],
    bestFor: ["tình yêu", "hợp tác đối tác", "sự cộng tác", "quan hệ khách hàng"],
    tone: "relational"
  },
  // Sao Hỏa
  {
    body: "Mars",
    angle: "MC",
    archetype: "Nơi Của Đà Tiến",
    coreTheme: "tham vọng, hành động, sự cạnh tranh trong sự nghiệp",
    opportunity: ["khởi động dự án", "dẫn dắt", "thực thi", "tạo đà tiến", "theo đuổi những mục tiêu đòi hỏi cao"],
    tradeOff: ["xung đột", "kiệt sức", "sự thiếu kiên nhẫn", "áp lực cạnh tranh"],
    feel: ["Như thể cuộc sống liên tục hỏi bạn: bạn sẽ làm gì với điều đó?"],
    bestFor: ["khởi động dự án mới", "khởi nghiệp", "lĩnh vực cạnh tranh cao", "những bước ngoặt sự nghiệp dứt khoát"],
    tone: "outward"
  },
  {
    body: "Mars",
    angle: "IC",
    archetype: "Tổ Ấm Bồn Chồn",
    coreTheme: "hành động và va chạm trong đời sống riêng tư",
    opportunity: ["cải tạo, đổi mới không gian sống", "thiết lập sự độc lập", "đối diện với những khuôn mẫu gia đình"],
    tradeOff: ["căng thẳng trong gia đình", "khó nghỉ ngơi trọn vẹn", "thiếu kiên nhẫn khi ở nhà"],
    feel: ["Như thể mái nhà trở nên sôi động hơn là chốn để nghỉ ngơi."],
    bestFor: ["tái thiết lập dứt khoát", "các dự án đòi hỏi thể chất", "sự độc lập"],
    tone: "inward"
  },
  {
    body: "Mars",
    angle: "ASC",
    archetype: "Nơi Của Lòng Can Đảm",
    coreTheme: "động lực, sự quyết đoán, năng lực hành động thể chất",
    opportunity: ["sự tự tin", "hành động", "sự độc lập", "rèn luyện thể chất", "chủ động tạo ra thay đổi"],
    tradeOff: ["sự bốc đồng", "xung đột", "kiệt sức"],
    feel: ["Như thể bạn hành động nhanh hơn và ít chấp nhận sự do dự hơn."],
    bestFor: ["tái tạo bản thân", "hành động", "khởi nghiệp", "thử thách thể chất"],
    tone: "outward"
  },
  {
    body: "Mars",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Va Chạm Và Động Lực",
    coreTheme: "những mối quan hệ tràn đầy năng lượng và tính cạnh tranh",
    opportunity: ["cộng sự năng động", "đàm phán trực tiếp", "kết nối đầy nhiệt huyết"],
    tradeOff: ["tranh cãi", "sự ganh đua", "phóng chiếu cơn giận lên đối phương"],
    feel: ["Như thể người khác khơi dậy năng lượng trong bạn, đôi khi tích cực, đôi khi không."],
    bestFor: ["đàm phán", "hợp tác mang tính cạnh tranh", "thiết lập ranh giới cá nhân"],
    tone: "relational"
  },
  // Sao Mộc
  {
    body: "Jupiter",
    angle: "MC",
    archetype: "Nơi Của Sự Mở Rộng",
    coreTheme: "sự phát triển nghề nghiệp, cơ hội, sự hiện diện",
    opportunity: ["thăng tiến", "giảng dạy", "công việc quốc tế", "vai trò lãnh đạo", "tinh thần lạc quan"],
    tradeOff: ["sự tự tin thái quá", "cam kết quá nhiều thứ cùng lúc", "cho rằng sự phát triển sẽ tự nhiên xảy ra"],
    feel: ["Như thể chân trời của những điều khả thi mở rộng ra."],
    bestFor: ["mở rộng sự nghiệp", "giáo dục", "công việc quốc tế", "vai trò lãnh đạo"],
    tone: "outward"
  },
  {
    body: "Jupiter",
    angle: "IC",
    archetype: "Tổ Ấm Rộng Mở",
    coreTheme: "mái nhà, sự phát triển của gia đình, sự gắn bó, lòng hào phóng",
    opportunity: ["cảm giác về mái nhà rộng lớn hơn", "sự hỗ trợ từ gia đình", "lòng hiếu khách", "an cư ở nước ngoài", "sự thoải mái, rộng rãi về mặt cảm xúc"],
    tradeOff: ["sự thái quá", "ôm đồm quá nhiều", "lý tưởng hóa một nơi như thể đó là \"câu trả lời\" cho mọi thứ"],
    feel: ["Như thể ở đây có nhiều không gian hơn, cả theo nghĩa đen lẫn cảm xúc."],
    bestFor: ["chuyển nơi ở", "gia đình", "xây dựng tổ ấm", "nơi an cư lâu dài"],
    tone: "inward"
  },
  {
    body: "Jupiter",
    angle: "ASC",
    archetype: "Nơi Của Khả Năng",
    coreTheme: "sự lạc quan, tự tin, tinh thần khám phá",
    opportunity: ["sự phát triển", "du lịch", "học tập", "khởi nghiệp", "bản sắc rộng mở hơn"],
    tradeOff: ["ôm đồm quá sức", "thiếu tập trung", "lạc quan nhưng không theo đến cùng"],
    feel: ["Như thể việc nói \"có\" trở nên dễ dàng hơn."],
    bestFor: ["phát triển bản thân", "giáo dục", "đời sống quốc tế", "những dự án mới"],
    tone: "outward"
  },
  {
    body: "Jupiter",
    angle: "DSC",
    archetype: "Nơi Của Những Người Hỗ Trợ",
    coreTheme: "sự phát triển thông qua mối quan hệ đối tác",
    opportunity: ["người cố vấn", "cộng sự hào phóng", "các mối quan hệ hỗ trợ", "mạng lưới quốc tế"],
    tradeOff: ["trông chờ người khác mang lại cơ hội", "hứa hẹn quá mức trong hợp tác"],
    feel: ["Như thể những người phù hợp có thể mở rộng thế giới của bạn."],
    bestFor: ["tình yêu", "sự cố vấn", "hợp tác kinh doanh", "mạng lưới quan hệ"],
    tone: "relational"
  },
  // Sao Thổ
  {
    body: "Saturn",
    angle: "MC",
    archetype: "Nơi Của Sự Xây Dựng",
    coreTheme: "trách nhiệm, cấu trúc, thành tựu dài hạn",
    opportunity: ["quyền uy", "sự tinh thông", "danh tiếng bền vững", "xây dựng sự nghiệp có kỷ luật"],
    tradeOff: ["áp lực", "sự trì hoãn", "trách nhiệm nặng nề", "sự cô đơn khi ở vị trí cao"],
    feel: ["Như thể mọi tiến bộ đều phải trả giá để đạt được, nhưng sẽ bền vững."],
    bestFor: ["sự tinh thông", "trách nhiệm cấp cao", "xây dựng tổ chức", "sự nghiệp dài hạn"],
    tone: "outward"
  },
  {
    body: "Saturn",
    angle: "IC",
    archetype: "Nơi Của Công Cuộc Xây Nền",
    coreTheme: "nghĩa vụ, ranh giới và cấu trúc trong gia đình",
    opportunity: ["tạo dựng sự ổn định", "đối diện với trách nhiệm gia đình", "xây dựng nền tảng bền vững"],
    tradeOff: ["cảm giác nặng nề", "sự cô lập", "những nghĩa vụ ràng buộc", "cảm giác thuộc về đến chậm hơn"],
    feel: ["Như thể mái nhà đòi hỏi sự cam kết trước khi mang lại sự thoải mái."],
    bestFor: ["nền tảng dài hạn", "thiết lập ranh giới", "trách nhiệm gia đình nghiêm túc"],
    tone: "inward"
  },
  {
    body: "Saturn",
    angle: "ASC",
    archetype: "Nơi Của Sự Trưởng Thành",
    coreTheme: "kỷ luật, định hình bản thân thông qua trách nhiệm",
    opportunity: ["sự kiên cường", "sự tinh thông", "ranh giới cá nhân", "sự phát triển bản thân nghiêm túc"],
    tradeOff: ["sự bó buộc", "tự phê phán bản thân", "sự cô đơn", "tiến độ chậm hơn"],
    feel: ["Như thể cuộc sống trở nên nghiêm túc hơn, và đòi hỏi bạn phải mạnh mẽ hơn."],
    bestFor: ["sự tinh thông", "kỷ luật", "sự chuyển hóa dài hạn"],
    tone: "outward"
  },
  {
    body: "Saturn",
    angle: "DSC",
    archetype: "Nơi Của Sự Cam Kết",
    coreTheme: "những mối quan hệ nghiêm túc, hợp đồng, ranh giới",
    opportunity: ["mối quan hệ đối tác bền vững", "sự hợp tác chín chắn", "tinh thần trách nhiệm"],
    tradeOff: ["những thử thách trong mối quan hệ", "khoảng cách", "nghĩa vụ ràng buộc", "sự mất cân bằng quyền lực"],
    feel: ["Như thể các mối quan hệ trở nên nghiêm túc hơn và mang nhiều hệ quả hơn."],
    bestFor: ["sự cam kết", "hợp đồng", "mối quan hệ đối tác chín chắn", "học cách thiết lập ranh giới"],
    tone: "relational"
  },
  // Sao Thiên Vương
  {
    body: "Uranus",
    angle: "MC",
    archetype: "Nơi Của Sự Đột Phá Sự Nghiệp",
    coreTheme: "sự đổi mới, độc lập, sự nghiệp phi truyền thống",
    opportunity: ["công nghệ", "thử nghiệm", "quyền tự chủ", "tái tạo sự nghiệp"],
    tradeOff: ["sự bất ổn định", "những thay đổi đột ngột", "sự chống đối quyền lực"],
    feel: ["Như thể kịch bản sự nghiệp cũ không còn phù hợp nữa."],
    bestFor: ["đổi mới sáng tạo", "khởi nghiệp startup", "công nghệ", "công việc độc lập", "chuyển hướng sự nghiệp"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "IC",
    archetype: "Nơi Của Tổ Ấm Phi Truyền Thống",
    coreTheme: "sự tự do và thay đổi trong đời sống gia đình",
    opportunity: ["lối sống mới", "cộng đồng phi truyền thống", "phá vỡ những khuôn mẫu gia đình"],
    tradeOff: ["sự bất ổn định", "khó an cư lâu dài", "những thay đổi đột ngột trong gia đình"],
    feel: ["Như thể mái nhà cần mang lại cho bạn sự tự do, chứ không chỉ là sự an toàn."],
    bestFor: ["làm mới lối sống", "cách sống phi truyền thống", "sự độc lập"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "ASC",
    archetype: "Nơi Của Sự Tái Tạo",
    coreTheme: "sự tự do, cá tính riêng, sự đổi mới bản thân mạnh mẽ",
    opportunity: ["sự chân thật với bản thân", "thử nghiệm điều mới", "cộng đồng mới", "sự độc lập"],
    tradeOff: ["sự bồn chồn", "tính khó đoán", "khó duy trì sự liên tục"],
    feel: ["Như thể bạn ngày càng không muốn sống theo kịch bản của người khác."],
    bestFor: ["tái tạo bản thân", "sự độc lập", "đổi mới sáng tạo", "bản sắc mới"],
    tone: "transformative"
  },
  {
    body: "Uranus",
    angle: "DSC",
    archetype: "Nơi Của Những Con Người Bất Ngờ",
    coreTheme: "những mối quan hệ phi truyền thống, mang tính bứt phá",
    opportunity: ["cộng sự bất ngờ", "mạng lưới đa dạng", "những mô hình quan hệ mới"],
    tradeOff: ["sự bất ổn định", "những khởi đầu/kết thúc đột ngột", "khó duy trì tính ổn định"],
    feel: ["Như thể có những người xuất hiện để lay động những định kiến của bạn."],
    bestFor: ["mạng lưới quan hệ mới", "thử nghiệm điều mới", "hợp tác phi truyền thống"],
    tone: "relational"
  },
  // Sao Hải Vương
  {
    body: "Neptune",
    angle: "MC",
    archetype: "Nơi Của Tầm Nhìn",
    coreTheme: "trí tưởng tượng, lý tưởng và sự mơ hồ trong định hướng nghề nghiệp",
    opportunity: ["công việc sáng tạo/tâm linh", "sự phụng sự đầy lòng trắc ẩn", "định hướng giàu tầm nhìn"],
    tradeOff: ["ranh giới nghề nghiệp không rõ ràng", "sự lý tưởng hóa", "sự mơ hồ về vị thế hay định hướng"],
    feel: ["Như thể sự nghiệp trở nên truyền cảm hứng hơn, nhưng cũng khó định nghĩa hơn."],
    bestFor: ["công việc sáng tạo", "sự phụng sự", "chiêm nghiệm", "những dự án dẫn dắt bởi tầm nhìn"],
    tone: "outward"
  },
  {
    body: "Neptune",
    angle: "IC",
    archetype: "Nơi Của Tổ Ấm Như Mơ",
    coreTheme: "sự nhạy cảm, sự lui về ẩn dật, trí tưởng tượng tại nhà",
    opportunity: ["chốn nương náu", "sự sáng tạo", "chiêm nghiệm tâm linh", "kết nối gia đình đầy lòng trắc ẩn"],
    tradeOff: ["ranh giới gia đình mờ nhạt", "xu hướng trốn chạy thực tại", "lý tưởng hóa mái nhà"],
    feel: ["Như thể mái nhà có thể trở thành chốn nương náu, nơi thực tại trở nên nhẹ nhàng hơn."],
    bestFor: ["lui về ẩn dật", "sự sáng tạo", "thực hành tâm linh", "nghỉ ngơi cùng ranh giới rõ ràng"],
    tone: "inward"
  },
  {
    body: "Neptune",
    angle: "ASC",
    archetype: "Nơi Của Bản Sắc Linh Hoạt",
    coreTheme: "sự nhạy cảm, trí tưởng tượng, bản sắc dễ hòa lẫn",
    opportunity: ["trực giác", "nghệ thuật", "lòng trắc ẩn", "khám phá tâm linh"],
    tradeOff: ["ranh giới không rõ ràng", "sự phóng chiếu cảm xúc", "sự bất định", "dễ bị hiểu lầm"],
    feel: ["Như thể ranh giới của con người bạn trở nên mềm mại hơn."],
    bestFor: ["sự sáng tạo", "chiêm nghiệm", "sự phát triển tâm linh", "công việc đầy lòng trắc ẩn"],
    tone: "inward"
  },
  {
    body: "Neptune",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Lý Tưởng Hóa",
    coreTheme: "sự phóng chiếu lãng mạn/tâm linh trong các mối quan hệ",
    opportunity: ["sự đồng cảm", "kết nối sâu sắc về tâm hồn", "hợp tác nghệ thuật"],
    tradeOff: ["sự lý tưởng hóa", "xu hướng muốn \"cứu vớt\" đối phương", "những thỏa thuận không rõ ràng", "sự thất vọng"],
    feel: ["Như thể các mối quan hệ có thể cảm thấy ý nghĩa trước khi được thấu hiểu trọn vẹn."],
    bestFor: ["hợp tác sáng tạo", "lòng trắc ẩn", "kết nối tâm linh có ranh giới rõ ràng"],
    tone: "relational"
  },
  // Sao Diêm Vương
  {
    body: "Pluto",
    angle: "MC",
    archetype: "Nơi Của Quyền Lực Và Sự Chuyển Hóa",
    coreTheme: "sự chuyển hóa sự nghiệp, tầm ảnh hưởng, các động lực quyền lực",
    opportunity: ["sự tái tạo sâu sắc", "quyền lực mang tính chiến lược", "công việc có mức độ rủi ro cao", "sức ảnh hưởng"],
    tradeOff: ["những cuộc đấu tranh quyền kiểm soát", "cường độ mạnh mẽ", "sự ám ảnh", "những kết thúc trước khi có khởi đầu mới"],
    feel: ["Như thể đời sống nghề nghiệp của bạn không thể chỉ dừng lại ở bề mặt."],
    bestFor: ["sự chuyển hóa", "lãnh đạo dưới áp lực", "công việc mang tính chiến lược", "bước ngoặt lớn trong sự nghiệp"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "IC",
    archetype: "Nơi Của Cội Rễ Sâu Sắc",
    coreTheme: "sự chuyển hóa sâu sắc trong đời sống riêng tư/gia đình",
    opportunity: ["chữa lành những khuôn mẫu cũ", "tái xây dựng nền tảng", "chiều sâu tâm lý"],
    tradeOff: ["những vấn đề gia đình mang tính căng thẳng cao", "vấn đề kiểm soát", "những kết thúc khó khăn"],
    feel: ["Như thể nơi này chạm đến tầng sâu bên dưới ý nghĩa thật sự của \"mái nhà\"."],
    bestFor: ["công việc nội tâm sâu sắc", "tái xây dựng nền tảng cuộc sống", "một khoảng lui về mang tính chuyển hóa"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "ASC",
    archetype: "Nơi Của Sự Chuyển Hóa Cá Nhân",
    coreTheme: "cường độ mạnh mẽ, quyền lực, sự tái sinh bản sắc",
    opportunity: ["lòng can đảm", "sức hút mạnh mẽ", "sự trung thực triệt để với bản thân", "sự tái tạo bản thân"],
    tradeOff: ["những cuộc đấu tranh quyền lực", "sự ám ảnh", "cường độ mạnh mẽ", "xu hướng hành xử \"được ăn cả, ngã về không\""],
    feel: ["Như thể phiên bản cũ của bạn khó có thể tồn tại nguyên vẹn qua giai đoạn này."],
    bestFor: ["sự tái tạo bản thân sâu sắc", "vai trò lãnh đạo", "sự phát triển tâm lý"],
    tone: "transformative"
  },
  {
    body: "Pluto",
    angle: "DSC",
    archetype: "Nơi Của Mối Quan Hệ Chuyển Hóa",
    coreTheme: "những mối quan hệ mãnh liệt và các động lực quyền lực",
    opportunity: ["những mối quan hệ đối tác sâu sắc", "công việc đối diện với phần khuất tối nội tâm", "sự hợp tác mang tính bứt phá"],
    tradeOff: ["sự kiểm soát", "sự ám ảnh", "sự thao túng", "những cuộc chia ly khó khăn"],
    feel: ["Như thể các mối quan hệ trở thành chất xúc tác thay vì chỉ là bối cảnh."],
    bestFor: ["công việc quan hệ sâu sắc", "hợp tác có mức độ đặt cược cao", "sự chuyển hóa"],
    tone: "relational"
  }
];
