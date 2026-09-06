"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { useJourney } from "../../journey/JourneyContext";
import type { ViewMode } from "../../journey/types";

// S05b -- inserted right after calculation finishes (product feedback
// 2026-09-05): city ranking and country ranking come from two different
// formulas (04-scoring-ranking-spec.md §11), so showing both lists on one
// page made it look like a bug when a country's best city and a top-3 city
// didn't match up. Asking the user to pick a lens up front keeps each page
// internally consistent instead of trying to reconcile two rankings at once.
// Shortened to one line each (product feedback 2026-09-06): the original
// two-sentence descriptions made the choice feel heavier than it is.
const OPTIONS: Array<{ id: ViewMode; icon: string; name: string; tagline: string; desc: string }> = [
  {
    id: "city",
    icon: "📍",
    name: "By city",
    tagline: "Specific places",
    desc: "Individual cities ranked on their own strength for this goal."
  },
  {
    id: "country",
    icon: "📍📍📍",
    name: "By country",
    tagline: "Broader regions",
    desc: "Countries ranked by how many strong cities they contain together."
  }
];

export default function ViewModePage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [selected, setSelected] = useState<ViewMode>(journey.viewMode ?? "city");

  useEffect(() => {
    if (hydrated && (!journey.birth || !journey.results)) {
      router.replace("/explore/birth-details");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function handleContinue() {
    setJourney((prev) => ({ ...prev, viewMode: selected }));
    router.push("/results");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel="Your results" onBack={() => router.push("/explore/goal")} />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 10px", font: "600 27px var(--font-display)", color: "var(--color-ink)" }}>
          How do you want to explore your places?
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 14px/1.6 var(--font-body)", color: "var(--color-muted)" }}>
          A city can be a strong individual match without its country being a top overall country, and the
          reverse can happen too -- they're scored differently. Pick a lens so your results stay easy to compare.
          You can switch anytime from your results page.
        </p>

        {OPTIONS.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelected(o.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 20px",
              borderRadius: 14,
              background: o.id === selected ? "var(--color-surface)" : "#ffffff",
              marginBottom: 12,
              cursor: "pointer",
              border: o.id === selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
              boxShadow: o.id === selected ? "var(--shadow-card)" : "none"
            }}
          >
            <span aria-hidden="true" style={{ fontSize: 20, letterSpacing: -2 }}>
              {o.icon}
            </span>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ font: "600 16px var(--font-body)", color: "var(--color-ink)" }}>{o.name}</span>
                <span
                  style={{
                    font: "600 10px var(--font-body)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--color-accent-strong)"
                  }}
                >
                  {o.tagline}
                </span>
              </div>
              <div style={{ font: "400 13px/1.5 var(--font-body)", color: "var(--color-muted)", marginTop: 2 }}>
                {o.desc}
              </div>
            </div>
          </div>
        ))}

        <PillButton onClick={handleContinue} style={{ marginTop: 12 }}>
          Show my {selected === "city" ? "cities" : "countries"}
        </PillButton>
      </div>
    </ScreenShell>
  );
}
