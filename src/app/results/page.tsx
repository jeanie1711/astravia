"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PillButton } from "../components/PillButton";
import { ScreenShell } from "../components/ScreenShell";
import { StarRating } from "../components/StarRating";
import { useJourney } from "../journey/JourneyContext";
import type { CalculateRequest, CalculateResponse, CalculateResult } from "../journey/types";
import type { CountryNarrative, Goal, Stars } from "../../scoring/types";

const NARRATIVE_COPY: Record<CountryNarrative, string> = {
  CORRIDOR: "Several cities here form a consistently strong corridor.",
  ANCHOR: "One standout city anchors this country's result.",
  MIXED: "Different cities here suit different parts of this goal."
};

const GOAL_TABS: Array<{ id: Goal; name: string }> = [
  { id: "CAREER", name: "Career" },
  { id: "LOVE", name: "Love & Relationships" },
  { id: "HOME", name: "Home & Family" },
  { id: "GROWTH", name: "Personal Growth" },
  { id: "OVERALL", name: "Overall" }
];

// Kept deliberately small (§ product feedback 2026-09-04): a focused,
// convincing shortlist beats a long, noisy one.
const MAX_CITIES_SHOWN = 3;
const MAX_COUNTRIES_SHOWN = 3;

export default function ResultsPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && (!journey.birth || !journey.results)) {
      router.replace("/explore/birth-details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

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

  const results = journey.results;
  if (!results) return null;

  const goalName = GOAL_TABS.find((g) => g.id === results.goal)?.name ?? results.goal;
  const topCities = results.results.slice(0, MAX_CITIES_SHOWN);
  const topCountries = results.countries.slice(0, MAX_COUNTRIES_SHOWN);
  const topStars = topCities[0]?.ranked.stars ?? 1;
  const isMixed = topStars <= 3;

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
        <h2 style={{ margin: "0 0 6px", font: "600 30px var(--font-display)", color: "var(--color-ink)" }}>
          Your strongest places for {goalName}
        </h2>
        {isMixed ? (
          <p style={{ margin: "0 0 8px", font: "400 14px/1.5 var(--font-body)", color: "var(--color-muted)" }}>
            <strong style={{ color: "var(--color-ink)" }}>Your map is more mixed for this goal.</strong> These are
            the locations with the clearest signals, even though none are exceptionally strong in the current
            model.
          </p>
        ) : (
          <p style={{ margin: "0 0 8px", font: "400 14px var(--font-body)", color: "var(--color-muted)" }}>
            Based on the birth details and time range you entered.
          </p>
        )}
        <p style={{ margin: "0 0 20px", font: "400 13px/1.5 var(--font-body)", color: "var(--color-faint)" }}>
          The bar and label show how strongly a place fits {goalName}. Open a place to see how much that could shift
          if your birth time isn't exact.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
          {GOAL_TABS.map((g) => (
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

        {loading && (
          <p style={{ font: "400 13px var(--font-body)", color: "var(--color-muted)" }}>Recalculating…</p>
        )}

        {results.pattern && (
          <div
            style={{
              background: "var(--color-surface)",
              border: "1px solid rgba(226,138,80,0.3)",
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
              Your pattern
            </div>
            <div style={{ font: "500 15px/1.5 var(--font-display)", color: "var(--color-ink)" }}>
              {results.pattern}
            </div>
          </div>
        )}

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
          return (
            <div
              key={r.ranked.cityId}
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
                <StarRating stars={r.ranked.stars} score={r.ranked.internalScore} showLabel />
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
                    {[goalName.toUpperCase(), story.primaryTheme, ...story.secondaryThemes.slice(0, 1)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                  <div style={{ font: "400 14px/1.5 var(--font-body)", color: "#3E5865", marginTop: 10 }}>
                    {story.hook}
                  </div>
                </>
              )}
              <PillButton variant="accent" style={{ marginTop: 14 }} onClick={() => router.push(`/place/${r.ranked.cityId}`)}>
                Why {r.city.name}? →
              </PillButton>
            </div>
          );
        })}

        {topCountries.length > 0 && (
          <>
            <div
              style={{
                font: "600 12px var(--font-body)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-faint)",
                margin: "28px 0 12px"
              }}
            >
              Top countries
            </div>
            {topCountries.map((co) => (
              <div
                key={co.countryCode}
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  padding: "16px 18px",
                  marginBottom: 10
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                  <div style={{ font: "600 15px var(--font-body)", color: "var(--color-ink)" }}>
                    {results.countryNames[co.countryCode] ?? co.countryCode}
                  </div>
                  <div
                    style={{
                      font: "600 10px var(--font-body)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--color-accent-strong)",
                      background: "var(--color-tag-bg)",
                      borderRadius: 100,
                      padding: "3px 9px",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {co.narrative}
                  </div>
                </div>
                <p style={{ font: "400 12.5px/1.5 var(--font-body)", color: "var(--color-faint)", margin: "4px 0 10px" }}>
                  {NARRATIVE_COPY[co.narrative]}
                </p>
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
