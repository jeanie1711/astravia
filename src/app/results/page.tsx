"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../components/BackHeader";
import { CountryMiniMap } from "../components/CountryMiniMap";
import { classifyDiscovery, getDiscoveryColors, getDiscoveryCopy } from "../components/discoveryLabel";
import { GoalBreakdownBars } from "../components/GoalBreakdownBars";
import { PaywallModal } from "../components/PaywallModal";
import { PillButton } from "../components/PillButton";
import { SaveButton } from "../components/SaveButton";
import { ScreenShell } from "../components/ScreenShell";
import { StarRating } from "../components/StarRating";
import { useSavedPlaces } from "../components/useSavedPlaces";
import { WorldMap, type MapPin } from "../components/WorldMap";
import { confidenceLabel } from "../../interpretation/display";
import { PENDING_CHECKOUT_STORAGE_KEY, PRICE_LABEL } from "../../config/payments";
import { useJourney } from "../journey/JourneyContext";
import { GOAL_COLOR, GOAL_LABEL } from "../journey/goalTheme";
import type { CalculateRequest, CalculateResponse, CalculateResult } from "../journey/types";
import { SCORABLE_GOALS, type Goal, type Stars } from "../../scoring/types";
import { getArchetypeCopy } from "../../interpretation/archetypes";

// Kept deliberately small: a focused, convincing shortlist beats a long,
// noisy one.
const MAX_CITIES_SHOWN = 3;
const MAX_COUNTRIES_SHOWN = 3;

export default function ResultsPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [loading, setLoading] = useState(false);
  const { saved, toggle: toggleSaved } = useSavedPlaces();
  const [paywall, setPaywall] = useState<{ open: boolean; context?: string }>({ open: false });
  const [verifyingCheckout, setVerifyingCheckout] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!journey.birth || !journey.results) {
      router.replace("/explore/birth-details");
      return;
    }
    // Defaults to "Places" rather than routing through a separate
    // lens-choice screen (product feedback 2026-09-07, §15) -- the
    // segmented control below already lets the user switch anytime.
    if (!journey.viewMode) {
      setJourney((prev) => ({ ...prev, viewMode: "city" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, journey.results, journey.viewMode]);

  // Returning from Dodo Payments checkout (docs/DECISIONS.md, 2026-09-13
  // entry): verify the session server-side before unlocking -- the
  // redirect alone is not trusted. Read the query string directly
  // instead of useSearchParams() to avoid a Suspense-boundary
  // requirement for a one-time, non-reactive check. The session id
  // travels back via sessionStorage (stashed by PaywallModal before
  // redirecting), not the URL -- Dodo's return_url is fixed and can't
  // carry an id that didn't exist yet when the session was created.
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (!checkout) return;

    if (checkout === "success") {
      const sessionId = window.sessionStorage.getItem(PENDING_CHECKOUT_STORAGE_KEY);
      if (sessionId) {
        setVerifyingCheckout(true);
        fetch(`/api/verify-checkout?session_id=${encodeURIComponent(sessionId)}`)
          .then((res) => res.json())
          .then((data: { paid?: boolean }) => {
            if (data.paid) setJourney((prev) => ({ ...prev, unlocked: true }));
          })
          .finally(() => {
            window.sessionStorage.removeItem(PENDING_CHECKOUT_STORAGE_KEY);
            setVerifyingCheckout(false);
            router.replace("/results");
          });
        return;
      }
    }
    router.replace("/results");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function switchGoal(goal: Goal) {
    if (!journey.birth || goal === journey.results?.goal) return;
    if (!journey.unlocked) {
      setPaywall({ open: true });
      return;
    }
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
    if (mode === "country" && !journey.unlocked) {
      setPaywall({ open: true });
      return;
    }
    setJourney((prev) => ({ ...prev, viewMode: mode }));
  }

  // Two-tier goal picker: "Overall" used to sit in the same row as the
  // four life-area goals, which is exactly why it read as a confusing
  // fifth one. Separated into its own mode instead -- the split itself is
  // meant to be self-evident, so no explanatory box accompanies it
  // (product feedback 2026-09-07, §14). Labeled "All life areas" rather
  // than "Whole picture" (product feedback 2026-09-08): Overall's score
  // actively rewards being strong across all four goals at once (a
  // breadth bonus, plus a penalty for one effortful standout goal --
  // src/scoring/overall.ts) rather than just summarizing them, and the
  // label should say that plainly.
  function selectAllLifeAreas() {
    switchGoal("OVERALL");
  }

  function selectLifeArea() {
    if (journey.results?.goal === "OVERALL") switchGoal("CAREER");
  }

  const results = journey.results;
  if (!results || !journey.viewMode) return null;

  const viewMode = journey.viewMode;
  // Tabs render with the home screen's picked life area first (2026-09-11
  // redesign) -- falls back to the default order when there isn't one
  // (e.g. an older session that started before this field existed).
  const orderedGoals = journey.initialGoal
    ? [journey.initialGoal, ...SCORABLE_GOALS.filter((g) => g !== journey.initialGoal)]
    : SCORABLE_GOALS;
  const goalName = results.goal === "OVERALL" ? "all life areas" : GOAL_LABEL[results.goal];
  const topCities = results.results.slice(0, MAX_CITIES_SHOWN);
  const topCountries = results.countries.slice(0, MAX_COUNTRIES_SHOWN);
  // Freemium gate (docs/DECISIONS.md, 2026-09-09): only city #1 of
  // whichever life area the user first calculated is free. Since
  // switchGoal/switchView already refuse to run while locked, results.goal
  // never actually changes pre-purchase, so this stays stable.
  const unlocked = journey.unlocked === true;
  const activeTopStars = viewMode === "city" ? topCities[0]?.ranked.stars ?? 1 : topCountries[0]?.stars ?? 1;
  const isMixed = activeTopStars <= 3;

  const allKnownResults: CalculateResult[] = [...results.results, ...results.extraResults];
  function findResult(cityId: string): CalculateResult | undefined {
    return allKnownResults.find((r) => r.ranked.cityId === cityId);
  }

  return (
    <ScreenShell maxWidth={680}>
      <BackHeader
        stepLabel="Your places"
        onBack={() => router.push("/explore/goal")}
        right={
          <button
            type="button"
            onClick={() => router.push("/explore/birth-details")}
            style={{
              border: "none",
              background: "none",
              color: "var(--astravia-ink)",
              font: "600 13px var(--font-body)",
              cursor: "pointer",
              padding: 0
            }}
          >
            Edit details
          </button>
        }
      />

      <div style={{ padding: "20px 24px 0" }}>
        <div
          style={{
            display: "inline-flex",
            gap: 4,
            padding: 4,
            borderRadius: "var(--astravia-radius-pill)",
            background: "var(--astravia-surface-alt)",
            marginBottom: 18
          }}
        >
          <button
            type="button"
            onClick={() => switchView("city")}
            aria-pressed={viewMode === "city"}
            style={{
              minHeight: 40,
              padding: "0 16px",
              borderRadius: "var(--astravia-radius-pill)",
              border: "none",
              background: viewMode === "city" ? "var(--astravia-surface)" : "transparent",
              boxShadow: viewMode === "city" ? "var(--astravia-shadow-card)" : "none",
              font: "600 13px var(--font-body)",
              color: "var(--astravia-ink)",
              cursor: "pointer"
            }}
          >
            Places
          </button>
          <button
            type="button"
            onClick={() => switchView("country")}
            aria-pressed={viewMode === "country"}
            style={{
              minHeight: 40,
              padding: "0 16px",
              borderRadius: "var(--astravia-radius-pill)",
              border: "none",
              background: viewMode === "country" ? "var(--astravia-surface)" : "transparent",
              boxShadow: viewMode === "country" ? "var(--astravia-shadow-card)" : "none",
              font: "600 13px var(--font-body)",
              color: "var(--astravia-ink)",
              cursor: "pointer"
            }}
          >
            Countries
          </button>
        </div>

        <h2 style={{ margin: "0 0 6px", font: "600 28px var(--font-display)", color: "var(--astravia-ink)" }}>
          {results.goal === "OVERALL"
            ? viewMode === "city"
              ? "The most balanced places across all life areas"
              : "The most balanced countries across all life areas"
            : viewMode === "city"
              ? `Your strongest places for ${goalName}`
              : `Your strongest countries for ${goalName}`}
        </h2>
        {isMixed ? (
          <p style={{ margin: "0 0 8px", font: "400 14px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            <strong style={{ color: "var(--astravia-ink)" }}>Your map is more mixed for this goal.</strong> These
            are the {viewMode === "city" ? "locations" : "countries"} with the clearest signals, even though none
            are exceptionally strong in the current model.
          </p>
        ) : (
          <p style={{ margin: "0 0 8px", font: "400 14px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            Based on the birth details and time range you entered.
          </p>
        )}
        <p style={{ margin: "0 0 20px", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
          {results.goal === "OVERALL"
            ? viewMode === "city"
              ? "Match strength shows how strongly a place supports all four goals together. Open a place to see the breakdown."
              : "Match strength shows how strongly a country supports all four goals together, based on the consistency of its strongest cities, not the country as a single point on the map."
            : viewMode === "city"
              ? "Match strength shows how strongly a place fits " +
                goalName +
                ". Open a place to see how much that could shift if your birth time isn't exact."
              : "Match strength shows how strongly a country fits " +
                goalName +
                " overall, based on the consistency and strength of its matching cities, not the country as a single astrological point."}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div
            style={{
              display: "inline-flex",
              gap: 4,
              padding: 4,
              borderRadius: "var(--astravia-radius-pill)",
              background: "var(--astravia-surface-alt)"
            }}
          >
            <button
              type="button"
              onClick={selectLifeArea}
              aria-pressed={results.goal !== "OVERALL"}
              style={{
                minHeight: 40,
                padding: "0 16px",
                borderRadius: "var(--astravia-radius-pill)",
                border: "none",
                background: results.goal !== "OVERALL" ? "var(--astravia-surface)" : "transparent",
                boxShadow: results.goal !== "OVERALL" ? "var(--astravia-shadow-card)" : "none",
                font: "600 13px var(--font-body)",
                color: "var(--astravia-ink)",
                cursor: "pointer"
              }}
            >
              By life area
            </button>
            <button
              type="button"
              onClick={selectAllLifeAreas}
              aria-pressed={results.goal === "OVERALL"}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 40,
                padding: "0 16px",
                borderRadius: "var(--astravia-radius-pill)",
                border: "none",
                background: results.goal === "OVERALL" ? "var(--astravia-surface)" : "transparent",
                boxShadow: results.goal === "OVERALL" ? "var(--astravia-shadow-card)" : "none",
                font: "600 13px var(--font-body)",
                color: "var(--astravia-ink)",
                cursor: "pointer"
              }}
            >
              <span aria-hidden="true" style={{ color: "var(--astravia-overall)" }}>
                ✦
              </span>
              All life areas
            </button>
          </div>
        </div>

        {results.goal !== "OVERALL" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {orderedGoals.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => switchGoal(g)}
                aria-pressed={g === results.goal}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  minHeight: 40,
                  padding: "0 14px",
                  borderRadius: "var(--astravia-radius-pill)",
                  border: g === results.goal ? "2px solid var(--astravia-ink)" : "1px solid var(--astravia-border)",
                  background: g === results.goal ? "var(--astravia-surface-alt)" : "var(--astravia-surface)",
                  font: "600 13px var(--font-body)",
                  color: "var(--astravia-ink)",
                  cursor: "pointer"
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: GOAL_COLOR[g]
                  }}
                />
                {GOAL_LABEL[g]}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <p style={{ font: "400 13px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            Recalculating…
          </p>
        )}

        {verifyingCheckout && (
          <p style={{ font: "400 13px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            Confirming your payment…
          </p>
        )}

        {unlocked && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              background: "var(--astravia-home-bg)",
              borderRadius: "var(--astravia-radius-control)",
              padding: "14px 18px",
              marginBottom: 24
            }}
          >
            <div style={{ font: "600 13px/1.4 var(--font-body)", color: "var(--astravia-ink)" }}>
              Your full report is unlocked for this chart.
            </div>
            <PillButton fullWidth={false} onClick={() => router.push("/report")}>
              Get your PDF report →
            </PillButton>
          </div>
        )}

        {results.pattern && (
          <div
            style={{
              background: "var(--astravia-surface)",
              border: "1px solid var(--astravia-border)",
              borderRadius: "var(--astravia-radius-card)",
              padding: "18px 20px",
              marginBottom: 32,
              boxShadow: "var(--astravia-shadow-card)"
            }}
          >
            <div
              style={{
                font: "600 11px var(--font-body)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--astravia-text-subtle)",
                marginBottom: 6
              }}
            >
              Your location story
            </div>
            <div style={{ font: "500 15px/1.5 var(--font-display)", color: "var(--astravia-ink)" }}>
              {results.pattern.sentence}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {results.pattern.chips.map((chip) => (
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
          </div>
        )}

        {viewMode === "city" ? (
          <>
            <div
              style={{
                font: "600 12px var(--font-body)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--astravia-text-subtle)",
                marginBottom: 14
              }}
            >
              Your top places
            </div>

            {topCities.length > 0 && (
              <WorldMap
                pins={topCities.map(
                  (r, i): MapPin => ({
                    id: r.ranked.cityId,
                    rank: i + 1,
                    lat: r.city.latitude,
                    lon: r.city.longitude,
                    title: `${r.city.name}, ${r.city.countryName}`,
                    subtitle: `#${i + 1}`
                  })
                )}
                onSelect={(id) => router.push(`/place/${id}`)}
              />
            )}

            {topCities.map((r, i) => {
              const story = results.stories[r.ranked.cityId];
              if (i === 0) {
                const archetypeCopy = getArchetypeCopy(r.ranked.archetypeId);
                return (
                  <div
                    key={r.ranked.cityId}
                    className="astravia-card-top astravia-sheen astravia-stagger"
                    style={{
                      ["--stagger-index" as string]: 0,
                      background: "var(--astravia-surface)",
                      borderRadius: "var(--astravia-radius-card)",
                      overflow: "hidden",
                      marginBottom: 14,
                      boxShadow: "var(--astravia-shadow-card)"
                    }}
                  >
                    <div style={{ height: 3, background: "var(--astravia-spectrum)" }} />
                    <div style={{ padding: "20px 22px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div
                          style={{
                            font: "600 11px var(--font-body)",
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "var(--astravia-text-subtle)"
                          }}
                        >
                          {results.goal === "OVERALL"
                            ? "The most balanced across all life areas"
                            : `Your strongest place for ${goalName}`}
                        </div>
                        <SaveButton saved={saved.has(r.ranked.cityId)} onToggle={() => toggleSaved(r.ranked.cityId)} />
                      </div>
                      <div
                        style={{
                          font: "600 30px var(--font-display)",
                          color: "var(--astravia-ink)",
                          marginTop: 6
                        }}
                      >
                        {r.city.name}, {r.city.countryName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
                        <StarRating stars={r.ranked.stars} score={r.ranked.internalScore} showLabel />
                        <span
                          style={{
                            font: "600 12px var(--font-body)",
                            color: "var(--astravia-text-secondary)"
                          }}
                        >
                          Confidence: {confidenceLabel(r.ranked.stability)}
                        </span>
                      </div>
                      <p
                        style={{
                          margin: "14px 0 0",
                          font: "500 17px/1.5 var(--font-display)",
                          color: "var(--astravia-ink)"
                        }}
                      >
                        {archetypeCopy.description}
                      </p>
                      {story && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                          {[story.primaryTheme, ...story.secondaryThemes.slice(0, 2)]
                            .filter(Boolean)
                            .map((theme) => (
                              <span
                                key={theme}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "var(--astravia-radius-pill)",
                                  background: "var(--astravia-surface-alt)",
                                  font: "600 11px var(--font-body)",
                                  color: "var(--astravia-ink)"
                                }}
                              >
                                {theme}
                              </span>
                            ))}
                        </div>
                      )}
                      {r.goalBreakdown && <GoalBreakdownBars breakdown={r.goalBreakdown} />}
                      <PillButton
                        className="astravia-btn-shine"
                        style={{ marginTop: 18 }}
                        onClick={() => router.push(`/place/${r.ranked.cityId}`)}
                      >
                        Why {r.city.name}? →
                      </PillButton>
                    </div>
                  </div>
                );
              }

              return null;
            })}

            <div className="astravia-secondary-grid">
              {topCities.slice(1).map((r, i) => {
                const rank = i + 2;
                const story = results.stories[r.ranked.cityId];
                return (
                  <div
                    key={r.ranked.cityId}
                    className="astravia-card-hover astravia-stagger"
                    style={{
                      ["--stagger-index" as string]: rank,
                      background: "var(--astravia-surface)",
                      border: "1px solid var(--astravia-border)",
                      borderRadius: "var(--astravia-radius-control)",
                      padding: "14px 18px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ font: "600 15px var(--font-body)", color: "var(--astravia-ink)" }}>
                        <span style={{ color: "var(--astravia-text-subtle)", fontWeight: 600 }}>#{rank}</span>{" "}
                        {r.city.name}, {r.city.countryName}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                        <StarRating stars={r.ranked.stars} score={r.ranked.internalScore} size={13} />
                        <SaveButton
                          saved={saved.has(r.ranked.cityId)}
                          onToggle={() => toggleSaved(r.ranked.cityId)}
                          size={15}
                        />
                      </div>
                    </div>
                    {unlocked && story && (
                      <>
                        <div
                          style={{
                            font: "600 11px var(--font-body)",
                            color: "var(--astravia-text-secondary)",
                            marginTop: 8
                          }}
                        >
                          {[story.primaryTheme, ...story.secondaryThemes.slice(0, 1)].filter(Boolean).join(" · ")}
                        </div>
                        <p
                          style={{
                            margin: "6px 0 0",
                            font: "400 13px/1.5 var(--font-body)",
                            color: "var(--astravia-text-secondary)"
                          }}
                        >
                          {story.hook}
                        </p>
                      </>
                    )}
                    {!unlocked && (
                      <p
                        style={{
                          margin: "6px 0 0",
                          font: "400 13px/1.5 var(--font-body)",
                          color: "var(--astravia-text-subtle)",
                          fontStyle: "italic"
                        }}
                      >
                        Locked. Unlock the full report to see why.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        unlocked ? router.push(`/place/${r.ranked.cityId}`) : setPaywall({ open: true })
                      }
                      style={{
                        marginTop: 8,
                        border: "none",
                        background: "none",
                        color: "var(--astravia-ink)",
                        font: "600 12px var(--font-body)",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                        textUnderlineOffset: 3
                      }}
                    >
                      {unlocked ? "Explore this place →" : "Unlock to explore →"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : !unlocked ? (
          <div
            style={{
              background: "var(--astravia-surface)",
              border: "1px solid var(--astravia-border)",
              borderRadius: "var(--astravia-radius-card)",
              padding: "24px 22px",
              textAlign: "center"
            }}
          >
            <p style={{ margin: "0 0 14px", font: "500 15px/1.5 var(--font-display)", color: "var(--astravia-ink)" }}>
              Country results are part of the full report.
            </p>
            <PillButton className="astravia-btn-shine" fullWidth={false} onClick={() => setPaywall({ open: true })}>
              Unlock full report for {PRICE_LABEL}
            </PillButton>
          </div>
        ) : (
          <>
            <div
              style={{
                font: "600 12px var(--font-body)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--astravia-text-subtle)",
                marginBottom: 14
              }}
            >
              Your top countries
            </div>

            {topCountries.map((co, i) => {
              const cityResults = co.topCityIds.map(findResult).filter((c): c is CalculateResult => c !== undefined);
              const discoveryType = classifyDiscovery(co.narrative, co.stars, cityResults[0]?.city.population);
              const discoveryCopy = getDiscoveryCopy(discoveryType);
              const discoveryColors = getDiscoveryColors();

              return (
                <div
                  key={co.countryCode}
                  className={`astravia-card-hover astravia-stagger${i === 0 ? " astravia-card-top" : ""}`}
                  style={{
                    ["--stagger-index" as string]: i,
                    background: "var(--astravia-surface)",
                    border: "1px solid var(--astravia-border)",
                    borderRadius: "var(--astravia-radius-card)",
                    padding: "20px 22px",
                    marginBottom: 14,
                    boxShadow: "var(--astravia-shadow-card)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <div style={{ font: "600 11px var(--font-body)", color: "var(--astravia-text-subtle)" }}>
                      #{i + 1}
                    </div>
                    <StarRating stars={co.stars} score={co.internalScore} showLabel />
                  </div>
                  <div style={{ font: "600 20px var(--font-display)", color: "var(--astravia-ink)", marginTop: 10 }}>
                    {results.countryNames[co.countryCode] ?? co.countryCode}
                  </div>

                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginTop: 12 }}>
                    <CountryMiniMap
                      countryCode={co.countryCode}
                      points={cityResults.map((c, ci) => ({
                        id: c.ranked.cityId,
                        rank: ci + 1,
                        lat: c.city.latitude,
                        lon: c.city.longitude
                      }))}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          font: "600 10px var(--font-body)",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: discoveryColors.fg,
                          background: discoveryColors.bg,
                          borderRadius: "var(--astravia-radius-pill)",
                          padding: "3px 9px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {discoveryCopy.accent && (
                          <span aria-hidden="true" style={{ color: "var(--astravia-overall)" }}>
                            ✦
                          </span>
                        )}
                        {discoveryCopy.label}
                      </div>
                      <p
                        style={{
                          font: "400 13px/1.5 var(--font-body)",
                          color: "var(--astravia-text-secondary)",
                          margin: "6px 0 0"
                        }}
                      >
                        {discoveryCopy.description}
                      </p>
                    </div>
                  </div>

                  {co.goalBreakdown && <GoalBreakdownBars breakdown={co.goalBreakdown} />}
                  <div
                    style={{
                      font: "600 11px var(--font-body)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--astravia-text-subtle)",
                      marginTop: 16,
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
                            background: "var(--astravia-background)",
                            borderRadius: "var(--astravia-radius-control)",
                            padding: "8px 10px",
                            cursor: "pointer",
                            textAlign: "left",
                            font: "inherit"
                          }}
                        >
                          <span style={{ font: "600 13px var(--font-body)", color: "var(--astravia-ink)" }}>
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
              );
            })}
          </>
        )}
      </div>

      <PaywallModal open={paywall.open} context={paywall.context} onClose={() => setPaywall({ open: false })} />
    </ScreenShell>
  );
}
