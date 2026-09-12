import type { ScorableGoal } from "../../scoring/types";

// UI chrome copy only (page/component prose). Data-driven content tables
// that already have their own file (goalTheme.ts, discoveryLabel.ts,
// StarRating.tsx, astroExplainer.ts, archetypes.ts, and the whole
// src/interpretation/* library) carry their own Record<Language, ...>
// tables next to their English version instead of living here.
export const en = {
  home: {
    navMethodLink: "How it works",
    navHomeAriaLabel: "Astravia home",
    heroEyebrow:
      "Have you ever wondered whether the place you live truly fits you, or whether somewhere else in the world might?",
    heroH1Before: "Somewhere in the world, a place may fit you ",
    heroH1Em: "better.",
    heroLede:
      "Explore the cities connected to your birth map, and discover where career, relationships, belonging or personal growth may feel more supported.",
    areaLabel: "What would you like to explore?",
    areaGroupAriaLabel: "Choose a life area",
    goalLabels: {
      CAREER: "Career",
      LOVE: "Relationships",
      HOME: "Home & belonging",
      GROWTH: "Personal growth"
    } satisfies Record<ScorableGoal, string>,
    cta: "Find my places",
    visualAriaLabel: "Example Astravia city discovery",
    previewLabel: "EXAMPLE DISCOVERY",
    cardRanks: ["01 · TOP MATCH", "02", "03"],
    previewCities: {
      CAREER: [
        { city: "Amsterdam", copy: "Momentum, visibility and connections that move your work forward.", stars: "★★★★★" },
        { city: "Copenhagen", copy: "Steady progress with room for a more balanced rhythm.", stars: "★★★★☆" },
        { city: "Melbourne", stars: "★★★★☆" }
      ],
      LOVE: [
        { city: "Lisbon", copy: "Warmth, openness and space for meaningful connection.", stars: "★★★★★" },
        { city: "Barcelona", copy: "A vivid social rhythm that invites you outward.", stars: "★★★★☆" },
        { city: "Montréal", stars: "★★★★☆" }
      ],
      HOME: [
        { city: "Helsinki", copy: "Calm structure, nature and a stronger sense of grounding.", stars: "★★★★★" },
        { city: "Vienna", copy: "Beauty, stability and an everyday rhythm that settles.", stars: "★★★★☆" },
        { city: "Tallinn", stars: "★★★★☆" }
      ],
      GROWTH: [
        { city: "Berlin", copy: "Fresh perspectives that challenge how you see yourself.", stars: "★★★★★" },
        { city: "Porto", copy: "A softer pace that makes room for inner change.", stars: "★★★★☆" },
        { city: "Stockholm", stars: "★★★★☆" }
      ]
    } satisfies Record<ScorableGoal, { city: string; copy?: string; stars: string }[]>,
    methodologyTitle: "From your birth moment to places worth exploring.",
    methodologyBlurb:
      "Astravia translates astrocartography patterns into clear possibilities for reflection and exploration, not prediction.",
    methodologyShow: "How astrocartography works →",
    methodologyHide: "Hide how astrocartography works ↑",
    explainerIntro:
      "Imagine the exact moment you were born, looking up at the sky: each planet sits at some position relative to the horizon and the sky above you. Four points mark the most significant of these positions.",
    explainerMid:
      "Astrocartography draws one line on the world map for every planet-and-angle pair: everywhere on Earth where, at your exact birth moment, that planet sat at that exact position. Astravia traces ten planets against these four points, each carrying its own traditional theme:",
    explainerDisclaimer:
      "Astrocartography is an interpretive astrology practice, not a scientifically validated method for predicting life outcomes. Use these results for reflection and exploration alongside practical factors."
  },
  common: {
    unlockFullReport: "Unlock full report",
    backAriaLabel: "Back",
    saveAriaLabel: "Save this place",
    unsaveAriaLabel: "Remove from saved places",
    pinAriaLabel: (title: string, rank: number) => `${title}, rank ${rank}`,
    viewLabel: "View →"
  },
  paywall: {
    closeAriaLabel: "Close",
    defaultTitle: "Unlock your full report",
    pitch:
      "One small payment unlocks every place and life area for this chart, plus a downloadable PDF report you can keep.",
    bullet1: "All remaining places for every life area",
    bullet2: "Career, Love, Home, Growth, and All life areas in full",
    bullet3: "A downloadable PDF report you can keep",
    errorMsg: "Couldn't start checkout. Please try again.",
    redirecting: "Redirecting…",
    notNow: "Not now"
  },
  birthDetails: {
    stepLabel: "Step 1 of 2",
    heading: "Your birth details",
    subtitle: "Birth time matters because astrocartography lines can move noticeably within a short time.",
    dateLabel: "Date of birth",
    dateError: "Enter your date of birth.",
    timeLabel: "Time of birth",
    timeError: "Enter your birth time.",
    placeLabel: "Place of birth",
    placePlaceholder: "City, country",
    placeError: "Choose a birth place from the results.",
    continueBtn: "Continue"
  },
  confidence: {
    stepLabel: "Step 2 of 2",
    heading: "How confident are you about your birth time?",
    subtitle:
      "If you're unsure, we'll check how much your strongest locations change across that time range, so nothing is presented with more certainty than it deserves.",
    exactTitle: "Exact",
    exactDesc: "I know the time shown on my birth record.",
    rangeTitle: "Around this time",
    rangeDesc: "I'm approximating my birth time.",
    rangeOption: (r: 15 | 30 | 60) => (r === 60 ? "± 1 hour" : `± ${r} min`),
    continueBtn: "Continue"
  },
  results: {
    backLabel: "Your places",
    editDetails: "Edit details",
    tabPlaces: "Places",
    tabCountries: "Countries",
    allLifeAreasInline: "all life areas",
    headingOverallCity: "The most balanced places across all life areas",
    headingOverallCountry: "The most balanced countries across all life areas",
    headingGoalCity: (goalName: string) => `Your strongest places for ${goalName}`,
    headingGoalCountry: (goalName: string) => `Your strongest countries for ${goalName}`,
    mixedNoteBold: "Your map is more mixed for this goal.",
    mixedNoteRest: (kind: string) =>
      ` These are the ${kind} with the clearest signals, even though none are exceptionally strong in the current model.`,
    kindLocations: "locations",
    kindCountries: "countries",
    basedOnBirthDetails: "Based on the birth details and time range you entered.",
    matchStrengthOverallCity:
      "Match strength shows how strongly a place supports all four goals together. Open a place to see the breakdown.",
    matchStrengthOverallCountry:
      "Match strength shows how strongly a country supports all four goals together, based on the consistency of its strongest cities, not the country as a single point on the map.",
    matchStrengthGoalCity: (goalName: string) =>
      `Match strength shows how strongly a place fits ${goalName}. Open a place to see how much that could shift if your birth time isn't exact.`,
    matchStrengthGoalCountry: (goalName: string) =>
      `Match strength shows how strongly a country fits ${goalName} overall, based on the consistency and strength of its matching cities, not the country as a single astrological point.`,
    byLifeArea: "By life area",
    allLifeAreasTab: "All life areas",
    recalculating: "Recalculating…",
    confirmingPayment: "Confirming your payment…",
    fullReportUnlocked: "Your full report is unlocked for this chart.",
    getPdfReport: "Get your PDF report →",
    locationStoryLabel: "Your location story",
    yourTopPlaces: "Your top places",
    yourTopCountries: "Your top countries",
    heroLabelOverall: "The most balanced across all life areas",
    heroLabelGoal: (goalName: string) => `Your strongest place for ${goalName}`,
    confidence: (label: string) => `Confidence: ${label}`,
    whyCity: (cityName: string) => `Why ${cityName}? →`,
    lockedHint: "Locked. Unlock the full report to see why.",
    exploreThisPlace: "Explore this place →",
    unlockToExplore: "Unlock to explore →",
    countryResultsLocked: "Country results are part of the full report.",
    bestMatches: "Best matches"
  },
  calculating: {
    messages: [
      "Mapping your planetary lines…",
      "Comparing places around the world…",
      "Checking your birth-time range…",
      "Finding patterns that stay strong…"
    ],
    headline: "Mapping your places…",
    errorFallback: "We couldn't calculate your results.",
    tryAgain: "Try again",
    reviewBirthDetails: "Review birth details"
  },
  place: {
    stepLabel: "City story",
    notFound: "We couldn't find that result. It may have come from a different search. Head back to your places.",
    backToPlaces: "Back to your places",
    fullStoryLocked: (cityName: string) => `The full story for ${cityName} is part of the full report.`,
    birthTimePrecision: (label: string) => `Birth-time precision: ${label}`,
    whyMightFit: (cityName: string) => `Why ${cityName} might fit you`,
    whatCouldGrow: "What could grow here",
    whereItMayStretch: "Where it may stretch you",
    whatLifeMightFeel: "What life here might feel like",
    bestForHeading: "Best for",
    astrologyBehind: "The astrology behind this match",
    strongestInfluences: (cityName: string) => `These are the strongest influences shaping your ${cityName} result:`,
    influenceRole: {
      Primary: "Primary influence",
      Paran: "Paran influence",
      Secondary: "Secondary influence"
    } as Record<"Primary" | "Paran" | "Secondary", string>,
    hideAstrology: "Hide the astrology ↑",
    exploreAstrology: "Explore the astrology ↓",
    closestDistance: (km: number) => `Closest distance: ${km} km`,
    birthTimeScenarios: (list: string) => `Birth-time scenarios: ${list} km`,
    exploreAnotherPlace: "Explore another place",
    share: "Share",
    copiedAlert: (text: string) => `Copied: ${text}`,
    paywallContext: (cityName: string, countryName: string) => `See ${cityName}, ${countryName}`
  },
  report: {
    assembling: "Assembling your full report…",
    assembleError: "We couldn't assemble your report.",
    backToResults: "Back to results",
    backButton: "← Back",
    printSave: "Print / Save as PDF",
    coverEyebrow: "Your full report",
    coverTitleLine1: "Where in the world",
    coverTitleLine2: "you might thrive",
    coverSubtitle:
      "A complete look across Career, Love & Relationships, Home & Family, Personal Growth, and how they all balance together.",
    bornLabel: "Born",
    timeLabel: "Time",
    placeLabel: "Place",
    preparedOn: (date: string) => `Prepared ${date} · astravia.app`,
    introHeading: "How astrocartography works",
    introBody:
      "Imagine the exact moment you were born, looking up at the sky: each planet sits at some position relative to the horizon and the sky above you. Four points mark the most significant of these positions, and astrocartography draws a line across the world for every planet that touches one of them. Where those lines pass near a real city is where this report begins.",
    introPlanetIntro: "Astravia traces ten planets against these four points, each carrying its own traditional theme:",
    introClosing:
      "The pages that follow walk through what your own chart suggests, one life area at a time, then close with how they all balance together.",
    allLifeAreasBadge: "All life areas",
    overallTitle: "The most balanced across all life areas",
    goalTitle: (label: string) => `Your strongest places for ${label}`,
    heroOverallLabel: "The most balanced across all life areas",
    heroGoalLabel: (label: string) => `Your strongest place for ${label}`,
    confidence: (label: string) => `Confidence: ${label}`,
    whatCouldGrow: "What could grow here",
    whereItMayStretch: "Where it may stretch you",
    whatLifeMightFeel: "What life here might feel like",
    alsoStrongFor: (label: string) => `Also strong for ${label}`,
    strongestCountriesFor: (label: string) => `Your strongest countries for ${label}`,
    locationStoryLabel: "Your location story",
    closingQuote: "\"Your map is not a verdict. It is a place to begin.\"",
    closingDisclaimer:
      "Astrocartography is an interpretive astrology practice, not a scientifically validated method for predicting life outcomes. Use this report for reflection and exploration alongside practical factors. Generated by Astravia from the birth details you provided. This report is for your personal use."
  }
};

export type Dictionary = typeof en;
