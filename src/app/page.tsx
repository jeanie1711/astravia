"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PillButton } from "./components/PillButton";
import { Wordmark } from "./components/Wordmark";
import { ANGLES, PLANETS } from "./content/astroExplainer";
import { useJourney } from "./journey/JourneyContext";
import type { ScorableGoal } from "../scoring/types";

// Home screen redesign (2026-09-11 handoff): the four life-area pills use
// the app's real ScorableGoal identifiers, but their labels/accents here
// are this screen's own approved copy/colors -- distinct from GOAL_LABEL/
// GOAL_COLOR (goalTheme.ts), which stay unchanged for results/report pages.
const HOME_GOAL_LABEL: Record<ScorableGoal, string> = {
  CAREER: "Career",
  LOVE: "Relationships",
  HOME: "Home & belonging",
  GROWTH: "Personal growth"
};

const HOME_GOAL_ACCENT: Record<ScorableGoal, string> = {
  CAREER: "var(--astravia-career-blue)",
  LOVE: "var(--astravia-relationships-coral)",
  HOME: "var(--astravia-home-green)",
  GROWTH: "var(--astravia-growth-violet)"
};

const GOAL_ORDER: ScorableGoal[] = ["CAREER", "LOVE", "HOME", "GROWTH"];

// Illustrative-only preview content (README: "The HTML reference contains
// illustrative city names and example copy only... The demo data must not
// replace real application logic"). Real per-city results require birth
// details, which this screen deliberately doesn't ask for yet -- the
// "EXAMPLE DISCOVERY" label makes that explicit rather than implying these
// are the user's own results.
type PreviewCity = { city: string; copy?: string; stars: string };
const HOME_PREVIEW: Record<ScorableGoal, PreviewCity[]> = {
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
};

const CARD_POSITIONS = ["one", "two", "three"] as const;
const CARD_RANKS = ["01 · TOP MATCH", "02", "03"];

export default function LandingPage() {
  const router = useRouter();
  const { resetJourney } = useJourney();
  const [activeGoal, setActiveGoal] = useState<ScorableGoal>("CAREER");
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  function start() {
    resetJourney({ goal: activeGoal, initialGoal: activeGoal });
    router.push("/explore/birth-details");
  }

  function openHowItWorks() {
    setShowHowItWorks(true);
    document.getElementById("astravia-method")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const accent = HOME_GOAL_ACCENT[activeGoal];
  const previewCities = HOME_PREVIEW[activeGoal];

  return (
    <div className="astravia-home">
      <header className="astravia-home-shell astravia-home-nav">
        <a href="#astravia-top" aria-label="Astravia home" style={{ textDecoration: "none" }}>
          <Wordmark size={17} />
        </a>
        <a
          className="astravia-home-method-link"
          href="#astravia-method"
          onClick={(e) => {
            e.preventDefault();
            openHowItWorks();
          }}
        >
          How it works
        </a>
      </header>

      <main id="astravia-top">
        <section className="astravia-home-shell astravia-home-hero">
          <div>
            <span className="astravia-home-eyebrow">
              Have you ever wondered whether the place you live truly fits you, or whether somewhere else in the
              world might?
            </span>
            <h1 className="astravia-home-h1">
              Somewhere in the world, a place may fit you <em>better.</em>
            </h1>
            <p className="astravia-home-lede">
              Explore the cities connected to your birth map, and discover where career, relationships, belonging or
              personal growth may feel more supported.
            </p>

            <span className="astravia-home-area-label">What would you like to explore?</span>
            <div className="astravia-home-area-pills" role="group" aria-label="Choose a life area">
              {GOAL_ORDER.map((goal) => {
                const isActive = goal === activeGoal;
                return (
                  <button
                    key={goal}
                    type="button"
                    className={`astravia-home-area-pill${isActive ? " active" : ""}`}
                    style={isActive ? { background: HOME_GOAL_ACCENT[goal] } : undefined}
                    aria-pressed={isActive}
                    onClick={() => setActiveGoal(goal)}
                  >
                    {HOME_GOAL_LABEL[goal]}
                  </button>
                );
              })}
            </div>

            <div className="astravia-home-cta-row">
              <PillButton className="astravia-home-primary-cta" fullWidth={false} onClick={start}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 22 }}>
                  Find my places
                  <span className="astravia-home-arrow-bubble" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </PillButton>
            </div>
          </div>

          <div className="astravia-home-visual" aria-label="Example Astravia city discovery">
            <div className="astravia-home-sun-disc" aria-hidden="true" />
            <div className="astravia-home-orbit" aria-hidden="true" />
            <div className="astravia-home-landscape" aria-hidden="true">
              <Image
                src="/astravia-landscape.png"
                alt=""
                fill
                style={{ objectFit: "cover", objectPosition: "center bottom" }}
                priority
              />
              <span className="astravia-home-landscape-label">EXAMPLE DISCOVERY</span>
            </div>

            {previewCities.map((preview, i) => (
              <article
                key={`${activeGoal}-${CARD_POSITIONS[i]}`}
                className={`astravia-home-city-card ${CARD_POSITIONS[i]} astravia-stagger`}
                style={{ ["--stagger-index" as string]: i }}
              >
                <div className="rank">{CARD_RANKS[i]}</div>
                <h3>{preview.city}</h3>
                {preview.copy && <p>{preview.copy}</p>}
                <div className="astravia-home-scoreline">
                  <span className="astravia-home-stars" style={{ color: accent }}>
                    {preview.stars}
                  </span>
                  <span className="astravia-home-area-name">{HOME_GOAL_LABEL[activeGoal]}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="astravia-home-shell astravia-home-methodology" id="astravia-method">
          <div className="astravia-home-method-note">
            <div>
              <strong>From your birth moment to places worth exploring.</strong>
              <p>
                Astravia translates astrocartography patterns into clear possibilities for reflection and
                exploration, not prediction.
              </p>
            </div>
            <a
              href="#astravia-method"
              onClick={(e) => {
                e.preventDefault();
                setShowHowItWorks((v) => !v);
              }}
            >
              {showHowItWorks ? "Hide how astrocartography works ↑" : "How astrocartography works →"}
            </a>
          </div>

          {showHowItWorks && (
            <div className="astravia-home-explainer">
              <p
                style={{
                  font: "400 15px/1.7 var(--font-dm-sans)",
                  color: "var(--astravia-ink-soft)",
                  maxWidth: 640,
                  margin: "0 auto 24px"
                }}
              >
                Imagine the exact moment you were born, looking up at the sky: each planet sits at some position
                relative to the horizon and the sky above you. Four points mark the most significant of these
                positions.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {ANGLES.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      background: "var(--astravia-ivory)",
                      border: "1px solid var(--astravia-line)",
                      borderRadius: "var(--astravia-card-radius)",
                      padding: "18px 20px"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                      <span style={{ font: "700 20px var(--font-fraunces)", color: "var(--astravia-ink)" }}>
                        {a.id}
                      </span>
                      <span style={{ font: "600 12px var(--font-dm-sans)", color: "var(--astravia-ink-soft)" }}>
                        {a.fullName}
                      </span>
                    </div>
                    <p style={{ font: "400 13px/1.5 var(--font-dm-sans)", color: "var(--astravia-ink-soft)", margin: "8px 0 6px" }}>
                      {a.position}
                    </p>
                    <p style={{ font: "600 13px var(--font-dm-sans)", color: "var(--astravia-ink)", margin: 0 }}>
                      {a.meaning}
                    </p>
                  </div>
                ))}
              </div>

              <p
                style={{
                  font: "400 14px/1.7 var(--font-dm-sans)",
                  color: "var(--astravia-ink-soft)",
                  maxWidth: 640,
                  margin: "28px auto 16px"
                }}
              >
                Astrocartography draws one line on the world map for every planet-and-angle pair: everywhere on
                Earth where, at your exact birth moment, that planet sat at that exact position. Astravia traces
                ten planets against these four points, each carrying its own traditional theme:
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {PLANETS.map((p) => (
                  <div
                    key={p.name}
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      background: "var(--astravia-ivory)",
                      border: "1px solid var(--astravia-line)",
                      borderRadius: "var(--astravia-card-radius)",
                      padding: "9px 12px"
                    }}
                  >
                    <span style={{ font: "700 14px var(--font-fraunces)", color: "var(--astravia-overall)", width: 14, flexShrink: 0 }}>
                      {p.symbol}
                    </span>
                    <span style={{ font: "700 12.5px var(--font-fraunces)", color: "var(--astravia-ink)", flexShrink: 0 }}>
                      {p.name}
                    </span>
                    <span style={{ font: "400 11px var(--font-dm-sans)", color: "var(--astravia-ink-soft)", lineHeight: 1.3 }}>
                      {p.theme}
                    </span>
                  </div>
                ))}
              </div>

              <p
                style={{
                  font: "400 12px/1.6 var(--font-dm-sans)",
                  color: "var(--astravia-ink-soft)",
                  maxWidth: 640,
                  margin: "28px auto 0"
                }}
              >
                Astrocartography is an interpretive astrology practice, not a scientifically validated method for
                predicting life outcomes. Use these results for reflection and exploration alongside practical
                factors.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
