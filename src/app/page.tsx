"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PillButton } from "./components/PillButton";
import { Wordmark } from "./components/Wordmark";
import { anglesFor, planetsFor } from "./content/astroExplainer";
import { useJourney } from "./journey/JourneyContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useTranslation } from "../i18n/useTranslation";
import type { ScorableGoal } from "../scoring/types";

const HOME_GOAL_ACCENT: Record<ScorableGoal, string> = {
  CAREER: "var(--astravia-career-blue)",
  LOVE: "var(--astravia-relationships-coral)",
  HOME: "var(--astravia-home-green)",
  GROWTH: "var(--astravia-growth-violet)"
};

const GOAL_ORDER: ScorableGoal[] = ["CAREER", "LOVE", "HOME", "GROWTH"];

const CARD_POSITIONS = ["one", "two", "three"] as const;

export default function LandingPage() {
  const router = useRouter();
  const { resetJourney } = useJourney();
  const { language } = useLanguage();
  const t = useTranslation();
  const angles = anglesFor(language);
  const planets = planetsFor(language);
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
  const previewCities = t.home.previewCities[activeGoal];

  return (
    <div className="astravia-home">
      <header className="astravia-home-shell astravia-home-nav">
        <a href="#astravia-top" aria-label={t.home.navHomeAriaLabel} style={{ textDecoration: "none" }}>
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
          {t.home.navMethodLink}
        </a>
      </header>

      <main id="astravia-top">
        <section className="astravia-home-shell astravia-home-hero">
          <div>
            <span className="astravia-home-eyebrow">{t.home.heroEyebrow}</span>
            <h1 className="astravia-home-h1">
              {t.home.heroH1Before}
              <em>{t.home.heroH1Em}</em>
            </h1>
            <p className="astravia-home-lede">{t.home.heroLede}</p>

            <span className="astravia-home-area-label">{t.home.areaLabel}</span>
            <div className="astravia-home-area-pills" role="group" aria-label={t.home.areaGroupAriaLabel}>
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
                    {t.home.goalLabels[goal]}
                  </button>
                );
              })}
            </div>

            <div className="astravia-home-cta-row">
              <PillButton className="astravia-home-primary-cta" fullWidth={false} onClick={start}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 22 }}>
                  {t.home.cta}
                  <span className="astravia-home-arrow-bubble" aria-hidden="true">
                    ↗
                  </span>
                </span>
              </PillButton>
            </div>
          </div>

          <div className="astravia-home-visual" aria-label={t.home.visualAriaLabel}>
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
              <span className="astravia-home-landscape-label">{t.home.previewLabel}</span>
            </div>

            {previewCities.map((preview, i) => (
              <article
                key={`${activeGoal}-${CARD_POSITIONS[i]}`}
                className={`astravia-home-city-card ${CARD_POSITIONS[i]} astravia-stagger`}
                style={{ ["--stagger-index" as string]: i }}
              >
                <div className="rank">{t.home.cardRanks[i]}</div>
                <h3>{preview.city}</h3>
                {preview.copy && <p>{preview.copy}</p>}
                <div className="astravia-home-scoreline">
                  <span className="astravia-home-stars" style={{ color: accent }}>
                    {preview.stars}
                  </span>
                  <span className="astravia-home-area-name">{t.home.goalLabels[activeGoal]}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="astravia-home-shell astravia-home-methodology" id="astravia-method">
          <div className="astravia-home-method-note">
            <div>
              <strong>{t.home.methodologyTitle}</strong>
              <p>{t.home.methodologyBlurb}</p>
            </div>
            <a
              href="#astravia-method"
              onClick={(e) => {
                e.preventDefault();
                setShowHowItWorks((v) => !v);
              }}
            >
              {showHowItWorks ? t.home.methodologyHide : t.home.methodologyShow}
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
                {t.home.explainerIntro}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {angles.map((a) => (
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
                {t.home.explainerMid}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {planets.map((p) => (
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
                {t.home.explainerDisclaimer}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
