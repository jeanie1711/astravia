"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackHeader } from "../../components/BackHeader";
import { errorTextStyle, FieldLabel, inputStyle } from "../../components/FieldLabel";
import { PillButton } from "../../components/PillButton";
import { ScreenShell } from "../../components/ScreenShell";
import { StepProgress } from "../../components/StepProgress";
import { useJourney } from "../../journey/JourneyContext";
import type { PlaceSearchResult } from "../../api/place-search/route";
import { useTranslation } from "../../../i18n/useTranslation";

export default function BirthDetailsPage() {
  const router = useRouter();
  const { journey, setJourney } = useJourney();
  const t = useTranslation();

  const [date, setDate] = useState(journey.birth?.birthDate ?? "");
  const [time, setTime] = useState(journey.birth?.birthLocalTime ?? "");
  const [placeQuery, setPlaceQuery] = useState(journey.birth?.birthPlaceLabel ?? "");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(
    journey.birth
      ? {
          id: "",
          label: journey.birth.birthPlaceLabel,
          latitude: journey.birth.latitude,
          longitude: journey.birth.longitude,
          timeZoneId: journey.birth.timeZoneId
        }
      : null
  );
  const [suggestions, setSuggestions] = useState<PlaceSearchResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!suggestionsOpen || selectedPlace) return;
    clearTimeout(debounceRef.current);
    if (placeQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/place-search?q=${encodeURIComponent(placeQuery)}`);
      const data = (await res.json()) as { results: PlaceSearchResult[] };
      setSuggestions(data.results);
    }, 200);
    return () => clearTimeout(debounceRef.current);
  }, [placeQuery, suggestionsOpen, selectedPlace]);

  const birthValid = Boolean(date && time && selectedPlace);

  function handleContinue() {
    setTouched(true);
    if (!birthValid || !selectedPlace) return;
    setJourney((prev) => ({
      ...prev,
      birth: {
        birthDate: date,
        birthLocalTime: time,
        birthPlaceLabel: selectedPlace.label,
        latitude: selectedPlace.latitude,
        longitude: selectedPlace.longitude,
        timeZoneId: selectedPlace.timeZoneId
      }
    }));
    router.push("/explore/confidence");
  }

  return (
    <ScreenShell>
      <BackHeader stepLabel={t.birthDetails.stepLabel} onBack={() => router.push("/")} />
      <StepProgress step={1} total={2} />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 26px var(--font-display)", color: "var(--astravia-ink)" }}>
          {t.birthDetails.heading}
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 15px/1.5 var(--font-body)", color: "var(--astravia-text-secondary)" }}>
          {t.birthDetails.subtitle}
        </p>

        <FieldLabel>{t.birthDetails.dateLabel}</FieldLabel>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />
        {touched && !date && <p style={errorTextStyle}>{t.birthDetails.dateError}</p>}

        <FieldLabel>{t.birthDetails.timeLabel}</FieldLabel>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />
        {touched && !time && <p style={errorTextStyle}>{t.birthDetails.timeError}</p>}

        <FieldLabel>{t.birthDetails.placeLabel}</FieldLabel>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder={t.birthDetails.placePlaceholder}
            value={placeQuery}
            onChange={(e) => {
              setPlaceQuery(e.target.value);
              setSelectedPlace(null);
              setSuggestionsOpen(true);
            }}
            style={inputStyle}
          />
          {suggestionsOpen && !selectedPlace && suggestions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: "4px 0 0",
                padding: 0,
                position: "absolute",
                width: "100%",
                background: "var(--astravia-surface)",
                border: "1px solid var(--astravia-border-strong)",
                borderRadius: "var(--astravia-radius-control)",
                boxShadow: "var(--astravia-shadow-card)",
                zIndex: 10,
                overflow: "hidden"
              }}
            >
              {suggestions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlace(s);
                      setPlaceQuery(s.label);
                      setSuggestionsOpen(false);
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      font: "14px var(--font-body)",
                      color: "var(--astravia-ink)"
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {touched && !selectedPlace && <p style={errorTextStyle}>{t.birthDetails.placeError}</p>}

        <div style={{ marginTop: 24 }}>
          <PillButton onClick={handleContinue} disabled={touched && !birthValid}>
            {t.birthDetails.continueBtn}
          </PillButton>
        </div>
      </div>
    </ScreenShell>
  );
}
