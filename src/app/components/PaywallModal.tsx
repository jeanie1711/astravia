"use client";

import { useState } from "react";
import { PENDING_CHECKOUT_STORAGE_KEY, PRICE_LABEL } from "../../config/payments";
import { useJourney } from "../journey/JourneyContext";
import { PillButton } from "./PillButton";

// Env-driven so the Product Owner can flip this from the Vercel
// dashboard (set NEXT_PUBLIC_SKIP_PAYMENT and redeploy) without asking
// for a code change each time. Defaults to skipping payment (true)
// whenever the var is unset or anything other than the literal string
// "false" -- deliberate for right now: real Dodo Payments checkout is
// wired up and working in test mode, but production is bypassing it
// until Dodo's account verification (live mode) is approved, so real
// visitors don't hit a checkout page showing "Test Mode". Once
// approved and live credentials are in place, set
// NEXT_PUBLIC_SKIP_PAYMENT=false in Vercel and redeploy to require real
// payment again.
const DEV_SKIP_PAYMENT = process.env.NEXT_PUBLIC_SKIP_PAYMENT !== "false";

export function PaywallModal({
  open,
  onClose,
  context
}: {
  open: boolean;
  onClose: () => void;
  // Optional specific reason the paywall opened (e.g. "See Alexandria,
  // Egypt") rather than the generic full-report pitch.
  context?: string | undefined;
}) {
  const { setJourney } = useJourney();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function startCheckout() {
    setLoading(true);
    setError(null);

    if (DEV_SKIP_PAYMENT) {
      setJourney((prev) => ({ ...prev, unlocked: true }));
      setLoading(false);
      onClose();
      return;
    }

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnPath: window.location.pathname })
      });
      if (!res.ok) throw new Error();
      const { url, sessionId } = (await res.json()) as { url: string; sessionId: string };
      try {
        window.sessionStorage.setItem(PENDING_CHECKOUT_STORAGE_KEY, sessionId);
      } catch {
        // sessionStorage unavailable (private browsing etc) -- verification
        // will simply fail to find a pending session on return, same as a
        // cancelled checkout.
      }
      window.location.href = url;
    } catch {
      setError("Couldn't start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(13, 52, 65, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 100,
        padding: 0
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 480,
          background: "var(--astravia-surface)",
          borderRadius: "var(--astravia-radius-card) var(--astravia-radius-card) 0 0",
          boxShadow: "var(--astravia-shadow-card)",
          padding: "28px 24px 32px",
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              border: "none",
              background: "none",
              color: "var(--astravia-text-subtle)",
              fontSize: 20,
              cursor: "pointer",
              padding: 4,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <h2 style={{ margin: "0 0 8px", font: "600 22px var(--font-display)", color: "var(--astravia-ink)" }}>
          {context ?? "Unlock your full report"}
        </h2>
        <p style={{ margin: "0 0 18px", font: "400 14px/1.6 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          One small payment unlocks every place and life area for this chart, plus a downloadable PDF report you can
          keep.
        </p>

        <ul style={{ margin: "0 0 22px", paddingLeft: 18, font: "400 14px/1.7 var(--font-body)", color: "var(--astravia-ink)" }}>
          <li>All remaining places for every life area</li>
          <li>Career, Love, Home, Growth, and All life areas in full</li>
          <li>A downloadable PDF report you can keep</li>
        </ul>

        {error && (
          <p style={{ margin: "0 0 12px", font: "400 13px var(--font-body)", color: "var(--astravia-love)" }}>
            {error}
          </p>
        )}

        <PillButton className="astravia-btn-shine" onClick={startCheckout} disabled={loading}>
          {loading ? "Redirecting…" : `Unlock full report for ${PRICE_LABEL}`}
        </PillButton>
        <button
          type="button"
          onClick={onClose}
          style={{
            display: "block",
            margin: "14px auto 0",
            border: "none",
            background: "none",
            color: "var(--astravia-text-secondary)",
            font: "600 13px var(--font-body)",
            cursor: "pointer",
            padding: 4
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
