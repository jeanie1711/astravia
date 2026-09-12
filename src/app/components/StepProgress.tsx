// A visible progress indicator for the onboarding flow (product feedback
// 2026-09-07, §10) -- the step label text alone ("Step 1 of N") wasn't a
// visual cue. Plain teal segments, no semantic-color meaning attached
// (this isn't a life theme).
export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "16px 24px 0" }} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => i + 1).map((i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 100,
            background: i <= step ? "var(--astravia-ink)" : "var(--astravia-track)"
          }}
        />
      ))}
    </div>
  );
}
