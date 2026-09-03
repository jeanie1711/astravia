"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PillButton } from "../../components/PillButton.js";
import { ScreenShell } from "../../components/ScreenShell.js";
import { useJourney } from "../../journey/JourneyContext.js";
import type { CalculateRequest, CalculateResponse } from "../../journey/types.js";

// Spec S05: rotating messages reflecting real stages, no fake delay.
const CALC_MESSAGES = [
  "Calculating your planetary lines…",
  "Comparing cities around the world…",
  "Checking your birth-time range…",
  "Finding your strongest patterns…"
];

export default function CalculatingPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [msgIdx, setMsgIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!journey.birth || !journey.goal) {
      router.replace("/explore/birth-details");
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % CALC_MESSAGES.length);
    }, 900);

    const request: CalculateRequest = {
      birth: journey.birth,
      uncertaintyMinutes: journey.uncertaintyMinutes,
      goal: journey.goal
    };

    fetch("/api/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request)
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("calculation failed");
        }
        return (await res.json()) as CalculateResponse;
      })
      .then((data) => {
        setJourney((prev) => ({ ...prev, results: data }));
        router.push("/results");
      })
      .catch(() => setError("We couldn't calculate your results."))
      .finally(() => clearInterval(interval));

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (error) {
    return (
      <ScreenShell>
        <div style={{ padding: "80px 32px 0", textAlign: "center" }}>
          <h2 style={{ font: "600 22px var(--font-display)", color: "var(--color-ink)", margin: "0 0 12px" }}>
            {error}
          </h2>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <PillButton
              onClick={() => {
                setError(null);
                startedRef.current = false;
                router.refresh();
              }}
            >
              Try again
            </PillButton>
            <PillButton variant="secondary" onClick={() => router.push("/explore/birth-details")}>
              Review birth details
            </PillButton>
          </div>
        </div>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell maxWidth={480}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 32px"
        }}
      >
        <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {[0, 0.2, 0.4].map((delay) => (
            <div
              key={delay}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "var(--color-accent)",
                animation: "astravia-pulse 1.1s ease-in-out infinite",
                animationDelay: `${delay}s`
              }}
            />
          ))}
        </div>
        <h2 style={{ margin: "0 0 12px", font: "600 26px var(--font-display)", color: "var(--color-ink)" }}>
          Mapping your places…
        </h2>
        <p style={{ margin: 0, font: "400 15px var(--font-body)", color: "var(--color-muted)", height: 20 }}>
          {CALC_MESSAGES[msgIdx]}
        </p>
      </div>
      <style>{`
        @keyframes astravia-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </ScreenShell>
  );
}
