import type { Dictionary } from "./en";

export const vi: Dictionary = {
  home: {
    navMethodLink: "Cách hoạt động",
    navHomeAriaLabel: "Trang chủ Astravia",
    heroEyebrow:
      "Bạn đã bao giờ tự hỏi liệu nơi mình đang sống có thực sự phù hợp với mình, hay một nơi khác trên thế giới có thể phù hợp hơn?",
    heroH1Before: "Ở đâu đó trên thế giới, có thể có một nơi phù hợp với bạn ",
    heroH1Em: "hơn.",
    heroLede:
      "Khám phá những thành phố gắn với bản đồ sinh của bạn, và tìm ra nơi sự nghiệp, tình cảm, sự gắn bó hay phát triển bản thân có thể được nâng đỡ nhiều hơn.",
    areaLabel: "Bạn muốn khám phá điều gì?",
    areaGroupAriaLabel: "Chọn một lĩnh vực cuộc sống",
    goalLabels: {
      CAREER: "Sự nghiệp",
      LOVE: "Tình cảm",
      HOME: "Nhà & sự gắn bó",
      GROWTH: "Phát triển bản thân"
    },
    cta: "Tìm nơi phù hợp với tôi",
    visualAriaLabel: "Ví dụ khám phá thành phố của Astravia",
    previewLabel: "VÍ DỤ MINH HỌA",
    cardRanks: ["01 · PHÙ HỢP NHẤT", "02", "03"],
    previewCities: {
      CAREER: [
        { city: "Amsterdam", copy: "Đà tiến, sự hiện diện và những kết nối giúp công việc của bạn tiến xa hơn.", stars: "★★★★★" },
        { city: "Copenhagen", copy: "Tiến triển ổn định, có không gian cho một nhịp sống cân bằng hơn.", stars: "★★★★☆" },
        { city: "Melbourne", stars: "★★★★☆" }
      ],
      LOVE: [
        { city: "Lisbon", copy: "Sự ấm áp, cởi mở và không gian cho những kết nối ý nghĩa.", stars: "★★★★★" },
        { city: "Barcelona", copy: "Nhịp sống xã hội sôi động mời gọi bạn bước ra ngoài.", stars: "★★★★☆" },
        { city: "Montréal", stars: "★★★★☆" }
      ],
      HOME: [
        { city: "Helsinki", copy: "Cấu trúc bình yên, thiên nhiên và cảm giác vững vàng hơn.", stars: "★★★★★" },
        { city: "Vienna", copy: "Vẻ đẹp, sự ổn định và một nhịp sống thường nhật lắng đọng.", stars: "★★★★☆" },
        { city: "Tallinn", stars: "★★★★☆" }
      ],
      GROWTH: [
        { city: "Berlin", copy: "Những góc nhìn mới thách thức cách bạn nhìn nhận bản thân.", stars: "★★★★★" },
        { city: "Porto", copy: "Một nhịp sống chậm hơn, tạo không gian cho sự thay đổi nội tâm.", stars: "★★★★☆" },
        { city: "Stockholm", stars: "★★★★☆" }
      ]
    },
    methodologyTitle: "Từ khoảnh khắc bạn chào đời đến những nơi đáng khám phá.",
    methodologyBlurb:
      "Astravia chuyển hóa các mô hình bản đồ sao (astrocartography) thành những khả năng rõ ràng để chiêm nghiệm và khám phá, không phải để tiên đoán.",
    methodologyShow: "Astrocartography hoạt động như thế nào →",
    methodologyHide: "Ẩn phần giải thích astrocartography ↑",
    explainerIntro:
      "Hãy hình dung đúng khoảnh khắc bạn chào đời, khi nhìn lên bầu trời: mỗi hành tinh nằm ở một vị trí nào đó so với đường chân trời và bầu trời phía trên bạn. Bốn điểm đánh dấu những vị trí quan trọng nhất trong số đó.",
    explainerMid:
      "Astrocartography vẽ một đường trên bản đồ thế giới cho mỗi cặp hành tinh-góc chiếu: đó là mọi nơi trên Trái Đất mà, vào đúng khoảnh khắc bạn chào đời, hành tinh đó nằm ở đúng vị trí ấy. Astravia theo dõi mười hành tinh ứng với bốn điểm này, mỗi hành tinh mang một chủ đề truyền thống riêng:",
    explainerDisclaimer:
      "Astrocartography là một thực hành chiêm tinh mang tính diễn giải, không phải một phương pháp được khoa học kiểm chứng để dự đoán kết quả cuộc sống. Hãy dùng những kết quả này để chiêm nghiệm và khám phá, song song với các yếu tố thực tế khác."
  },
  common: {
    unlockFullReport: "Mở khóa báo cáo đầy đủ",
    backAriaLabel: "Quay lại",
    saveAriaLabel: "Lưu nơi này",
    unsaveAriaLabel: "Bỏ lưu khỏi danh sách",
    pinAriaLabel: (title, rank) => `${title}, hạng ${rank}`,
    viewLabel: "Xem →"
  },
  paywall: {
    closeAriaLabel: "Đóng",
    defaultTitle: "Mở khóa báo cáo đầy đủ của bạn",
    pitch:
      "Chỉ với một khoản thanh toán nhỏ, bạn mở khóa mọi địa điểm và lĩnh vực cuộc sống cho bản đồ này, cùng một báo cáo PDF có thể tải về và giữ lại.",
    bullet1: "Toàn bộ những địa điểm còn lại cho mọi lĩnh vực cuộc sống",
    bullet2: "Sự nghiệp, Tình cảm, Nhà cửa, Phát triển bản thân, và Tất cả lĩnh vực đầy đủ",
    bullet3: "Một báo cáo PDF có thể tải về và giữ lại",
    errorMsg: "Không thể bắt đầu thanh toán. Vui lòng thử lại.",
    redirecting: "Đang chuyển hướng…",
    notNow: "Để sau"
  },
  birthDetails: {
    stepLabel: "Bước 1/2",
    heading: "Thông tin sinh của bạn",
    subtitle: "Giờ sinh quan trọng vì các đường astrocartography có thể dịch chuyển đáng kể chỉ trong một khoảng thời gian ngắn.",
    dateLabel: "Ngày sinh",
    dateError: "Vui lòng nhập ngày sinh của bạn.",
    timeLabel: "Giờ sinh",
    timeError: "Vui lòng nhập giờ sinh của bạn.",
    placeLabel: "Nơi sinh",
    placePlaceholder: "Thành phố, quốc gia",
    placeError: "Vui lòng chọn nơi sinh từ danh sách kết quả.",
    continueBtn: "Tiếp tục"
  },
  confidence: {
    stepLabel: "Bước 2/2",
    heading: "Bạn tự tin đến mức nào về giờ sinh của mình?",
    subtitle:
      "Nếu bạn không chắc chắn, chúng tôi sẽ kiểm tra mức độ thay đổi của những nơi phù hợp nhất trong khoảng thời gian đó, để không có kết quả nào được trình bày với độ chắc chắn cao hơn thực tế.",
    exactTitle: "Chính xác",
    exactDesc: "Tôi biết giờ sinh được ghi trong giấy khai sinh của mình.",
    rangeTitle: "Khoảng thời gian này",
    rangeDesc: "Tôi chỉ ước lượng giờ sinh của mình.",
    rangeOption: (r) => (r === 60 ? "± 1 giờ" : `± ${r} phút`),
    continueBtn: "Tiếp tục"
  },
  results: {
    backLabel: "Các nơi của bạn",
    editDetails: "Chỉnh sửa thông tin",
    tabPlaces: "Thành phố",
    tabCountries: "Quốc gia",
    allLifeAreasInline: "tất cả các lĩnh vực cuộc sống",
    headingOverallCity: "Những nơi cân bằng nhất trên mọi lĩnh vực cuộc sống",
    headingOverallCountry: "Những quốc gia cân bằng nhất trên mọi lĩnh vực cuộc sống",
    headingGoalCity: (goalName) => `Những nơi phù hợp nhất với bạn cho ${goalName}`,
    headingGoalCountry: (goalName) => `Những quốc gia phù hợp nhất với bạn cho ${goalName}`,
    mixedNoteBold: "Bản đồ của bạn khá phân tán cho mục tiêu này.",
    mixedNoteRest: (kind) =>
      ` Đây là những ${kind} có tín hiệu rõ ràng nhất, dù không nơi nào thực sự nổi bật trong mô hình hiện tại.`,
    kindLocations: "địa điểm",
    kindCountries: "quốc gia",
    basedOnBirthDetails: "Dựa trên thông tin sinh và khoảng thời gian bạn đã nhập.",
    matchStrengthOverallCity:
      "Mức độ phù hợp cho thấy một nơi hỗ trợ tốt như thế nào cho cả bốn mục tiêu cùng lúc. Mở một địa điểm để xem chi tiết.",
    matchStrengthOverallCountry:
      "Mức độ phù hợp cho thấy một quốc gia hỗ trợ tốt như thế nào cho cả bốn mục tiêu cùng lúc, dựa trên độ đồng đều của những thành phố mạnh nhất của quốc gia đó, chứ không phải quốc gia như một điểm chiêm tinh duy nhất.",
    matchStrengthGoalCity: (goalName) =>
      `Mức độ phù hợp cho thấy một nơi phù hợp ra sao với ${goalName}. Mở một địa điểm để xem mức độ này có thể thay đổi bao nhiêu nếu giờ sinh của bạn không chính xác.`,
    matchStrengthGoalCountry: (goalName) =>
      `Mức độ phù hợp cho thấy một quốc gia phù hợp ra sao với ${goalName} nói chung, dựa trên độ đồng đều và sức mạnh của những thành phố phù hợp trong quốc gia đó, chứ không phải quốc gia như một điểm chiêm tinh duy nhất.`,
    byLifeArea: "Theo lĩnh vực cuộc sống",
    allLifeAreasTab: "Tất cả lĩnh vực",
    recalculating: "Đang tính toán lại…",
    confirmingPayment: "Đang xác nhận thanh toán…",
    fullReportUnlocked: "Báo cáo đầy đủ đã được mở khóa cho bản đồ này.",
    getPdfReport: "Nhận báo cáo PDF →",
    locationStoryLabel: "Câu chuyện địa điểm của bạn",
    yourTopPlaces: "Những nơi hàng đầu của bạn",
    yourTopCountries: "Những quốc gia hàng đầu của bạn",
    heroLabelOverall: "Cân bằng nhất trên mọi lĩnh vực cuộc sống",
    heroLabelGoal: (goalName) => `Nơi phù hợp nhất của bạn cho ${goalName}`,
    confidence: (label) => `Độ tin cậy: ${label}`,
    whyCity: (cityName) => `Vì sao ${cityName}? →`,
    lockedHint: "Đã khóa. Mở khóa báo cáo đầy đủ để xem lý do.",
    exploreThisPlace: "Khám phá nơi này →",
    unlockToExplore: "Mở khóa để khám phá →",
    countryResultsLocked: "Kết quả theo quốc gia là một phần của báo cáo đầy đủ.",
    bestMatches: "Phù hợp nhất"
  },
  calculating: {
    messages: [
      "Đang lập bản đồ các đường hành tinh…",
      "Đang so sánh các nơi trên khắp thế giới…",
      "Đang kiểm tra khoảng giờ sinh của bạn…",
      "Đang tìm những mô hình duy trì ổn định…"
    ],
    headline: "Đang lập bản đồ những nơi phù hợp với bạn…",
    errorFallback: "Chúng tôi không thể tính toán kết quả của bạn.",
    tryAgain: "Thử lại",
    reviewBirthDetails: "Xem lại thông tin sinh"
  },
  place: {
    stepLabel: "Câu chuyện thành phố",
    notFound: "Chúng tôi không tìm thấy kết quả đó. Có thể nó đến từ một lượt tìm kiếm khác. Hãy quay lại danh sách nơi của bạn.",
    backToPlaces: "Quay lại danh sách nơi của bạn",
    fullStoryLocked: (cityName) => `Câu chuyện đầy đủ về ${cityName} là một phần của báo cáo đầy đủ.`,
    birthTimePrecision: (label) => `Độ chính xác giờ sinh: ${label}`,
    whyMightFit: (cityName) => `Vì sao ${cityName} có thể phù hợp với bạn`,
    whatCouldGrow: "Những gì có thể phát triển ở đây",
    whereItMayStretch: "Những gì có thể thử thách bạn",
    whatLifeMightFeel: "Cuộc sống ở đây có thể cảm thấy như thế nào",
    bestForHeading: "Phù hợp nhất cho",
    astrologyBehind: "Chiêm tinh học đằng sau sự phù hợp này",
    strongestInfluences: (cityName) => `Đây là những ảnh hưởng mạnh nhất định hình kết quả ${cityName} của bạn:`,
    influenceRole: {
      Primary: "Ảnh hưởng chính",
      Paran: "Ảnh hưởng paran",
      Secondary: "Ảnh hưởng phụ"
    },
    hideAstrology: "Ẩn phần chiêm tinh ↑",
    exploreAstrology: "Khám phá phần chiêm tinh ↓",
    closestDistance: (km) => `Khoảng cách gần nhất: ${km} km`,
    birthTimeScenarios: (list) => `Các kịch bản giờ sinh: ${list} km`,
    exploreAnotherPlace: "Khám phá nơi khác",
    share: "Chia sẻ",
    copiedAlert: (text) => `Đã sao chép: ${text}`,
    paywallContext: (cityName, countryName) => `Xem ${cityName}, ${countryName}`
  },
  report: {
    assembling: "Đang tổng hợp báo cáo đầy đủ của bạn…",
    assembleError: "Chúng tôi không thể tổng hợp báo cáo của bạn.",
    backToResults: "Quay lại kết quả",
    backButton: "← Quay lại",
    printSave: "In / Lưu dưới dạng PDF",
    coverEyebrow: "Báo cáo đầy đủ của bạn",
    coverTitleLine1: "Nơi nào trên thế giới",
    coverTitleLine2: "có thể giúp bạn phát triển",
    coverSubtitle:
      "Một cái nhìn toàn diện về Sự nghiệp, Tình cảm & Các mối quan hệ, Nhà cửa & Gia đình, Phát triển bản thân, và cách chúng cân bằng với nhau.",
    bornLabel: "Sinh",
    timeLabel: "Giờ",
    placeLabel: "Nơi sinh",
    preparedOn: (date) => `Chuẩn bị vào ${date} · astravia.app`,
    introHeading: "Astrocartography hoạt động như thế nào",
    introBody:
      "Hãy hình dung đúng khoảnh khắc bạn chào đời, khi nhìn lên bầu trời: mỗi hành tinh nằm ở một vị trí nào đó so với đường chân trời và bầu trời phía trên bạn. Bốn điểm đánh dấu những vị trí quan trọng nhất trong số đó, và astrocartography vẽ một đường trên khắp thế giới cho mỗi hành tinh chạm đến một trong các điểm ấy. Nơi những đường này đi qua gần một thành phố thực tế chính là nơi báo cáo này bắt đầu.",
    introPlanetIntro: "Astravia theo dõi mười hành tinh ứng với bốn điểm này, mỗi hành tinh mang một chủ đề truyền thống riêng:",
    introClosing:
      "Những trang tiếp theo sẽ đi qua những gì bản đồ của riêng bạn gợi ý, từng lĩnh vực cuộc sống một, rồi khép lại bằng cách chúng cân bằng với nhau.",
    allLifeAreasBadge: "Tất cả lĩnh vực",
    overallTitle: "Cân bằng nhất trên mọi lĩnh vực cuộc sống",
    goalTitle: (label) => `Những nơi phù hợp nhất với bạn cho ${label}`,
    heroOverallLabel: "Cân bằng nhất trên mọi lĩnh vực cuộc sống",
    heroGoalLabel: (label) => `Nơi phù hợp nhất của bạn cho ${label}`,
    confidence: (label) => `Độ tin cậy: ${label}`,
    whatCouldGrow: "Những gì có thể phát triển ở đây",
    whereItMayStretch: "Những gì có thể thử thách bạn",
    whatLifeMightFeel: "Cuộc sống ở đây có thể cảm thấy như thế nào",
    alsoStrongFor: (label) => `Cũng rất phù hợp cho ${label}`,
    strongestCountriesFor: (label) => `Những quốc gia phù hợp nhất với bạn cho ${label}`,
    locationStoryLabel: "Câu chuyện địa điểm của bạn",
    closingQuote: "\"Bản đồ của bạn không phải là một phán quyết. Nó là nơi để bắt đầu.\"",
    closingDisclaimer:
      "Astrocartography là một thực hành chiêm tinh mang tính diễn giải, không phải một phương pháp được khoa học kiểm chứng để dự đoán kết quả cuộc sống. Hãy dùng báo cáo này để chiêm nghiệm và khám phá, song song với các yếu tố thực tế khác. Được tạo bởi Astravia từ thông tin sinh mà bạn đã cung cấp. Báo cáo này dành cho mục đích sử dụng cá nhân của bạn."
  }
};
