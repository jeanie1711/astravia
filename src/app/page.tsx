"use client";

import { useRouter } from "next/navigation";
import { ScreenShell } from "./components/ScreenShell.js";
import { PillButton } from "./components/PillButton.js";
import { useJourney } from "./journey/JourneyContext.js";

export default function LandingPage() {
  const router = useRouter();
  const { resetJourney } = useJourney();

  function start() {
    resetJourney();
    router.push("/explore/birth-details");
  }

  return (
    <ScreenShell maxWidth={640}>
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

      <div aria-hidden="true" style={{ marginTop: 56 }}>
        <HeroIllustration />
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

// A simplified, decorative stand-in for the original Claude Design
// illustration (Santorini / Eiffel Tower / skyline / mountains / plane).
// Swap in the exact exported asset later if pixel-perfect fidelity matters
// -- the MVP can succeed without imagery (02-user-flow-screen-spec.md).
function HeroIllustration() {
  return (
    <svg viewBox="0 0 640 220" width="100%" height="220" role="presentation">
      <rect width="640" height="220" fill="#f7e6d3" />
      <circle cx="320" cy="170" r="70" fill="#f6cfa0" />
      <rect x="0" y="170" width="640" height="50" fill="#bfe0e3" />
      <polygon points="120,170 140,110 160,170" fill="#c96f3a" opacity="0.5" />
      <polygon points="150,170 175,95 200,170" fill="#c96f3a" opacity="0.7" />
      <rect x="290" y="60" width="10" height="110" fill="#17323f" opacity="0.55" />
      <polygon points="295,40 305,60 285,60" fill="#17323f" opacity="0.55" />
      <rect x="430" y="90" width="18" height="80" fill="#17323f" opacity="0.35" />
      <rect x="455" y="70" width="18" height="100" fill="#17323f" opacity="0.45" />
      <rect x="480" y="105" width="18" height="65" fill="#17323f" opacity="0.3" />
      <circle cx="60" cy="55" r="14" fill="#fff" opacity="0.6" />
      <circle cx="90" cy="60" r="10" fill="#fff" opacity="0.6" />
      <circle cx="560" cy="45" r="12" fill="#fff" opacity="0.6" />
      <g opacity="0.7">
        <circle cx="500" cy="55" r="3" fill="#17323f" />
        <path d="M500 55 L560 30" stroke="#17323f" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      </g>
    </svg>
  );
}
