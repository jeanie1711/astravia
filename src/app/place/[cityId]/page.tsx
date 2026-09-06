"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { StarRating } from "../../components/StarRating";
import { useJourney } from "../../journey/JourneyContext";
import { getArchetypeCopy } from "../../../interpretation/archetypes";
import { confidenceLabel } from "../../../interpretation/display";

const INFLUENCE_LABEL: Record<string, string> = {
  MC: "public life / career direction",
  IC: "home / roots / private foundation",
  ASC: "identity / how you meet the world",
  DSC: "relationships / significant others"
};

export default function CityStoryPage() {
  const router = useRouter();
  const params = useParams<{ cityId: string }>();
  const { journey, hydrated } = useJourney();
  const [techOpen, setTechOpen] = useState(false);

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
          <p style={{ font: "400 15px var(--font-body)", color: "var(--color-muted)" }}>
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "24px 28px 0" }}>
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.push("/results")}
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: "1px solid var(--color-border-strong)",
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            font: "16px sans-serif",
            cursor: "pointer"
          }}
        >
          ←
        </button>
      </div>

      <div style={{ padding: "16px 28px 0" }}>
        <div style={{ font: "600 12px var(--font-body)", letterSpacing: "0.05em", color: "var(--color-faint)" }}>
          {story.country}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 2 }}>
          <h1 style={{ margin: 0, font: "600 32px var(--font-display)", color: "var(--color-ink)" }}>
            {story.city}
          </h1>
          <StarRating
            stars={story.stars}
            score={ranked.internalScore}
            size={18}
            showLabel
            caption="Match strength"
          />
        </div>
        <div
          style={{
            font: "600 12px var(--font-body)",
            letterSpacing: "0.04em",
            color: "var(--color-accent-strong)",
            marginTop: 8
          }}
        >
          {[story.primaryTheme, ...story.secondaryThemes].filter(Boolean).join(" · ").toUpperCase()}
        </div>

        {story.archetypeId !== "UNCLASSIFIED" && (
          <span
            style={{
              display: "inline-block",
              marginTop: 12,
              padding: "5px 13px",
              borderRadius: 100,
              background: "var(--color-tag-bg)",
              color: "var(--color-accent-strong)",
              font: "600 11px var(--font-body)",
              letterSpacing: "0.05em",
              textTransform: "uppercase"
            }}
          >
            {archetypeCopy.name}
          </span>
        )}

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 10
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0 }} />
          <div style={{ font: "400 12.5px/1.4 var(--font-body)", color: "var(--color-muted)" }}>
            <strong style={{ color: "var(--color-ink)" }}>Confidence: {confidenceLabel(story.birthTimeConfidence)}.</strong>{" "}
            {story.confidenceExplanation}
          </div>
        </div>

        <SectionHeading>The short version</SectionHeading>
        <p style={{ margin: 0, font: "400 16px/1.65 var(--font-body)", color: "#3E5865" }}>{story.whyItStandsOut}</p>

        {(story.opportunities.length > 0 || story.tradeOffs.length > 0) && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              marginTop: 28
            }}
          >
            {story.opportunities.length > 0 && (
              <div
                style={{
                  background: "var(--color-sage-bg)",
                  borderRadius: 14,
                  padding: "16px 18px"
                }}
              >
                <div style={{ font: "600 13px var(--font-body)", color: "var(--color-ink)", marginBottom: 10 }}>
                  What may open up
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {story.opportunities.map((o, i) => (
                    <li key={i} style={{ font: "400 14px/1.5 var(--font-body)", color: "#3E5865", marginBottom: 4 }}>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {story.tradeOffs.length > 0 && (
              <div
                style={{
                  background: "var(--color-sun-bg)",
                  borderRadius: 14,
                  padding: "16px 18px"
                }}
              >
                <div style={{ font: "600 13px var(--font-body)", color: "var(--color-ink)", marginBottom: 10 }}>
                  What to watch
                </div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {story.tradeOffs.map((t, i) => (
                    <li key={i} style={{ font: "400 14px/1.5 var(--font-body)", color: "#3E5865", marginBottom: 4 }}>
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
            background: "var(--color-surface)",
            borderLeft: "3px solid var(--color-accent)",
            borderRadius: "0 10px 10px 0"
          }}
        >
          <div
            style={{
              font: "600 11px var(--font-body)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-muted)",
              marginBottom: 6
            }}
          >
            What life here might feel like
          </div>
          <p style={{ margin: 0, font: "600 17px/1.5 var(--font-display)", color: "var(--color-ink)" }}>
            {story.howItMayFeel}
          </p>
        </div>

        {story.bestFor.length > 0 && (
          <>
            <SectionHeading>Best suited for</SectionHeading>
            <p style={{ margin: "0 0 10px", font: "400 13px/1.5 var(--font-body)", color: "var(--color-faint)" }}>
              People often turn to a placement like this for:
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {story.bestFor.map((b) => (
                <div
                  key={b}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 100,
                    background: "var(--color-tag-bg)",
                    font: "600 12px var(--font-body)",
                    color: "var(--color-ink)"
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
            <SectionHeading>Why Astravia picked it</SectionHeading>
            <p style={{ margin: "0 0 10px", font: "400 13px/1.5 var(--font-body)", color: "var(--color-faint)" }}>
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
                    borderBottom: "1px solid var(--color-border)"
                  }}
                  title={label === "Paran" ? `A paran with ${INFLUENCE_LABEL[inf.angle]}` : INFLUENCE_LABEL[inf.angle]}
                >
                  <div style={{ font: "15px var(--font-body)", color: "var(--color-ink)" }}>
                    {inf.body}–{inf.angle}
                  </div>
                  <div
                    style={{
                      font: "600 11px var(--font-body)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--color-faint)"
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
                  style={{
                    marginTop: 20,
                    border: "none",
                    background: "none",
                    color: "var(--color-accent-strong)",
                    font: "600 13px var(--font-body)",
                    cursor: "pointer",
                    padding: 0
                  }}
                >
                  {techOpen ? "Hide the astrology ↑" : "Explore the astrology ↓"}
                </button>
                {techOpen && (
                  <div style={{ marginTop: 12 }}>
                    {story.technicalDetails.map((t) => (
                      <div key={t.line} style={{ marginBottom: 10 }}>
                        <div style={{ font: "600 13px var(--font-body)", color: "var(--color-ink)" }}>{t.line}</div>
                        <div style={{ font: "400 12px ui-monospace, monospace", color: "var(--color-muted)", marginTop: 2 }}>
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
          <PillButton variant="secondary" fullWidth={false} onClick={share} style={{ padding: "15px 20px" }}>
            Share
          </PillButton>
        </div>

        <p style={{ marginTop: 28, font: "400 12px/1.6 var(--font-body)", color: "var(--color-faint)" }}>
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
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--color-muted)"
      }}
    >
      {children}
    </h3>
  );
}
