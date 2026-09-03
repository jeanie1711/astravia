"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScreenShell } from "./components/ScreenShell";
import { PillButton } from "./components/PillButton";
import { useJourney } from "./journey/JourneyContext";

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

      <div aria-hidden="true" style={{ marginTop: 56, lineHeight: 0 }}>
        <Image
          src="/astravia-footer.png"
          alt=""
          width={1983}
          height={793}
          style={{ width: "100%", height: "auto" }}
          priority
        />
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
