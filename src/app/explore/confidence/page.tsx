"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { StepProgress } from "../../components/StepProgress";
import { useJourney } from "../../journey/JourneyContext";
import type { UncertaintyMinutes } from "../../journey/types";
import { useTranslation } from "../../../i18n/useTranslation";

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
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      style={{
        padding: "16px 18px",
        borderRadius: "var(--astravia-radius-control)",
        background: selected ? "var(--astravia-surface-alt)" : "var(--astravia-surface)",
        marginBottom: 12,
        cursor: "pointer",
        border: selected ? "2px solid var(--astravia-ink)" : "1px solid var(--astravia-border-strong)"
      }}
    >
      <div style={{ font: "600 15px var(--font-body)", color: "var(--astravia-ink)" }}>{title}</div>
      <div style={{ font: "400 13px var(--font-body)", color: "var(--astravia-text-secondary)", marginTop: 2 }}>
        {description}
      </div>
    </div>
  );
}

export default function ConfidencePage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const t = useTranslation();

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
    router.push("/explore/calculating");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel={t.confidence.stepLabel} />
      <StepProgress step={2} total={2} />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 26px var(--font-display)", color: "var(--astravia-ink)" }}>
          {t.confidence.heading}
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 15px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          {t.confidence.subtitle}
        </p>

        <OptionCard
          selected={mode === "exact"}
          title={t.confidence.exactTitle}
          description={t.confidence.exactDesc}
          onClick={() => setMode("exact")}
        />
        <OptionCard
          selected={mode === "range"}
          title={t.confidence.rangeTitle}
          description={t.confidence.rangeDesc}
          onClick={() => setMode("range")}
        />

        {mode === "range" && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {([15, 30, 60] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                style={{
                  flex: 1,
                  minHeight: 44,
                  borderRadius: "var(--astravia-radius-pill)",
                  border: range === r ? "none" : "1px solid var(--astravia-border-strong)",
                  font: "600 13px var(--font-body)",
                  cursor: "pointer",
                  background: range === r ? "var(--astravia-ink)" : "var(--astravia-surface)",
                  color: range === r ? "var(--astravia-white)" : "var(--astravia-ink)"
                }}
              >
                {t.confidence.rangeOption(r)}
              </button>
            ))}
          </div>
        )}

        <PillButton onClick={handleContinue} style={{ marginTop: 8 }}>
          {t.confidence.continueBtn}
        </PillButton>
      </div>
    </ScreenShell>
  );
}
