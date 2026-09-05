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
const OPTIONS: Array<{ id: ViewMode; name: string; desc: string }> = [
  {
    id: "city",
    name: "By city",
    desc: "Individual cities, ranked by how strongly each one on its own supports this goal. Best if you want specific places to consider."
  },
  {
    id: "country",
    name: "By country",
    desc: "Countries, ranked by how many strong cities they contain -- not just their single best one. Best if you're flexible on the exact city and want to see which regions stand out overall."
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
              padding: "18px 20px",
              borderRadius: 14,
              background: o.id === selected ? "var(--color-surface)" : "#ffffff",
              marginBottom: 12,
              cursor: "pointer",
              border: o.id === selected ? "2px solid var(--color-accent)" : "1px solid var(--color-border)",
              boxShadow: o.id === selected ? "var(--shadow-card)" : "none"
            }}
          >
            <div style={{ font: "600 16px var(--font-body)", color: "var(--color-ink)" }}>{o.name}</div>
            <div style={{ font: "400 13.5px/1.55 var(--font-body)", color: "var(--color-muted)", marginTop: 4 }}>
              {o.desc}
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
