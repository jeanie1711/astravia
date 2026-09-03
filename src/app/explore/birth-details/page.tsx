"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BackHeader } from "../../components/BackHeader.js";
import { errorTextStyle, FieldLabel, inputStyle } from "../../components/FieldLabel.js";
import { PillButton } from "../../components/PillButton.js";
import { ScreenShell } from "../../components/ScreenShell.js";
import { useJourney } from "../../journey/JourneyContext.js";
import type { PlaceSearchResult } from "../../api/place-search/route.js";

export default function BirthDetailsPage() {
  const router = useRouter();
  const { journey, setJourney } = useJourney();

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
      <BackHeader stepLabel="Step 1 of 3 · Birth details" onBack={() => router.push("/")} />
      <div style={{ padding: "24px 24px 0" }}>
        <h2 style={{ margin: "0 0 8px", font: "600 27px var(--font-display)", color: "var(--color-ink)" }}>
          Your birth details
        </h2>
        <p style={{ margin: "0 0 24px", font: "400 15px/1.5 var(--font-body)", color: "var(--color-muted)" }}>
          Birth time matters because astrocartography lines can move noticeably within a short time.
        </p>

        <FieldLabel>Date of birth</FieldLabel>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />
        {touched && !date && <p style={errorTextStyle}>Enter your date of birth.</p>}

        <FieldLabel>Time of birth</FieldLabel>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...inputStyle, marginBottom: 20 }}
        />
        {touched && !time && <p style={errorTextStyle}>Enter your birth time.</p>}

        <FieldLabel>Place of birth</FieldLabel>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="City, country"
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
                background: "var(--color-surface)",
                border: "1px solid var(--color-border-strong)",
                borderRadius: 10,
                boxShadow: "var(--shadow-card)",
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
                      color: "var(--color-ink)"
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {touched && !selectedPlace && <p style={errorTextStyle}>Choose a birth place from the results.</p>}

        <div style={{ marginTop: 24 }}>
          <PillButton onClick={handleContinue} disabled={touched && !birthValid}>
            Continue
          </PillButton>
        </div>
      </div>
    </ScreenShell>
  );
}
