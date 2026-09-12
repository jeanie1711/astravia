"use client";

import { useLanguage } from "../../i18n/LanguageContext";
import type { Language } from "../../i18n/types";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "vi", label: "VI" }
];

// Mounted once from layout.tsx so it's present on every route regardless
// of that page's own header/chrome. Hidden on print (irrelevant on the
// printed report).
export function LanguageToggle() {
  const { language, hydrated, setLanguage } = useLanguage();

  return (
    <div
      className="astravia-language-toggle"
      role="group"
      aria-label="Language"
      style={{
        position: "fixed",
        top: 14,
        right: 14,
        zIndex: 200,
        display: "flex",
        background: "var(--astravia-surface)",
        border: "1px solid var(--astravia-border)",
        borderRadius: "var(--astravia-radius-pill)",
        boxShadow: "0 2px 10px rgba(8, 63, 75, 0.1)",
        padding: 3,
        opacity: hydrated ? 1 : 0,
        transition: "opacity 0.15s ease"
      }}
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === language;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLanguage(option.value)}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: "var(--astravia-radius-pill)",
              font: `600 12px var(--font-body)`,
              letterSpacing: "0.04em",
              color: isActive ? "var(--astravia-ink-on-dark)" : "var(--astravia-ink-soft, var(--astravia-ink))",
              background: isActive ? "var(--astravia-ink-strong)" : "transparent"
            }}
          >
            {option.label}
          </button>
        );
      })}
      <style>{`@media print { .astravia-language-toggle { display: none !important; } }`}</style>
    </div>
  );
}
