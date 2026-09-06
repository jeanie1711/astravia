"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { useJourney } from "../../journey/JourneyContext";
import { deriveGoalOrder, LIFE_PRIORITIES, MAX_PRIORITIES, type LifePriorityId } from "../../journey/priorities";

// S04 (product feedback 2026-09-06, item 13): replaces the old single
// goal-name picker with up to 3 more personal life-priority picks. These
// map onto the same 4 goals underneath (see journey/priorities.ts) --
// they only decide which goal is calculated first and how the results
// page orders its goal tabs, never a scoring input.
export default function GoalPage() {
  const router = useRouter();
  const { journey, hydrated, setJourney } = useJourney();
  const [selected, setSelected] = useState<LifePriorityId[]>(journey.priorities ?? []);

  useEffect(() => {
    if (hydrated && !journey.birth) router.replace("/explore/birth-details");
  }, [hydrated, journey.birth, router]);

  function toggle(id: LifePriorityId) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= MAX_PRIORITIES) return prev;
      return [...prev, id];
    });
  }

  function handleShowResults() {
    const goal = deriveGoalOrder(selected)[0]!;
    setJourney((prev) => ({ ...prev, goal, priorities: selected }));
    router.push("/explore/calculating");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel="Step 3 of 3 · What matters most" />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 27px var(--font-display)", color: "var(--color-ink)" }}>
          What matters most in this chapter?
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 14px/1.5 var(--font-body)", color: "var(--color-muted)" }}>
          Pick up to {MAX_PRIORITIES}. We'll use these to decide where to start -- you can explore every angle
          afterward.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
          {LIFE_PRIORITIES.map((p) => {
            const isSelected = selected.includes(p.id);
            const disabled = !isSelected && selected.length >= MAX_PRIORITIES;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                disabled={disabled}
                style={{
                  padding: "10px 16px",
                  borderRadius: 100,
                  border: isSelected ? "2px solid var(--color-accent)" : "1px solid var(--color-border-strong)",
                  background: isSelected ? "var(--color-surface)" : "#ffffff",
                  font: "600 13px var(--font-body)",
                  color: isSelected ? "var(--color-ink)" : disabled ? "var(--color-faint)" : "var(--color-ink)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <p style={{ margin: "0 0 24px", font: "400 12px var(--font-body)", color: "var(--color-faint)" }}>
          {selected.length}/{MAX_PRIORITIES} selected
        </p>

        <PillButton onClick={handleShowResults} disabled={selected.length === 0} style={{ marginTop: 8 }}>
          Show my places
        </PillButton>
      </div>
    </ScreenShell>
  );
}
