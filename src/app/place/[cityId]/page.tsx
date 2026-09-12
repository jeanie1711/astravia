"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PaywallModal } from "../../components/PaywallModal";
import { PillButton } from "../../components/PillButton";
import { SaveButton } from "../../components/SaveButton";
import { ScreenShell } from "../../components/ScreenShell";
import { matchLabel, StarRating } from "../../components/StarRating";
import { useSavedPlaces } from "../../components/useSavedPlaces";
import { useJourney } from "../../journey/JourneyContext";
import { bodySymbol, confidenceLabel } from "../../../interpretation/display";
import { capitalize, SHORT_GOAL_LABEL } from "../../../interpretation/voice";

// Detail-page order per product feedback 2026-09-07, §16, restructured
// 2026-09-13 for a richer narrative: city+country,
// match strength and confidence, the short version, opportunity/watch-out,
// feel, best-for, key influences (with technical astrology collapsed
// inside), then save/share/return.
export default function CityStoryPage() {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const { journey, hydrated } = useJourney();
  const [techOpen, setTechOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { saved, toggle: toggleSaved } = useSavedPlaces();

  const results = journey.results;
  const story = results?.stories[params.cityId];
  const ranked = [...(results?.results ?? []), ...(results?.extraResults ?? [])].find(
    (r) => r.ranked.cityId === params.cityId
  )?.ranked;

  if (!hydrated) {
    return <ScreenShell maxWidth={640}>{null}</ScreenShell>;
  }

  if (!results || !story || !ranked) {
    return (
      <ScreenShell maxWidth={640}>
        <BackHeader stepLabel="City story" onBack={() => router.push("/results")} />
        <div style={{ padding: "24px" }}>
          <p style={{ font: "400 15px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            We couldn't find that result. It may have come from a different search. Head back to your places.
          </p>
          <PillButton onClick={() => router.push("/results")} style={{ marginTop: 16 }}>
            Back to your places
          </PillButton>
        </div>
      </ScreenShell>
    );
  }

  // Freemium gate (docs/DECISIONS.md, 2026-09-09): only the #1 result is
  // free. A savvy user could still reach a locked city's URL directly
  // (bookmark, back button), so this page enforces the gate itself rather
  // than relying only on the results page hiding the link.
  const unlocked = journey.unlocked === true;
  const freeCityId = results.results[0]?.ranked.cityId;
  const isFree = unlocked || params.cityId === freeCityId;

  if (!isFree) {
    return (
      <ScreenShell maxWidth={640}>
        <BackHeader stepLabel="City story" onBack={() => router.push("/results")} />
        <div style={{ padding: "24px" }}>
          <div style={{ font: "600 12px var(--font-body)", letterSpacing: "0.04em", color: "var(--astravia-text-subtle)" }}>
            {story.country}
          </div>
          <h1 style={{ margin: "2px 0 0", font: "600 30px var(--font-display)", color: "var(--astravia-ink)" }}>
            {story.city}
          </h1>
          <div style={{ display: "flex", alignItems: "center", marginTop: 14 }}>
            <StarRating stars={story.stars} score={ranked.internalScore} size={18} showLabel />
          </div>
          <p style={{ margin: "18px 0 0", font: "400 15px/1.6 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            {story.hook}
          </p>
          <div
            style={{
              marginTop: 24,
              background: "var(--astravia-surface)",
              border: "1px solid var(--astravia-border)",
              borderRadius: "var(--astravia-radius-card)",
              padding: "20px",
              textAlign: "center"
            }}
          >
            <p style={{ margin: "0 0 14px", font: "500 15px/1.5 var(--font-display)", color: "var(--astravia-ink)" }}>
              The full story for {story.city} is part of the full report.
            </p>
            <PillButton className="astravia-btn-shine" onClick={() => setShowPaywall(true)}>
              Unlock full report
            </PillButton>
          </div>
        </div>
        <PaywallModal
          open={showPaywall}
          context={`See ${story.city}, ${story.country}`}
          onClose={() => setShowPaywall(false)}
        />
      </ScreenShell>
    );
  }

  function share() {
    if (navigator.share) {
      navigator.share({ text: story!.shareText }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(story!.shareText).then(() => alert(`Copied: ${story!.shareText}`));
    }
  }

  return (
    <ScreenShell maxWidth={640}>
      <BackHeader
        onBack={() => router.push("/results")}
        right={<SaveButton saved={saved.has(params.cityId)} onToggle={() => toggleSaved(params.cityId)} size={20} />}
      />

      <div style={{ padding: "16px 24px 0" }}>
        {/* A vivid, saturated orange -- distinct from both the goal accent
            colors (used on the headings below) and the app's gold/coral
            tokens -- so the city name reads as its own clear highlight. */}
        <h1 style={{ margin: 0, font: "600 34px var(--font-display)", color: "#c85f17" }}>{story.city}</h1>

        <div style={{ marginTop: 10 }}>
          <StarRating
            stars={story.stars}
            score={ranked.internalScore}
            size={18}
            showLabel
            label={matchLabel(story.stars, SHORT_GOAL_LABEL[story.goal])}
          />
        </div>

        <div
          style={{
            marginTop: 10,
            font: "700 12px var(--font-body)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--astravia-text-subtle)"
          }}
        >
          {[SHORT_GOAL_LABEL[story.goal], story.primaryTheme, ...story.secondaryThemes]
            .filter(Boolean)
            .slice(0, 3)
            .join(" · ")}
        </div>

        {story.tagline && (
          <p
            style={{
              margin: "16px 0 0",
              font: "500 italic 19px/1.5 var(--font-display)",
              color: "var(--astravia-ink)"
            }}
          >
            {story.tagline}
          </p>
        )}

        <div style={{ marginTop: 18 }}>
          <div style={{ font: "600 13px var(--font-body)", color: "var(--astravia-ink)" }}>
            Birth-time precision: {confidenceLabel(story.birthTimeConfidence)}
          </div>
          <p style={{ margin: "2px 0 0", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            {story.confidenceExplanation}
          </p>
        </div>

        <SectionHeading>Why {story.city} might fit you</SectionHeading>
        <div style={{ font: "400 16px/1.65 var(--font-body)", color: "var(--astravia-ink)", whiteSpace: "pre-line" }}>
          {story.whyItStandsOut}
        </div>

        {story.opportunities.length > 0 && (
          <>
            <SectionHeading>What could grow here</SectionHeading>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {story.opportunities.map((o, i) => (
                <li key={i} style={{ font: "400 15px/1.6 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 4 }}>
                  {capitalize(o)}
                </li>
              ))}
            </ul>
          </>
        )}

        {story.tradeOffs.length > 0 && (
          <>
            <SectionHeading>Where it may stretch you</SectionHeading>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {story.tradeOffs.map((t, i) => (
                <li key={i} style={{ font: "400 15px/1.6 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 4 }}>
                  {capitalize(t)}
                </li>
              ))}
            </ul>
          </>
        )}

        <SectionHeading>What life here might feel like</SectionHeading>
        <div
          style={{
            padding: "18px 20px",
            background: "var(--astravia-surface)",
            border: "1px solid var(--astravia-border)",
            borderLeft: "3px solid var(--astravia-ink)",
            borderRadius: "0 var(--astravia-radius-control) var(--astravia-radius-control) 0"
          }}
        >
          <p style={{ margin: 0, font: "600 17px/1.5 var(--font-display)", color: "var(--astravia-ink)" }}>
            {story.howItMayFeel}
          </p>
          {story.howItMayFeelDetail && (
            <p style={{ margin: "10px 0 0", font: "400 14px/1.6 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
              {story.howItMayFeelDetail}
            </p>
          )}
        </div>

        {story.bestFor.length > 0 && (
          <>
            <SectionHeading>Best for</SectionHeading>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {story.bestFor.map((b, i) => (
                <li key={i} style={{ font: "400 15px/1.6 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 4 }}>
                  {capitalize(b)}
                </li>
              ))}
            </ul>
          </>
        )}

        {story.influenceDetails.length > 0 && (
          <>
            <SectionHeading>The astrology behind this match</SectionHeading>
            <p style={{ margin: "0 0 14px", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
              These are the strongest influences shaping your {story.city} result:
            </p>
            {story.influenceDetails.map((d) => (
              <div key={`${d.role}-${d.body}-${d.angle}`} style={{ padding: "10px 0", borderBottom: "1px solid var(--astravia-border)" }}>
                <div style={{ font: "600 14px var(--font-body)", color: "var(--astravia-ink)" }}>
                  <span aria-hidden="true" style={{ marginRight: 6 }}>
                    {bodySymbol(d.body)}
                  </span>
                  {d.body}–{d.angle}
                  <span
                    style={{
                      marginLeft: 8,
                      font: "600 11px var(--font-body)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--astravia-text-subtle)"
                    }}
                  >
                    · {d.role} influence
                  </span>
                </div>
                <p style={{ margin: "3px 0 0", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
                  {d.description}
                </p>
              </div>
            ))}

            {story.technicalDetails.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setTechOpen((v) => !v)}
                  aria-expanded={techOpen}
                  style={{
                    marginTop: 20,
                    border: "none",
                    background: "none",
                    color: "var(--astravia-ink)",
                    font: "600 13px var(--font-body)",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                    textUnderlineOffset: 3
                  }}
                >
                  {techOpen ? "Hide the astrology ↑" : "Explore the astrology ↓"}
                </button>
                {techOpen && (
                  <div style={{ marginTop: 12 }}>
                    {story.technicalDetails.map((t) => (
                      <div key={t.line} style={{ marginBottom: 10 }}>
                        <div style={{ font: "600 13px var(--font-body)", color: "var(--astravia-ink)" }}>{t.line}</div>
                        <div
                          style={{
                            font: "400 12px ui-monospace, monospace",
                            color: "var(--astravia-text-secondary)",
                            marginTop: 2
                          }}
                        >
                          Closest distance: {Math.round(t.distanceKm)} km · Birth-time scenarios:{" "}
                          {t.scenarioDistancesKm.map((d) => Math.round(d)).join(" / ")} km
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 32 }}>
          <PillButton fullWidth={false} style={{ flex: 1 }} onClick={() => router.push("/results")}>
            Explore another place
          </PillButton>
          <PillButton variant="secondary" fullWidth={false} onClick={share} style={{ padding: "0 20px" }}>
            Share
          </PillButton>
        </div>

        <p style={{ marginTop: 28, font: "400 12px/1.6 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
          Astrocartography is an interpretive astrology practice, not a scientifically validated method for
          predicting life outcomes. Use these results for reflection and exploration alongside practical factors.
        </p>
      </div>
    </ScreenShell>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: "40px 0 14px",
        paddingTop: 24,
        borderTop: "1px solid var(--astravia-border)",
        font: "600 21px var(--font-display)",
        color: "var(--astravia-ink)"
      }}
    >
      {children}
    </h3>
  );
}
