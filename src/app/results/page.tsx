"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalBreakdownBars } from "../components/GoalBreakdownBars";
import { PillButton } from "../components/PillButton";
import { ScreenShell } from "../components/ScreenShell";
import { StarRating } from "../components/StarRating";
import { useJourney } from "../journey/JourneyContext";
import type { CalculateRequest, CalculateResponse, CalculateResult } from "../journey/types";
import type { CountryNarrative, Goal, ScorableGoal, Stars } from "../../scoring/types";

const NARRATIVE_COPY: Record<CountryNarrative, string> = {
  CORRIDOR: "Several cities here form a consistently strong corridor.",
  ANCHOR: "One standout city anchors this country's result.",
  MIXED: "Different cities here suit different parts of this goal."
};

// Plain-language badge text (product feedback 2026-09-06): the raw enum
// name ("CORRIDOR") read as a technical label, not a description a
// newcomer would recognize.
const NARRATIVE_LABEL: Record<CountryNarrative, string> = {
  CORRIDOR: "Strong city cluster",
  ANCHOR: "Standout city",
  MIXED: "Mixed strengths"
};

// Distinct hue per narrative shape (globals.css), not one flat tag color for
// all three -- product feedback 2026-09-05.
const NARRATIVE_COLORS: Record<CountryNarrative, { fg: string; bg: string }> = {
  CORRIDOR: { fg: "var(--color-corridor)", bg: "var(--color-corridor-bg)" },
  ANCHOR: { fg: "var(--color-anchor)", bg: "var(--color-anchor-bg)" },
  MIXED: { fg: "var(--color-mixed)", bg: "var(--color-mixed-bg)" }
};

const OVERALL_INFO_SEEN_KEY = "astravia_overall_info_seen";

const SCORABLE_TABS: Array<{ id: ScorableGoal; name: string }> = [
  { id: "CAREER", name: "Career" },
  { id: "LOVE", name: "Love & Relationships" },
  { id: "HOME", name: "Home & Family" },
  { id: "GROWTH", name: "Personal Growth" }
];

// Kept deliberately small (§ product feedback 2026-09-04): a focused,
// convincing shortlist beats a long, noisy one.
const MAX_CITIES_SHOWN = 3;
const MAX_COUNTRIES_SHOWN = 3;

export default function ResultsPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [loading, setLoading] = useState(false);
  const [showOverallInfo, setShowOverallInfo] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!journey.birth || !journey.results) {
      router.replace("/explore/birth-details");
      return;
    }
    // Force the S05b choice once per fresh calculation -- avoids landing
    // here (e.g. via back button) with no lens chosen yet.
    if (!journey.viewMode) {
      router.replace("/explore/view-mode");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, journey.results, journey.viewMode]);

  async function switchGoal(goal: Goal) {
    if (!journey.birth || goal === journey.results?.goal) return;
    setLoading(true);
    const request: CalculateRequest = { birth: journey.birth, uncertaintyMinutes: journey.uncertaintyMinutes, goal };
    const res = await fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    });
    const data = (await res.json()) as CalculateResponse;
    setJourney((prev) => ({ ...prev, goal, results: data }));
    setLoading(false);
  }

  function switchView(mode: "city" | "country") {
    setJourney((prev) => ({ ...prev, viewMode: mode }));
  }

  // Two-tier goal picker (product feedback 2026-09-06): "Overall" used to
  // sit in the same row as the four life-area goals, which is exactly why
  // it read as a confusing fifth one. Selecting "Whole picture" explains
  // itself once via a dismissible tooltip (localStorage-gated) rather than
  // a dark box repeated on every screen.
  function selectWholePicture() {
    switchGoal("OVERALL");
    if (typeof window !== "undefined" && window.localStorage.getItem(OVERALL_INFO_SEEN_KEY) !== "1") {
      setShowOverallInfo(true);
    }
  }

  function selectLifeArea() {
    if (journey.results?.goal === "OVERALL") switchGoal("CAREER");
  }

  function dismissOverallInfo() {
    setShowOverallInfo(false);
    if (typeof window !== "undefined") window.localStorage.setItem(OVERALL_INFO_SEEN_KEY, "1");
  }

  const results = journey.results;
  if (!results || !journey.viewMode) return null;

  const viewMode = journey.viewMode;
  const goalName =
    results.goal === "OVERALL"
      ? "your overall picture"
      : SCORABLE_TABS.find((g) => g.id === results.goal)?.name ?? results.goal;
  const topCities = results.results.slice(0, MAX_CITIES_SHOWN);
  const topCountries = results.countries.slice(0, MAX_COUNTRIES_SHOWN);
  const activeTopStars = viewMode === "city" ? topCities[0]?.ranked.stars ?? 1 : topCountries[0]?.stars ?? 1;
  const isMixed = activeTopStars <= 3;

  const allKnownResults: CalculateResult[] = [...results.results, ...results.extraResults];
  function findResult(cityId: string): CalculateResult | undefined {
    return allKnownResults.find((r) => r.ranked.cityId === cityId);
  }

  return (
    <ScreenShell maxWidth={640}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px 28px 0"
        }}
      >
        <div
          style={{
            font: "600 11px var(--font-body)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-faint)"
          }}
        >
          Your places
        </div>
        <button
          type="button"
          onClick={() => router.push("/explore/birth-details")}
          style={{
            border: "none",
            background: "none",
            color: "var(--color-accent-strong)",
            font: "600 13px var(--font-body)",
            cursor: "pointer"
          }}
        >
          Edit details
        </button>
      </div>

      <div style={{ padding: "16px 28px 0" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => switchView("city")}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: viewMode === "city" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
              background: viewMode === "city" ? "var(--color-surface)" : "#ffffff",
              font: "600 12px var(--font-body)",
              color: "var(--color-ink)",
              cursor: "pointer"
            }}
          >
            By city
          </button>
          <button
            type="button"
            onClick={() => switchView("country")}
            style={{
              padding: "7px 14px",
              borderRadius: 100,
              border: viewMode === "country" ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
              background: viewMode === "country" ? "var(--color-surface)" : "#ffffff",
              font: "600 12px var(--font-body)",
              color: "var(--color-ink)",
              cursor: "pointer"
            }}
          >
            By country
          </button>
        </div>

        <h2 style={{ margin: "0 0 6px", font: "600 30px var(--font-display)", color: "var(--color-ink)" }}>
          {results.goal === "OVERALL"
            ? viewMode === "city"
              ? "Your overall picture, by place"
              : "Your overall picture, by country"
            : viewMode === "city"
              ? `Your strongest places for ${goalName}`
              : `Your strongest countries for ${goalName}`}
        </h2>
        {isMixed ? (
          <p style={{ margin: "0 0 8px", font: "400 14px/1.5 var(--font-body)", color: "var(--color-muted)" }}>
            <strong style={{ color: "var(--color-ink)" }}>Your map is more mixed for this goal.</strong> These are
            the {viewMode === "city" ? "locations" : "countries"} with the clearest signals, even though none are
            exceptionally strong in the current model.
          </p>
        ) : (
          <p style={{ margin: "0 0 8px", font: "400 14px var(--font-body)", color: "var(--color-muted)" }}>
            Based on the birth details and time range you entered.
          </p>
        )}
        <p style={{ margin: "0 0 20px", font: "400 13px/1.5 var(--font-body)", color: "var(--color-faint)" }}>
          {results.goal === "OVERALL"
            ? viewMode === "city"
              ? "★ shows how strongly a place supports all four goals together. Open a place to see the breakdown."
              : "★ shows how strongly a country supports all four goals together, based on its strongest cities."
            : viewMode === "city"
              ? "★ shows how strongly a place fits " +
                goalName +
                ". Open a place to see how much that could shift if your birth time isn't exact."
              : "★ shows how strongly a country fits " +
                goalName +
                " overall, based on its strongest cities together, not just its single best one."}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              padding: 4,
              borderRadius: 100,
              background: "var(--color-tag-bg)"
            }}
          >
            <button
              type="button"
              onClick={selectLifeArea}
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                border: "none",
                background: results.goal !== "OVERALL" ? "var(--color-surface)" : "transparent",
                boxShadow: results.goal !== "OVERALL" ? "var(--shadow-card)" : "none",
                font: "600 12px var(--font-body)",
                color: "var(--color-ink)",
                cursor: "pointer"
              }}
            >
              By life area
            </button>
            <button
              type="button"
              onClick={selectWholePicture}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 100,
                border: "none",
                background: results.goal === "OVERALL" ? "var(--gradient-accent)" : "transparent",
                boxShadow: results.goal === "OVERALL" ? "var(--shadow-cta)" : "none",
                font: "600 12px var(--font-body)",
                color: results.goal === "OVERALL" ? "var(--color-ink-on-dark)" : "var(--color-ink)",
                cursor: "pointer"
              }}
            >
              <span aria-hidden="true">◎</span> Whole picture
            </button>
          </div>
          {results.goal === "OVERALL" && (
            <button
              type="button"
              onClick={() => setShowOverallInfo((v) => !v)}
              aria-label="What is the whole picture?"
              style={{
                border: "1px solid var(--color-border-strong)",
                background: "var(--color-surface)",
                color: "var(--color-muted)",
                width: 24,
                height: 24,
                borderRadius: "50%",
                cursor: "pointer",
                font: "600 12px var(--font-body)",
                flexShrink: 0
              }}
            >
              i
            </button>
          )}
        </div>

        {results.goal !== "OVERALL" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {SCORABLE_TABS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => switchGoal(g.id)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 100,
                  border: g.id === results.goal ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
                  background: g.id === results.goal ? "var(--color-surface)" : "#ffffff",
                  font: "600 12px var(--font-body)",
                  color: "var(--color-ink)",
                  cursor: "pointer"
                }}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}

        {results.goal === "OVERALL" && showOverallInfo && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
              boxShadow: "var(--shadow-card)"
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 15, lineHeight: 1.4 }}>
              ◎
            </span>
            <p style={{ margin: 0, font: "400 13px/1.5 var(--font-body)", color: "var(--color-muted)", flex: 1 }}>
              This isn't a fifth goal. It blends Career, Love, Home, and Growth into one big-picture score.
            </p>
            <button
              type="button"
              onClick={dismissOverallInfo}
              aria-label="Dismiss"
              style={{
                border: "none",
                background: "none",
                color: "var(--color-faint)",
                cursor: "pointer",
                font: "16px var(--font-body)",
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>
        )}

        {loading && (
          <p style={{ font: "400 13px var(--font-body)", color: "var(--color-muted)" }}>Recalculating…</p>
        )}

        {results.pattern && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(232,126,67,0.3)",
              borderRadius: 14,
              padding: "18px 20px",
              marginBottom: 32
            }}
          >
            <div
              style={{
                font: "600 11px var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-accent-strong)",
                marginBottom: 6
              }}
            >
              Your location story
            </div>
            <div style={{ font: "500 15px/1.5 var(--font-display)", color: "var(--color-ink)" }}>
              {results.pattern.sentence}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {results.pattern.chips.map((chip) => (
                <span
                  key={chip}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 100,
                    background: "var(--color-tag-bg)",
                    font: "600 11px var(--font-body)",
                    color: "var(--color-accent-strong)"
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}

        {viewMode === "city" ? (
          <>
            <div
              style={{
                font: "600 12px var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
                marginBottom: 14
              }}
            >
              Your top places
            </div>

            {topCities.map((r, i) => {
              const story = results.stories[r.ranked.cityId];
              const goalTag = results.goal === "OVERALL" ? "OVERALL" : goalName.toUpperCase();
              return (
                <div
                  key={r.ranked.cityId}
                  className={i === 0 ? "astravia-card-top" : undefined}
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 16,
                    padding: "20px 22px",
                    marginBottom: 14,
                    boxShadow: "var(--shadow-card)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div style={{ font: "600 11px var(--font-body)", color: "var(--color-faint)" }}>#{i + 1}</div>
                    <StarRating stars={r.ranked.stars} score={r.ranked.internalScore} showLabel caption="Match strength" />
                  </div>
                  <div style={{ font: "600 20px var(--font-display)", color: "var(--color-ink)", marginTop: 10 }}>
                    {r.city.name}, {r.city.countryName}
                  </div>
                  {story && (
                    <>
                      <div
                        style={{
                          font: "600 12px var(--font-body)",
                          letterSpacing: "0.04em",
                          color: "var(--color-accent-strong)",
                          marginTop: 6
                        }}
                      >
                        {[goalTag, story.primaryTheme, ...story.secondaryThemes.slice(0, 1)]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      <div style={{ font: "400 14px/1.5 var(--font-body)", color: "#3E5865", marginTop: 10 }}>
                        {story.hook}
                      </div>
                    </>
                  )}
                  {r.goalBreakdown && <GoalBreakdownBars breakdown={r.goalBreakdown} />}
                  <PillButton
                    variant="accent"
                    style={{ marginTop: 14 }}
                    onClick={() => router.push(`/place/${r.ranked.cityId}`)}
                  >
                    Why {r.city.name}? →
                  </PillButton>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <div
              style={{
                font: "600 12px var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
                marginBottom: 14
              }}
            >
              Your top countries
            </div>

            {topCountries.map((co, i) => (
              <div
                key={co.countryCode}
                className={i === 0 ? "astravia-card-top" : undefined}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 16,
                  padding: "20px 22px",
                  marginBottom: 14,
                  boxShadow: "var(--shadow-card)"
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <div style={{ font: "600 11px var(--font-body)", color: "var(--color-faint)" }}>#{i + 1}</div>
                  <StarRating stars={co.stars} score={co.internalScore} showLabel caption="Match strength" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <div style={{ font: "600 20px var(--font-display)", color: "var(--color-ink)" }}>
                    {results.countryNames[co.countryCode] ?? co.countryCode}
                  </div>
                  <div
                    style={{
                      font: "600 10px var(--font-body)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: NARRATIVE_COLORS[co.narrative].fg,
                      background: NARRATIVE_COLORS[co.narrative].bg,
                      borderRadius: 100,
                      padding: "3px 9px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {NARRATIVE_LABEL[co.narrative]}
                  </div>
                </div>
                <p style={{ font: "400 13px/1.5 var(--font-body)", color: "var(--color-faint)", margin: "6px 0 14px" }}>
                  {NARRATIVE_COPY[co.narrative]}
                </p>
                {co.goalBreakdown && <GoalBreakdownBars breakdown={co.goalBreakdown} />}
                <div
                  style={{
                    font: "600 11px var(--font-body)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-faint)",
                    marginBottom: 8
                  }}
                >
                  Best matches
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {co.topCityIds.map((id) => {
                    const cityResult = findResult(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => router.push(`/place/${id}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "none",
                          background: "var(--color-bg)",
                          borderRadius: 10,
                          padding: "8px 10px",
                          cursor: "pointer",
                          textAlign: "left",
                          font: "inherit"
                        }}
                      >
                        <span style={{ font: "600 13px var(--font-body)", color: "var(--color-ink)" }}>
                          {results.cityNames[id]?.name ?? id}
                        </span>
                        {cityResult && (
                          <StarRating
                            stars={cityResult.ranked.stars as Stars}
                            score={cityResult.ranked.internalScore}
                            size={12}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </ScreenShell>
  );
}
