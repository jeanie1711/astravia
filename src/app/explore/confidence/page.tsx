"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { useJourney } from "../../journey/JourneyContext";
import type { UncertaintyMinutes } from "../../journey/types";

type Mode = "exact" | "range";

function OptionCard({
  selected,
  title,
  description,
  onClick
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "16px 18px",
        borderRadius: 12,
        background: "var(--color-surface)",
        marginBottom: 12,
        cursor: "pointer",
        border: selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border-strong)"
      }}
    >
      <div style={{ font: "600 15px var(--font-body)", color: "var(--color-ink)" }}>{title}</div>
      <div style={{ font: "400 13px var(--font-body)", color: "var(--color-muted)", marginTop: 2 }}>
        {description}
      </div>
    </div>
  );
}

export default function ConfidencePage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();

  const initialMode: Mode = journey.uncertaintyMinutes === 0 ? "exact" : "range";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [range, setRange] = useState<15 | 30 | 60>(
    journey.uncertaintyMinutes && journey.uncertaintyMinutes > 0 ? journey.uncertaintyMinutes : 30
  );

  useEffect(() => {
    if (hydrated && !journey.birth) router.replace("/explore/birth-details");
  }, [hydrated, journey.birth, router]);

  function handleContinue() {
    const uncertaintyMinutes: UncertaintyMinutes = mode === "exact" ? 0 : range;
    setJourney((prev) => ({ ...prev, uncertaintyMinutes }));
    router.push("/explore/goal");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel="Step 2 of 3 · Birth-time confidence" />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 27px var(--font-display)", color: "var(--color-ink)" }}>
          How confident are you about your birth time?
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 15px/1.5 var(--font-body)", color: "var(--color-muted)" }}>
          If you're unsure, we'll check how much your strongest locations change across that time range.
        </p>

        <OptionCard
          selected={mode === "exact"}
          title="Exact"
          description="I know the time shown on my birth record."
          onClick={() => setMode("exact")}
        />
        <OptionCard
          selected={mode === "range"}
          title="Around this time"
          description="I'm approximating my birth time."
          onClick={() => setMode("range")}
        />

        {mode === "range" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {([15, 30, 60] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 100,
                  border: "1px solid var(--color-border-strong)",
                  font: "600 13px var(--font-body)",
                  cursor: "pointer",
                  background: range === r ? "var(--color-ink)" : "transparent",
                  color: range === r ? "var(--color-bg)" : "var(--color-ink)"
                }}
              >
                {r === 60 ? "± 1 hour" : `± ${r} min`}
              </button>
            ))}
          </div>
        )}

        <PillButton onClick={handleContinue} style={{ marginTop: 8 }}>
          Continue
        </PillButton>
      </div>
    </ScreenShell>
  );
}
