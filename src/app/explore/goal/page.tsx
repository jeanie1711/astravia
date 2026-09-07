"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { StepProgress } from "../../components/StepProgress";
import { useJourney } from "../../journey/JourneyContext";
import { GOAL_COLOR } from "../../journey/goalTheme";
import { deriveGoalOrder, LIFE_PRIORITIES, MAX_PRIORITIES, type LifePriorityId } from "../../journey/priorities";

// S04: up to 3 more personal life-priority picks, each with a small
// colored marker tying it back to the goal it maps to underneath (product
// feedback 2026-09-07, §11: goal choices get a small colored icon/marker,
// not a full-card fill). These only decide which goal is calculated first
// and how the results page orders its goal tabs, never a scoring input
// (see journey/priorities.ts).
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
      <BackHeader stepLabel="Step 3 of 3" />
      <StepProgress step={3} total={3} />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 26px var(--font-display)", color: "var(--astravia-ink)" }}>
          What matters most in this chapter?
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 14px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          Pick up to {MAX_PRIORITIES}. We'll use these to decide where to start, you can explore every angle
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
                aria-pressed={isSelected}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  minHeight: 44,
                  padding: "10px 16px",
                  borderRadius: "var(--astravia-radius-pill)",
                  border: isSelected ? "2px solid var(--astravia-ink)" : "1px solid var(--astravia-border-strong)",
                  background: isSelected ? "var(--astravia-surface-alt)" : "var(--astravia-surface)",
                  font: "600 13px var(--font-body)",
                  color: disabled ? "var(--astravia-text-subtle)" : "var(--astravia-ink)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  opacity: disabled ? 0.5 : 1
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: GOAL_COLOR[p.goal],
                    flexShrink: 0
                  }}
                />
                {p.label}
              </button>
            );
          })}
        </div>

        <p style={{ margin: "0 0 24px", font: "400 12px var(--font-body)", color: "var(--astravia-text-subtle)" }}>
          {selected.length}/{MAX_PRIORITIES} selected
        </p>

        <PillButton onClick={handleShowResults} disabled={selected.length === 0} style={{ marginTop: 8 }}>
          Show my places
        </PillButton>
      </div>
    </ScreenShell>
  );
}
