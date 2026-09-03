"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader.js";
import { PillButton } from "../../components/PillButton.js";
import { ScreenShell } from "../../components/ScreenShell.js";
import { useJourney } from "../../journey/JourneyContext.js";
import type { Goal } from "../../../scoring/types.js";

// Copy verbatim from 02-user-flow-screen-spec.md S04.
const GOALS: Array<{ id: Goal; name: string; desc: string }> = [
  { id: "CAREER", name: "Career", desc: "Visibility, direction, leadership, communication and professional growth." },
  { id: "LOVE", name: "Love & Relationships", desc: "Attraction, partnership, connection and social ease." },
  { id: "HOME", name: "Home & Family", desc: "Belonging, emotional grounding, home and family life." },
  { id: "GROWTH", name: "Personal Growth", desc: "Reinvention, identity, independence and inner development." },
  { id: "OVERALL", name: "Overall", desc: "A broader view across the major life themes." }
];

export default function GoalPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [goal, setGoal] = useState<Goal>(journey.goal ?? "CAREER");

  useEffect(() => {
    if (hydrated && !journey.birth) router.replace("/explore/birth-details");
  }, [hydrated, journey.birth, router]);

  function handleShowResults() {
    setJourney((prev) => ({ ...prev, goal }));
    router.push("/explore/calculating");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel="Step 3 of 3 · Life goal" />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 24px", font: "600 27px var(--font-display)", color: "var(--color-ink)" }}>
          What matters most right now?
        </h2>

        {GOALS.map((g) => (
          <div
            key={g.id}
            onClick={() => setGoal(g.id)}
            style={{
              padding: "16px 18px",
              borderRadius: 12,
              background: g.id === goal ? "var(--color-surface)" : "#ffffff",
              marginBottom: 10,
              cursor: "pointer",
              border: g.id === goal ? "2px solid var(--color-accent)" : "1px solid var(--color-border)"
            }}
          >
            <div style={{ font: "600 15px var(--font-body)", color: "var(--color-ink)" }}>{g.name}</div>
            <div style={{ font: "400 13px var(--font-body)", color: "var(--color-muted)", marginTop: 2 }}>
              {g.desc}
            </div>
          </div>
        ))}

        <PillButton onClick={handleShowResults} style={{ marginTop: 8 }}>
          Show my places
        </PillButton>
      </div>
    </ScreenShell>
  );
}
