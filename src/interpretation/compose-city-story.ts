import type { Angle, Body } from "../astro/types";
import { MODEL_VERSIONS } from "../config/versions";
import type { Language } from "../i18n/types";
import type { RankedCity } from "../scoring/types";
import { lookupSynthesis } from "./combinations";
import { confidenceExplanation, goalDisplayName, influenceLabel, starWording } from "./display";
import { getInterpretation } from "./library";
import type { CityResult, InfluenceDetail, Interpretation, TechnicalDetail } from "./types";
import { capitalize, joinList, voiceFor } from "./voice";

export type InfluenceDistance = {
  body: Body;
  angle: Angle;
  distanceKm: number;
  scenarioDistancesKm: number[];
};

function findDistance(
  distances: InfluenceDistance[],
  body: Body,
  angle: Angle
): InfluenceDistance | undefined {
  return distances.find((d) => d.body === body && d.angle === angle);
}

function shareText(cityName: string, goalName: string, stars: number, theme: string | undefined, language: Language): string {
  if (language === "vi") {
    if (stars >= 4) {
      return `Có vẻ ${cityName} là một trong những thành phố ${goalName} mạnh nhất của mình ${"★".repeat(stars)}`;
    }
    if (stars === 3 && theme) {
      return `${cityName} xuất hiện như một sự phù hợp mạnh cho ${goalName}, và lý do khá thú vị.`;
    }
    return `${cityName} xuất hiện trên bản đồ chiêm tinh của mình cho ${goalName}.`;
  }
  if (stars >= 4) {
    return `Apparently ${cityName} is one of my strongest ${goalName} cities ${"★".repeat(stars)}`;
  }
  if (stars === 3 && theme) {
    return `${cityName} showed up as a strong ${goalName} match, and the reason is interesting.`;
  }
  return `${cityName} appeared in my astro map for ${goalName}.`;
}

// A goal's domain noun for "may support {domain} built on..." (paragraph 2
// of whyItStandsOut). Distinct from GOAL_STORY_NOUN (voice.ts), which is
// an adjective-shaped noun for "your {x} story" in paragraph 1.
const GOAL_DOMAIN_NOUN: Record<Language, Record<RankedCity["goal"], string>> = {
  en: {
    CAREER: "work",
    LOVE: "relationships",
    HOME: "home life",
    GROWTH: "personal growth",
    OVERALL: "life"
  },
  vi: {
    CAREER: "công việc",
    LOVE: "các mối quan hệ",
    HOME: "đời sống gia đình",
    GROWTH: "sự phát triển bản thân",
    OVERALL: "cuộc sống"
  }
};

const WEAK_RESULT_COPY: Record<Language, { whyItStandsOut: string; howItMayFeel: string }> = {
  en: {
    whyItStandsOut:
      "Your map is more mixed for this goal. These are the locations with the clearest signals in the current model, even though none stand out as an exceptional match.",
    howItMayFeel: "Like the signal here is more mixed than clear."
  },
  vi: {
    whyItStandsOut:
      "Bản đồ của bạn khá phân tán cho mục tiêu này. Đây là những địa điểm có tín hiệu rõ ràng nhất trong mô hình hiện tại, dù không nơi nào thực sự nổi bật như một sự phù hợp đặc biệt.",
    howItMayFeel: "Như thể tín hiệu ở đây khá mơ hồ hơn là rõ ràng."
  }
};

// Composes the weak/mixed-result fallback story (05-result-content-
// framework.md §12) when no primary influence qualifies. Uses the exact
// approved copy from the screen spec rather than inventing a new claim.
function composeWeakResult(rankedCity: RankedCity, cityName: string, countryName: string, language: Language): CityResult {
  const goalName = goalDisplayName(rankedCity.goal, language);
  const copy = WEAK_RESULT_COPY[language];
  return {
    city: cityName,
    country: countryName,
    language,
    goal: rankedCity.goal,
    stars: rankedCity.stars,
    ratingLabel: rankedCity.label,
    archetypeId: rankedCity.archetypeId,
    primaryTheme: "",
    secondaryThemes: [],
    hook: starWording(rankedCity.stars, rankedCity.goal, language),
    tagline: "",
    whyItStandsOut: copy.whyItStandsOut,
    opportunities: [],
    tradeOffs: [],
    howItMayFeel: copy.howItMayFeel,
    howItMayFeelDetail: "",
    bestFor: [],
    birthTimeConfidence: rankedCity.stability,
    confidenceExplanation: confidenceExplanation(rankedCity.stability, language),
    primaryInfluence: undefined,
    secondaryInfluences: [],
    paranInfluence: undefined,
    influenceDetails: [],
    technicalDetails: [],
    shareText: shareText(cityName, goalName, rankedCity.stars, undefined, language),
    calculationVersion: MODEL_VERSIONS.calculation,
    scoringVersion: MODEL_VERSIONS.scoring,
    interpretationVersion: MODEL_VERSIONS.interpretation
  };
}

function influenceDetail(role: InfluenceDetail["role"], body: Body, angle: Angle, interp: Interpretation): InfluenceDetail {
  return { role, body, angle, description: `${capitalize(interp.coreTheme)}.` };
}

// Composes the full City Story (05-result-content-framework.md §18 schema)
// from a scored RankedCity. Only reads structured scoring/calculation
// output and the approved content library -- never recalculates astronomy
// or scoring, per CLAUDE.md §3's layer separation.
export function composeCityStory(
  rankedCity: RankedCity,
  cityName: string,
  countryName: string,
  influenceDistances: InfluenceDistance[],
  language: Language
): CityResult {
  if (!rankedCity.primaryInfluence) {
    return composeWeakResult(rankedCity, cityName, countryName, language);
  }

  const V = voiceFor(language);
  const isVi = language === "vi";

  const primary = rankedCity.primaryInfluence;
  const primaryInterp = getInterpretation(primary.body, primary.angle, language);
  const secondaryInterps = rankedCity.secondaryInfluences.map((s) => getInterpretation(s.body, s.angle, language));

  const [firstSecondary] = rankedCity.secondaryInfluences;
  // The reinforcement that actually drove the coherence tier (04 §5.1,
  // §6): a winning paran takes priority over the plain secondary list,
  // matching internal-score.ts's own `paranReinforcement ?? secondary[0]`
  // -- the narrative must be built from whichever one actually produced
  // the score, not always the plain secondary.
  const reinforcement = rankedCity.paranInfluence ?? firstSecondary;
  const reinforcementInterp = reinforcement ? getInterpretation(reinforcement.body, reinforcement.angle, language) : undefined;
  const isParan = Boolean(rankedCity.paranInfluence);

  const goal = rankedCity.goal;
  const domainNoun = GOAL_DOMAIN_NOUN[language][goal];
  const storyNoun = V.GOAL_STORY_NOUN[goal];

  // Paragraph 1: what's centred in this result, in plain personal terms
  // (2026-09-13 City Story redesign -- replaces the old opening sentence
  // that led with the technical body-angle label; that label is still
  // named explicitly in paragraph 2, preserving I001's "primary before
  // secondary" requirement without repeating the same phrasing twice).
  const paragraphs: string[] = [
    isVi
      ? `${cityName} đặt ${V.FACULTY_PHRASE[primary.body]} vào trung tâm câu chuyện ${storyNoun} của bạn.`
      : `${cityName} places ${V.FACULTY_PHRASE[primary.body]} at the centre of your ${storyNoun} story.`
  ];

  // Paragraph 2: the primary influence, named explicitly, expanded into
  // its real-world shape using the library's own opportunity list --
  // never a generic restatement of the coreTheme alone.
  paragraphs.push(
    isVi
      ? `Một ảnh hưởng ${influenceLabel(primary.body, primary.angle, language)} mạnh mẽ có thể nâng đỡ ${domainNoun} được xây trên nền tảng ${primaryInterp.coreTheme}. ${capitalize(joinList(primaryInterp.opportunity, language))} đều có thể có đà phát triển tốt ở đây.`
      : `A strong ${influenceLabel(primary.body, primary.angle, language)} influence may support ${domainNoun} built on ${primaryInterp.coreTheme}. ${capitalize(joinList(primaryInterp.opportunity, language))} could all gain momentum here.`
  );

  // Paragraph 3: the reinforcement/paran, when one exists -- a genuine
  // combination-rule synthesis (combinations.ts), not two definitions
  // concatenated (CLAUDE.md §12).
  if (reinforcement && reinforcementInterp) {
    const synthesis = lookupSynthesis(primary, reinforcement, isParan, language);
    paragraphs.push(`${synthesis.synthesis} ${synthesis.story}`);
  }

  // Closing line: a short synthesis, not a repeated summary.
  const openDoor = V.OPEN_DOOR[primary.body];
  paragraphs.push(
    reinforcement
      ? isVi
        ? `Tại ${cityName}, ${openDoor}. ${capitalize(V.QUALITY[reinforcement.body])} có thể quyết định điều đó sẽ dẫn xa đến đâu.`
        : `In ${cityName}, ${openDoor}. ${capitalize(V.QUALITY[reinforcement.body])} may determine how far it leads.`
      : isVi
        ? `Tại ${cityName}, ${openDoor}.`
        : `In ${cityName}, ${openDoor}.`
  );

  const tagline = reinforcement
    ? isVi
      ? `Một nơi mà ${V.RAW_MATERIAL[primary.body]} có thể trở thành ${V.OUTCOME[primary.body]}, khi được nâng đỡ bởi ${V.QUALITY[reinforcement.body]}.`
      : `A place where ${V.RAW_MATERIAL[primary.body]} can become ${V.OUTCOME[primary.body]}, when it is backed by ${V.QUALITY[reinforcement.body]}.`
    : isVi
      ? `Một nơi mà ${V.RAW_MATERIAL[primary.body]} có thể trở thành ${V.OUTCOME[primary.body]}.`
      : `A place where ${V.RAW_MATERIAL[primary.body]} can become ${V.OUTCOME[primary.body]}.`;

  const howItMayFeelDetail = reinforcement
    ? isVi
      ? `${V.FEEL_TONE_ADJECTIVE[primaryInterp.tone]}, cuộc sống ở đây có thể tràn đầy ${joinList(primaryInterp.opportunity.slice(0, 3), language)}. Thử thách có thể là biết chọn cơ hội nào xứng đáng với năng lượng của bạn, đặc biệt khi có thêm ${reinforcementInterp!.tradeOff[0]} trong bức tranh chung.`
      : `${V.FEEL_TONE_ADJECTIVE[primaryInterp.tone]}, life here may feel full of ${joinList(primaryInterp.opportunity.slice(0, 3), language)}. The challenge may be knowing which opportunities deserve your energy, especially with ${reinforcementInterp!.tradeOff[0]} in the mix.`
    : isVi
      ? `${V.FEEL_TONE_ADJECTIVE[primaryInterp.tone]}, cuộc sống ở đây có thể tràn đầy ${joinList(primaryInterp.opportunity.slice(0, 3), language)}.`
      : `${V.FEEL_TONE_ADJECTIVE[primaryInterp.tone]}, life here may feel full of ${joinList(primaryInterp.opportunity.slice(0, 3), language)}.`;

  const tradeOffs = [...primaryInterp.tradeOff];
  if (reinforcementInterp && !tradeOffs.includes(reinforcementInterp.tradeOff[0]!)) {
    tradeOffs.push(reinforcementInterp.tradeOff[0]!);
  }

  const influenceDetails: InfluenceDetail[] = [influenceDetail("Primary", primary.body, primary.angle, primaryInterp)];
  if (rankedCity.paranInfluence && reinforcementInterp) {
    influenceDetails.push(influenceDetail("Paran", rankedCity.paranInfluence.body, rankedCity.paranInfluence.angle, reinforcementInterp));
  }
  rankedCity.secondaryInfluences.forEach((s, i) => {
    influenceDetails.push(influenceDetail("Secondary", s.body, s.angle, secondaryInterps[i]!));
  });

  const technicalDetails: TechnicalDetail[] = [];
  const primaryDistance = findDistance(influenceDistances, primary.body, primary.angle);
  if (primaryDistance) {
    technicalDetails.push({
      line: influenceLabel(primary.body, primary.angle, language),
      distanceKm: primaryDistance.distanceKm,
      scenarioDistancesKm: primaryDistance.scenarioDistancesKm
    });
  }
  for (const secondary of rankedCity.secondaryInfluences) {
    const distance = findDistance(influenceDistances, secondary.body, secondary.angle);
    if (distance) {
      technicalDetails.push({
        line: influenceLabel(secondary.body, secondary.angle, language),
        distanceKm: distance.distanceKm,
        scenarioDistancesKm: distance.scenarioDistancesKm
      });
    }
  }

  const goalName = goalDisplayName(rankedCity.goal, language);
  const primaryTheme = primaryInterp.bestFor[0] ?? primaryInterp.coreTheme;

  const secondaryThemes = secondaryInterps.map((s) => s.bestFor[0] ?? s.coreTheme);
  if (rankedCity.paranInfluence && reinforcementInterp) {
    const paranTheme = reinforcementInterp.bestFor[0] ?? reinforcementInterp.coreTheme;
    if (!secondaryThemes.includes(paranTheme)) secondaryThemes.unshift(paranTheme);
  }

  return {
    city: cityName,
    country: countryName,
    language,
    goal: rankedCity.goal,
    stars: rankedCity.stars,
    ratingLabel: rankedCity.label,
    archetypeId: rankedCity.archetypeId,
    primaryTheme,
    secondaryThemes,
    hook: starWording(rankedCity.stars, rankedCity.goal, language),
    tagline,
    whyItStandsOut: paragraphs.join("\n\n"),
    opportunities: primaryInterp.opportunity.slice(0, 5),
    tradeOffs,
    howItMayFeel: primaryInterp.feel[0]!,
    howItMayFeelDetail,
    bestFor: primaryInterp.bestFor.slice(0, 5),
    birthTimeConfidence: rankedCity.stability,
    confidenceExplanation: confidenceExplanation(rankedCity.stability, language),
    primaryInfluence: primary,
    secondaryInfluences: rankedCity.secondaryInfluences,
    paranInfluence: rankedCity.paranInfluence,
    influenceDetails,
    technicalDetails,
    shareText: shareText(cityName, goalName, rankedCity.stars, primaryTheme, language),
    calculationVersion: MODEL_VERSIONS.calculation,
    scoringVersion: MODEL_VERSIONS.scoring,
    interpretationVersion: MODEL_VERSIONS.interpretation
  };
}
