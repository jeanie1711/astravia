"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { SaveButton } from "../../components/SaveButton";
import { ScreenShell } from "../../components/ScreenShell";
import { StarRating } from "../../components/StarRating";
import { useSavedPlaces } from "../../components/useSavedPlaces";
import { useJourney } from "../../journey/JourneyContext";
import { getArchetypeCopy } from "../../../interpretation/archetypes";
import { confidenceLabel } from "../../../interpretation/display";

const INFLUENCE_LABEL: Record<string, string> = {
  MC: "public life / career direction",
  IC: "home / roots / private foundation",
  ASC: "identity / how you meet the world",
  DSC: "relationships / significant others"
};

// Detail-page order per product feedback 2026-09-07, §16: city+country,
// match strength and confidence, the short version, opportunity/watch-out,
// feel, best-for, key influences (with technical astrology collapsed
// inside), then save/share/return.
export default function CityStoryPage() {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const { journey, hydrated } = useJourney();
  const [techOpen, setTechOpen] = useState(false);
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
            We couldn't find that result -- it may have come from a different search. Head back to your places.
          </p>
          <PillButton onClick={() => router.push("/results")} style={{ marginTop: 16 }}>
            Back to your places
          </PillButton>
        </div>
      </ScreenShell>
    );
  }

  const archetypeCopy = getArchetypeCopy(story.archetypeId);

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
        <div style={{ font: "600 12px var(--font-body)", letterSpacing: "0.04em", color: "var(--astravia-text-subtle)" }}>
          {story.country}
        </div>
        <h1 style={{ margin: "2px 0 0", font: "600 30px var(--font-display)", color: "var(--astravia-ink)" }}>
          {story.city}
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14, flexWrap: "wrap" }}>
          <StarRating stars={story.stars} score={ranked.internalScore} size={18} showLabel />
          <span style={{ font: "600 12px var(--font-body)", color: "var(--astravia-text-secondary)" }}>
            Confidence: {confidenceLabel(story.birthTimeConfidence)}
          </span>
        </div>
        <p style={{ margin: "6px 0 0", font: "400 12px/1.5 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
          {story.confidenceExplanation}
        </p>

        <div
          style={{
            font: "600 12px var(--font-body)",
            letterSpacing: "0.02em",
            color: "var(--astravia-ink)",
            marginTop: 14
          }}
        >
          {[story.primaryTheme, ...story.secondaryThemes].filter(Boolean).join(" · ")}
        </div>

        {story.archetypeId !== "UNCLASSIFIED" && (
          <span
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "5px 13px",
              borderRadius: "var(--astravia-radius-pill)",
              background: "var(--astravia-surface-alt)",
              color: "var(--astravia-ink)",
              font: "600 11px var(--font-body)",
              letterSpacing: "0.04em",
              textTransform: "uppercase"
            }}
          >
            {archetypeCopy.name}
          </span>
        )}

        <SectionHeading>The short version</SectionHeading>
        <p style={{ margin: 0, font: "400 16px/1.65 var(--font-body)", color: "var(--astravia-ink)" }}>
          {story.whyItStandsOut}
        </p>

        {(story.opportunities.length > 0 || story.tradeOffs.length > 0) && (
          <div className="astravia-two-col" style={{ marginTop: 28 }}>
            {story.opportunities.length > 0 && (
              <div
                style={{
                  background: "var(--astravia-surface-alt)",
                  borderRadius: "var(--astravia-radius-control)",
                  padding: "16px 18px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    font: "600 13px var(--font-body)",
                    color: "var(--astravia-ink)",
                    marginBottom: 10
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--astravia-home)" }}>
                    ＋
                  </span>
                  What may open up
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {story.opportunities.map((o, i) => (
                    <li
                      key={i}
                      style={{ font: "400 14px/1.5 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 4 }}
                    >
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {story.tradeOffs.length > 0 && (
              <div
                style={{
                  background: "var(--astravia-surface-alt)",
                  borderRadius: "var(--astravia-radius-control)",
                  padding: "16px 18px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    font: "600 13px var(--font-body)",
                    color: "var(--astravia-ink)",
                    marginBottom: 10
                  }}
                >
                  <span aria-hidden="true" style={{ color: "var(--astravia-love)" }}>
                    ◆
                  </span>
                  What to watch
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {story.tradeOffs.map((t, i) => (
                    <li
                      key={i}
                      style={{ font: "400 14px/1.5 var(--font-body)", color: "var(--astravia-ink)", marginBottom: 4 }}
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div
          style={{
            margin: "28px 0",
            padding: "18px 20px",
            background: "var(--astravia-surface)",
            border: "1px solid var(--astravia-border)",
            borderLeft: "3px solid var(--astravia-ink)",
            borderRadius: "0 var(--astravia-radius-control) var(--astravia-radius-control) 0"
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
            What life here might feel like
          </div>
          <p style={{ margin: 0, font: "600 17px/1.5 var(--font-display)", color: "var(--astravia-ink)" }}>
            {story.howItMayFeel}
          </p>
        </div>

        {story.bestFor.length > 0 && (
          <>
            <SectionHeading>Best suited for</SectionHeading>
            <p style={{ margin: "0 0 10px", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
              People often turn to a placement like this for:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {story.bestFor.map((b) => (
                <div
                  key={b}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "var(--astravia-radius-pill)",
                    background: "var(--astravia-surface-alt)",
                    font: "600 12px var(--font-body)",
                    color: "var(--astravia-ink)"
                  }}
                >
                  {b}
                </div>
              ))}
            </div>
          </>
        )}

        {(story.primaryInfluence || story.paranInfluence || story.secondaryInfluences.length > 0) && (
          <>
            <SectionHeading>Key influences</SectionHeading>
            <p style={{ margin: "0 0 10px", font: "400 13px/1.5 var(--font-body)", color: "var(--astravia-text-subtle)" }}>
              Based on which of your planetary lines fall closest to {story.city}:
            </p>
            {[
              ...(story.primaryInfluence ? [{ inf: story.primaryInfluence, label: "Primary" }] : []),
              // Named as its own row, distinct from "Secondary" -- a paran is
              // a qualitatively different kind of signal (two bodies
              // simultaneously angular at a shared latitude), not just
              // another nearby line (06-interpretation-library.md §5).
              ...(story.paranInfluence ? [{ inf: story.paranInfluence, label: "Paran" }] : []),
              ...story.secondaryInfluences.map((inf) => ({ inf, label: "Secondary" }))
            ].map(({ inf, label }) => (
              <div
                key={`${label}-${inf.body}-${inf.angle}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--astravia-border)"
                }}
                title={label === "Paran" ? `A paran with ${INFLUENCE_LABEL[inf.angle]}` : INFLUENCE_LABEL[inf.angle]}
              >
                <div style={{ font: "15px var(--font-body)", color: "var(--astravia-ink)" }}>
                  {inf.body}–{inf.angle}
                </div>
                <div
                  style={{
                    font: "600 11px var(--font-body)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--astravia-text-subtle)"
                  }}
                >
                  {label}
                </div>
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
        margin: "28px 0 10px",
        font: "600 13px var(--font-body)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: "var(--astravia-text-subtle)"
      }}
    >
      {children}
    </h3>
  );
}
