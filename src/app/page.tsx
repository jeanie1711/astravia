"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenShell } from "./components/ScreenShell";
import { PillButton } from "./components/PillButton";
import { Wordmark } from "./components/Wordmark";
import { useJourney } from "./journey/JourneyContext";

const PLANETS: Array<{ symbol: string; name: string; theme: string }> = [
  { symbol: "☉", name: "Sun", theme: "identity, vitality, recognition" },
  { symbol: "☽", name: "Moon", theme: "emotional life, instinct, care" },
  { symbol: "☿", name: "Mercury", theme: "communication, ideas, curiosity" },
  { symbol: "♀", name: "Venus", theme: "attraction, harmony, connection" },
  { symbol: "♂", name: "Mars", theme: "drive, action, assertiveness" },
  { symbol: "♃", name: "Jupiter", theme: "growth, opportunity, optimism" },
  { symbol: "♄", name: "Saturn", theme: "responsibility, structure, discipline" },
  { symbol: "♅", name: "Uranus", theme: "independence, change, innovation" },
  { symbol: "♆", name: "Neptune", theme: "imagination, sensitivity, ideals" },
  { symbol: "♇", name: "Pluto", theme: "transformation, intensity, power" }
];

const ANGLES: Array<{ id: string; fullName: string; position: string; meaning: string }> = [
  {
    id: "MC",
    fullName: "Medium Coeli",
    position: "The highest point in the sky, directly overhead.",
    meaning: "Career, reputation, and public life"
  },
  {
    id: "IC",
    fullName: "Imum Coeli",
    position: "The point opposite MC, directly underfoot.",
    meaning: "Home, roots, and private life"
  },
  {
    id: "ASC",
    fullName: "Ascendant",
    position: "The eastern horizon, where a planet is rising.",
    meaning: "Identity, and how you show up in the world"
  },
  {
    id: "DSC",
    fullName: "Descendant",
    position: "The western horizon, where a planet is setting.",
    meaning: "Relationships, and the people around you"
  }
];

// Homepage hierarchy per product feedback 2026-09-07, §9: lead with the
// outcome, not the mechanism. MC/IC/ASC/DSC and the astrocartography
// mechanics move behind a collapsed disclosure so a first-time visitor
// isn't asked to understand astrology before deciding whether to start.
export default function LandingPage() {
  const router = useRouter();
  const { resetJourney } = useJourney();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  function start() {
    resetJourney();
    router.push("/explore/birth-details");
  }

  return (
    <ScreenShell maxWidth={640} showFooter={false}>
      <div style={{ textAlign: "center", padding: "48px 24px 0" }}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Wordmark size={16} />
        </div>
        <h1
          style={{
            font: "600 38px/1.25 var(--font-display)",
            color: "var(--astravia-ink)",
            margin: "22px 0 0"
          }}
        >
          Where in the world might you thrive?
        </h1>
        <p
          style={{
            font: "400 16px/1.6 var(--font-body)",
            color: "var(--astravia-text-secondary)",
            margin: "16px auto 28px",
            maxWidth: 440
          }}
        >
          Discover places that may support your career, relationships, sense of home and personal growth, based on
          your birth map.
        </p>
        <div style={{ maxWidth: 300, margin: "0 auto" }}>
          <PillButton onClick={start}>Discover my places</PillButton>
        </div>
        <p style={{ font: "400 13px var(--font-body)", color: "var(--astravia-text-subtle)", marginTop: 14 }}>
          Free · No account needed · About 2 minutes
        </p>
      </div>

      <div aria-hidden="true" style={{ marginTop: 40, lineHeight: 0 }}>
        <Image
          src="/astravia-footer.png"
          alt=""
          width={1983}
          height={793}
          style={{ width: "100%", height: "auto" }}
          priority
        />
      </div>

      <div style={{ padding: "40px 24px 0" }}>
        <h2
          style={{
            font: "600 22px var(--font-display)",
            color: "var(--astravia-ink)",
            textAlign: "center",
            margin: "0 auto 12px",
            maxWidth: 440
          }}
        >
          How it works
        </h2>
        <p
          style={{
            font: "400 15px/1.7 var(--font-body)",
            color: "var(--astravia-text-secondary)",
            maxWidth: 460,
            margin: "0 auto 16px",
            textAlign: "center"
          }}
        >
          Your birth moment creates a map of planetary lines around the world. Astravia looks for cities near your
          strongest patterns and translates them into plain-language possibilities.
        </p>
        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => setShowHowItWorks((v) => !v)}
            aria-expanded={showHowItWorks}
            style={{
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
            {showHowItWorks ? "Hide how astrocartography works ↑" : "How astrocartography works →"}
          </button>
        </div>

        {showHowItWorks && (
          <div style={{ marginTop: 28 }}>
            <p
              style={{
                font: "400 15px/1.7 var(--font-body)",
                color: "var(--astravia-text-secondary)",
                maxWidth: 480,
                margin: "0 auto 24px",
                textAlign: "center"
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
                    background: "var(--astravia-surface)",
                    border: "1px solid var(--astravia-border)",
                    borderRadius: "var(--astravia-radius-control)",
                    padding: "18px 20px",
                    boxShadow: "var(--astravia-shadow-card)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ font: "700 20px var(--font-display)", color: "var(--astravia-ink)" }}>
                      {a.id}
                    </span>
                    <span style={{ font: "600 12px var(--font-body)", color: "var(--astravia-text-subtle)" }}>
                      {a.fullName}
                    </span>
                  </div>
                  <p
                    style={{
                      font: "400 13px/1.5 var(--font-body)",
                      color: "var(--astravia-text-secondary)",
                      margin: "8px 0 6px"
                    }}
                  >
                    {a.position}
                  </p>
                  <p style={{ font: "600 13px var(--font-body)", color: "var(--astravia-ink)", margin: 0 }}>
                    {a.meaning}
                  </p>
                </div>
              ))}
            </div>

            <p
              style={{
                font: "400 14px/1.7 var(--font-body)",
                color: "var(--astravia-text-secondary)",
                maxWidth: 480,
                margin: "28px auto 16px",
                textAlign: "center"
              }}
            >
              Astrocartography draws one line on the world map for every planet-and-angle pair: everywhere on Earth
              where, at your exact birth moment, that planet sat at that exact position. Astravia traces ten planets
              against these four points, each carrying its own traditional theme:
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {PLANETS.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                    background: "var(--astravia-surface)",
                    border: "1px solid var(--astravia-border)",
                    borderRadius: "var(--astravia-radius-control)",
                    padding: "9px 12px"
                  }}
                >
                  <span style={{ font: "700 14px var(--font-display)", color: "var(--astravia-overall)", width: 14, flexShrink: 0 }}>
                    {p.symbol}
                  </span>
                  <span style={{ font: "700 12.5px var(--font-display)", color: "var(--astravia-ink)", flexShrink: 0 }}>
                    {p.name}
                  </span>
                  <span style={{ font: "400 11px var(--font-body)", color: "var(--astravia-text-secondary)", lineHeight: 1.3 }}>
                    {p.theme}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p
        style={{
          font: "400 12px/1.6 var(--font-body)",
          color: "var(--astravia-text-subtle)",
          textAlign: "center",
          padding: "24px 24px 0"
        }}
      >
        Astrocartography is an interpretive astrology practice, not a scientifically validated method for
        predicting life outcomes. Use these results for reflection and exploration alongside practical factors.
      </p>
    </ScreenShell>
  );
}
