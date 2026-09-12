"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PillButton } from "../components/PillButton";
import { StarRating } from "../components/StarRating";
import { classifyDiscovery, getDiscoveryCopy } from "../components/discoveryLabel";
import { anglesFor, planetsFor, type AngleEntry, type PlanetEntry } from "../content/astroExplainer";
import { confidenceLabel } from "../../interpretation/display";
import { useJourney } from "../journey/JourneyContext";
import { GOAL_COLOR, GOAL_COLOR_BG, goalLabelFor } from "../journey/goalTheme";
import type { CalculateRequest, CalculateResponse, CalculateResult } from "../journey/types";
import type { Goal, ScorableGoal } from "../../scoring/types";
import { SCORABLE_GOALS } from "../../scoring/types";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTranslation } from "../../i18n/useTranslation";
import type { Language } from "../../i18n/types";

// Goal sections render Career -> Love -> Home -> Growth -> All life areas
// last (docs/DECISIONS.md, 2026-09-09 "All life areas" reorder): it's a
// synthesis of the other four, so it reads better after them than before.
const REPORT_GOALS: Goal[] = [...SCORABLE_GOALS, "OVERALL"];
const MAX_CITIES = 3;
const MAX_COUNTRIES = 3;

export default function ReportPage() {
  const router = useRouter();
  const { journey, hydrated } = useJourney();
  const { language } = useLanguage();
  const t = useTranslation();
  const [byGoal, setByGoal] = useState<Partial<Record<Goal, CalculateResponse>> | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!journey.birth || !journey.results || !journey.unlocked) {
      router.replace("/results");
      return;
    }

    let cancelled = false;
    // Reuse the already-fetched goal only when it was composed in the
    // currently active language -- a language switch mid-session (rare on
    // this page, since it's normally entered fresh right after unlocking)
    // otherwise re-fetches all 5 goals instead of mixing languages.
    const known = journey.results.language === language ? journey.results : undefined;
    const missing = known ? REPORT_GOALS.filter((g) => g !== known.goal) : REPORT_GOALS;

    Promise.all(
      missing.map((goal) => {
        const request: CalculateRequest = {
          birth: journey.birth!,
          uncertaintyMinutes: journey.uncertaintyMinutes,
          goal,
          language
        };
        return fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request)
        }).then((res) => res.json() as Promise<CalculateResponse>);
      })
    )
      .then((fetched) => {
        if (cancelled) return;
        const merged: Partial<Record<Goal, CalculateResponse>> = known ? { [known.goal]: known } : {};
        missing.forEach((goal, i) => {
          const data = fetched[i];
          if (data) merged[goal] = data;
        });
        setByGoal(merged);
      })
      .catch(() => !cancelled && setError(true));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, language]);

  if (!hydrated || (!byGoal && !error)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ font: "400 15px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          {t.report.assembling}
        </p>
      </div>
    );
  }

  if (error || !byGoal) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ font: "400 15px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          {t.report.assembleError} <button onClick={() => router.push("/results")}>{t.report.backToResults}</button>
        </p>
      </div>
    );
  }

  const birth = journey.birth!;

  return (
    <div style={{ background: "var(--astravia-background)", minHeight: "100vh" }}>
      <div
        className="no-print"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 24px",
          background: "var(--astravia-surface)",
          borderBottom: "1px solid var(--astravia-border)"
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/results")}
          style={{ border: "none", background: "none", color: "var(--astravia-ink)", font: "600 13px var(--font-body)", cursor: "pointer" }}
        >
          {t.report.backButton}
        </button>
        <PillButton fullWidth={false} onClick={() => window.print()}>
          {t.report.printSave}
        </PillButton>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 60px" }}>
        <CoverPage birthDate={birth.birthDate} birthTime={birth.birthLocalTime} birthPlace={birth.birthPlaceLabel} />
        <IntroPage />
        {SCORABLE_GOALS.map((g) => {
          const data = byGoal[g];
          return data ? <GoalSection key={g} goal={g} data={data} /> : null;
        })}
        {byGoal.OVERALL && <GoalSection goal="OVERALL" data={byGoal.OVERALL} />}
        <ClosingPage />
      </div>
    </div>
  );
}

function ReportSheet({ children }: { children: React.ReactNode }) {
  return <div className="report-page">{children}</div>;
}

function CoverPage({ birthDate, birthTime, birthPlace }: { birthDate: string; birthTime: string; birthPlace: string }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const preparedDate = new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  return (
    <ReportSheet>
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{ fontSize: 30, color: "var(--astravia-overall)", marginBottom: 10 }}>✦</div>
        <div style={{ font: "600 20px var(--font-display)", color: "var(--astravia-ink)", marginBottom: 44 }}>Astravia</div>
        <div
          style={{
            font: "600 11px var(--font-body)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--astravia-text-secondary)",
            marginBottom: 14
          }}
        >
          {t.report.coverEyebrow}
        </div>
        <h1 style={{ font: "600 38px/1.25 var(--font-display)", color: "var(--astravia-ink)", margin: "0 0 18px" }}>
          {t.report.coverTitleLine1}
          <br />
          {t.report.coverTitleLine2}
        </h1>
        <p style={{ font: "400 14px var(--font-body)", color: "var(--astravia-text-secondary)", marginBottom: 44 }}>
          {t.report.coverSubtitle}
        </p>
        <div
          style={{
            display: "inline-flex",
            gap: 30,
            background: "var(--astravia-surface-alt)",
            borderRadius: "var(--astravia-radius-control)",
            padding: "18px 28px"
          }}
        >
          <BirthField label={t.report.bornLabel} value={birthDate} />
          <BirthField label={t.report.timeLabel} value={birthTime} />
          <BirthField label={t.report.placeLabel} value={birthPlace} />
        </div>
        <div
          style={{
            width: 110,
            height: 3,
            borderRadius: 4,
            margin: "26px auto 0",
            background: "var(--astravia-spectrum)"
          }}
        />
        <p style={{ marginTop: 60, font: "400 11px var(--font-body)", color: "var(--astravia-text-subtle)" }}>
          {t.report.preparedOn(preparedDate)}
        </p>
      </div>
    </ReportSheet>
  );
}

function BirthField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          font: "600 10px var(--font-body)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--astravia-text-secondary)",
          marginBottom: 4
        }}
      >
        {label}
      </div>
      <div style={{ font: "600 14px var(--font-body)", color: "var(--astravia-ink)" }}>{value}</div>
    </div>
  );
}

function IntroPage() {
  const { language } = useLanguage();
  const t = useTranslation();
  const angles = anglesFor(language);
  const planets = planetsFor(language);
  return (
    <ReportSheet>
      <h2 style={{ font: "600 26px var(--font-display)", color: "var(--astravia-ink)", margin: "20px 0 10px" }}>
        {t.report.introHeading}
      </h2>
      <p style={{ font: "500 15px/1.7 var(--font-display)", color: "var(--astravia-ink)", margin: "0 0 18px" }}>
        {t.report.introBody}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {angles.map((a) => (
          <div
            key={a.id}
            style={{ background: "var(--astravia-surface-alt)", borderRadius: 10, padding: "10px 14px" }}
          >
            <span style={{ font: "700 15px var(--font-display)", color: "var(--astravia-ink)" }}>{a.id}</span>
            <span style={{ font: "600 10px var(--font-body)", color: "var(--astravia-text-subtle)", marginLeft: 6 }}>
              {a.fullName}
            </span>
            <div style={{ font: "400 11.5px var(--font-body)", color: "var(--astravia-text-secondary)", marginTop: 4 }}>
              {a.meaning}
            </div>
          </div>
        ))}
      </div>
      <p style={{ font: "400 12.5px var(--font-body)", color: "var(--astravia-text-secondary)", margin: "0 0 12px" }}>
        {t.report.introPlanetIntro}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {planets.map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              background: "var(--astravia-surface-alt)",
              borderRadius: 8,
              padding: "8px 11px"
            }}
          >
            <span style={{ font: "700 14px var(--font-display)", color: "var(--astravia-overall)", width: 14, flexShrink: 0 }}>
              {p.symbol}
            </span>
            <span style={{ font: "700 12.5px var(--font-display)", color: "var(--astravia-ink)", flexShrink: 0 }}>
              {p.name}
            </span>
            <span style={{ font: "400 10.5px var(--font-body)", color: "var(--astravia-text-secondary)", lineHeight: 1.3 }}>
              {p.theme}
            </span>
          </div>
        ))}
      </div>
      <p style={{ font: "400 13px/1.65 var(--font-body)", color: "var(--astravia-text-secondary)", marginTop: 20 }}>
        {t.report.introClosing}
      </p>
    </ReportSheet>
  );
}

function GoalSection({ goal, data }: { goal: Goal; data: CalculateResponse }) {
  const { language } = useLanguage();
  const t = useTranslation();
  const isOverall = goal === "OVERALL";
  const label = isOverall ? t.results.allLifeAreasInline : goalLabelFor(goal as ScorableGoal, language);
  const accentColor = isOverall ? "var(--astravia-overall)" : GOAL_COLOR[goal as ScorableGoal];
  const accentBg = isOverall ? "var(--astravia-overall-bg)" : GOAL_COLOR_BG[goal as ScorableGoal];
  const title = isOverall ? t.report.overallTitle : t.report.goalTitle(label);
  const topCities = data.results.slice(0, MAX_CITIES);
  const topCountries = data.countries.slice(0, MAX_COUNTRIES);
  const allKnown: CalculateResult[] = [...data.results, ...data.extraResults];
  const findResult = (id: string) => allKnown.find((r) => r.ranked.cityId === id);

  const hero = topCities[0];
  const heroStory = hero ? data.stories[hero.ranked.cityId] : undefined;

  return (
    <ReportSheet>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          font: "700 11px var(--font-body)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "6px 14px",
          borderRadius: "var(--astravia-radius-pill)",
          background: accentBg,
          color: isOverall ? "#8a6a1c" : accentColor,
          margin: "20px 0 14px"
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: accentColor }} />
        {isOverall ? t.report.allLifeAreasBadge : label}
      </div>
      <h2 style={{ font: "600 26px var(--font-display)", color: "var(--astravia-ink)", margin: "0 0 6px" }}>{title}</h2>

      {hero && heroStory && (
        <>
          <div style={{ height: 3, borderRadius: 4, margin: "18px 0 16px", background: "var(--astravia-spectrum)" }} />
          <div
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--astravia-text-subtle)"
            }}
          >
            {isOverall ? t.report.heroOverallLabel : t.report.heroGoalLabel(label)}
          </div>
          <div style={{ font: "600 26px var(--font-display)", color: "var(--astravia-ink)", margin: "6px 0 10px" }}>
            {hero.city.name}, {hero.city.countryName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
            <StarRating stars={hero.ranked.stars} score={hero.ranked.internalScore} showLabel />
            <span style={{ font: "600 12px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
              {t.report.confidence(confidenceLabel(hero.ranked.stability, language))}
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
            {[heroStory.primaryTheme, ...heroStory.secondaryThemes].filter(Boolean).map((theme) => (
              <span
                key={theme}
                style={{
                  padding: "6px 13px",
                  borderRadius: "var(--astravia-radius-pill)",
                  background: "var(--astravia-ink)",
                  color: "var(--astravia-white)",
                  font: "600 11.5px var(--font-body)"
                }}
              >
                {theme}
              </span>
            ))}
          </div>
          {heroStory.tagline && (
            <p style={{ font: "italic 500 15px/1.6 var(--font-display)", color: "var(--astravia-ink)", margin: "0 0 14px" }}>
              {heroStory.tagline}
            </p>
          )}
          <div style={{ font: "400 14px/1.7 var(--font-body)", color: "var(--astravia-ink)", margin: "0 0 18px", whiteSpace: "pre-line" }}>
            {heroStory.whyItStandsOut}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            {heroStory.opportunities.length > 0 && (
              <div style={{ background: "var(--astravia-surface-alt)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, font: "700 12px var(--font-body)", color: "var(--astravia-home)", marginBottom: 8 }}>
                  <span aria-hidden="true">◇</span> {t.report.whatCouldGrow}
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {heroStory.opportunities.map((o, i) => (
                    <li key={i} style={{ font: "400 12.5px/1.55 var(--font-body)", color: "var(--astravia-ink)" }}>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {heroStory.tradeOffs.length > 0 && (
              <div style={{ background: "var(--astravia-surface-alt)", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, font: "700 12px var(--font-body)", color: "var(--astravia-love)", marginBottom: 8 }}>
                  <span aria-hidden="true">◆</span> {t.report.whereItMayStretch}
                </div>
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {heroStory.tradeOffs.map((item, i) => (
                    <li key={i} style={{ font: "400 12.5px/1.55 var(--font-body)", color: "var(--astravia-ink)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {heroStory.howItMayFeel && (
            <div
              style={{
                borderLeft: "3px solid var(--astravia-ink)",
                background: "var(--astravia-surface)",
                border: "1px solid var(--astravia-border)",
                borderRadius: "0 10px 10px 0",
                padding: "14px 18px",
                marginBottom: 18
              }}
            >
              <div style={{ font: "600 10px var(--font-body)", letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--astravia-text-subtle)", marginBottom: 4 }}>
                {t.report.whatLifeMightFeel}
              </div>
              <div style={{ font: "600 16px var(--font-display)", color: "var(--astravia-ink)" }}>{heroStory.howItMayFeel}</div>
              {heroStory.howItMayFeelDetail && (
                <p style={{ margin: "8px 0 0", font: "400 12.5px/1.55 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
                  {heroStory.howItMayFeelDetail}
                </p>
              )}
            </div>
          )}
          {heroStory.bestFor.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 8 }}>
              {heroStory.bestFor.map((b) => (
                <span
                  key={b}
                  style={{
                    padding: "6px 13px",
                    borderRadius: "var(--astravia-radius-pill)",
                    background: "var(--astravia-surface-alt)",
                    font: "600 11.5px var(--font-body)",
                    color: "var(--astravia-ink)"
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </>
      )}

      {topCities.length > 1 && (
        <>
          <div
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--astravia-text-subtle)",
              margin: "26px 0 10px"
            }}
          >
            {t.report.alsoStrongFor(isOverall ? t.results.allLifeAreasInline : label)}
          </div>
          {topCities.slice(1).map((r, i) => {
            const story = data.stories[r.ranked.cityId];
            return (
              <div key={r.ranked.cityId} style={{ padding: "10px 0", borderBottom: "1px solid var(--astravia-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", font: "600 13px var(--font-body)", color: "var(--astravia-ink)" }}>
                  <span>
                    #{i + 2} {r.city.name}, {r.city.countryName}
                  </span>
                  <StarRating stars={r.ranked.stars} score={r.ranked.internalScore} size={12} />
                </div>
                {story && (
                  <p style={{ font: "400 12px var(--font-body)", color: "var(--astravia-text-secondary)", margin: "2px 0 0" }}>
                    {[story.primaryTheme, ...story.secondaryThemes.slice(0, 1)].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
            );
          })}
        </>
      )}

      {topCountries.length > 0 && (
        <>
          <div
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--astravia-text-subtle)",
              margin: "26px 0 10px"
            }}
          >
            {t.report.strongestCountriesFor(isOverall ? t.results.allLifeAreasInline : label)}
          </div>
          {topCountries.map((co, i) => {
            const cityResults = co.topCityIds.map(findResult).filter((c): c is CalculateResult => c !== undefined);
            const discoveryType = classifyDiscovery(co.narrative, co.stars, cityResults[0]?.city.population);
            const discoveryCopy = getDiscoveryCopy(discoveryType, language);
            return (
              <div key={co.countryCode} style={{ background: "var(--astravia-surface-alt)", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ font: "600 15px var(--font-display)", color: "var(--astravia-ink)" }}>
                    #{i + 1} {data.countryNames[co.countryCode] ?? co.countryCode}
                  </span>
                  <span style={{ font: "700 10px var(--font-body)", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--astravia-home)" }}>
                    {discoveryCopy.label}
                  </span>
                </div>
                <div style={{ font: "400 11.5px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
                  {co.topCityIds.map((id) => data.cityNames[id]?.name ?? id).join(" · ")}
                </div>
              </div>
            );
          })}
        </>
      )}

      {data.pattern && (
        <>
          <div
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--astravia-text-subtle)",
              margin: "26px 0 8px"
            }}
          >
            {t.report.locationStoryLabel}
          </div>
          <p style={{ font: "500 14px/1.6 var(--font-display)", color: "var(--astravia-ink)", margin: "0 0 10px" }}>
            {data.pattern.sentence}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {data.pattern.chips.map((chip) => (
              <span
                key={chip}
                style={{
                  padding: "5px 12px",
                  borderRadius: "var(--astravia-radius-pill)",
                  background: "var(--astravia-surface-alt)",
                  font: "600 11px var(--font-body)",
                  color: "var(--astravia-ink)"
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </>
      )}
    </ReportSheet>
  );
}

function ClosingPage() {
  const t = useTranslation();
  return (
    <ReportSheet>
      <div style={{ minHeight: 500, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 26, color: "var(--astravia-overall)", marginBottom: 16 }}>✦</div>
        <p style={{ font: "italic 500 18px var(--font-display)", color: "var(--astravia-text-secondary)", margin: "0 0 40px", maxWidth: 420 }}>
          {t.report.closingQuote}
        </p>
        <p style={{ font: "400 11px/1.6 var(--font-body)", color: "var(--astravia-text-subtle)", maxWidth: 480, borderTop: "1px solid var(--astravia-border)", paddingTop: 18 }}>
          {t.report.closingDisclaimer}
        </p>
      </div>
    </ReportSheet>
  );
}
