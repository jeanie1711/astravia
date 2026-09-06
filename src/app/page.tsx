"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScreenShell } from "./components/ScreenShell";
import { PillButton } from "./components/PillButton";
import { useJourney } from "./journey/JourneyContext";

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
      <div style={{ textAlign: "center", padding: "56px 32px 0" }}>
        <div style={{ color: "var(--color-accent)", fontSize: 18 }} aria-hidden="true">
          ✦
        </div>
        <div style={{ font: "600 20px var(--font-display)", color: "var(--color-ink)", marginTop: 8 }}>
          Astravia
        </div>
        <div
          style={{
            font: "600 11px var(--font-body)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--color-faint)",
            marginTop: 10
          }}
        >
          Your places · Your next chapter
        </div>
        <h1
          style={{
            font: "600 40px/1.2 var(--font-display)",
            color: "var(--color-ink)",
            margin: "20px 0 0"
          }}
        >
          A broader world for your next chapter
        </h1>
        <p style={{ font: "400 17px var(--font-body)", color: "var(--color-muted)", margin: "16px 0 32px" }}>
          Your map. Your places. Your possibilities.
        </p>
        <div style={{ maxWidth: 280, margin: "0 auto" }}>
          <PillButton onClick={start}>Find my places</PillButton>
        </div>
        <p style={{ font: "400 13px var(--font-body)", color: "var(--color-faint)", marginTop: 14 }}>
          Takes about 2 minutes.
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

      <div style={{ padding: "40px 32px 0" }}>
        <h2
          style={{
            font: "600 24px var(--font-display)",
            color: "var(--color-ink)",
            textAlign: "center",
            margin: "0 auto 12px",
            maxWidth: 440
          }}
        >
          How Astravia finds your places
        </h2>
        <p
          style={{
            font: "400 15px/1.7 var(--font-body)",
            color: "var(--color-muted)",
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
            style={{
              border: "none",
              background: "none",
              color: "var(--color-accent-strong)",
              font: "600 13px var(--font-body)",
              cursor: "pointer",
              padding: 0
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
                color: "var(--color-muted)",
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
                    background: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 14,
                    padding: "18px 20px",
                    boxShadow: "var(--shadow-card)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        font: "700 22px var(--font-display)",
                        backgroundImage: "var(--gradient-accent)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        WebkitTextFillColor: "transparent"
                      }}
                    >
                      {a.id}
                    </span>
                    <span style={{ font: "600 12px var(--font-body)", color: "var(--color-faint)" }}>
                      {a.fullName}
                    </span>
                  </div>
                  <p
                    style={{ font: "400 13px/1.5 var(--font-body)", color: "var(--color-muted)", margin: "8px 0 6px" }}
                  >
                    {a.position}
                  </p>
                  <p style={{ font: "600 13px var(--font-body)", color: "var(--color-accent-strong)", margin: 0 }}>
                    {a.meaning}
                  </p>
                </div>
              ))}
            </div>

            <p
              style={{
                font: "400 14px/1.7 var(--font-body)",
                color: "var(--color-muted)",
                maxWidth: 480,
                margin: "28px auto 0",
                textAlign: "center"
              }}
            >
              Astrocartography draws one line on the world map for every planet-and-angle pair: everywhere on Earth
              where, at your exact birth moment, that planet sat at that exact position. Astravia tracks ten planets
              this way, from the Sun and Moon through Mercury, Venus, and Mars, out to Jupiter, Saturn, Uranus,
              Neptune, and Pluto, each carrying its own traditional theme.
            </p>
          </div>
        )}
      </div>

      <p
        style={{
          font: "400 12px/1.6 var(--font-body)",
          color: "var(--color-faint)",
          textAlign: "center",
          padding: "24px 32px 0"
        }}
      >
        Astrocartography is an interpretive astrology practice, not a scientifically validated method for
        predicting life outcomes. Use these results for reflection and exploration alongside practical factors.
      </p>
    </ScreenShell>
  );
}
