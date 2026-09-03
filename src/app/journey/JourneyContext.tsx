"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { INITIAL_JOURNEY_STATE, type JourneyState } from "./types";

const STORAGE_KEY = "astravia-journey";

type JourneyContextValue = {
  journey: JourneyState;
  // False until the initial sessionStorage read completes (client-only --
  // always false during SSR). Consumers must wait for this before treating
  // a missing field as "the user never filled this in", or a hard refresh
  // will bounce them back through the flow even though their session data
  // is about to load.
  hydrated: boolean;
  setJourney: (update: JourneyState | ((prev: JourneyState) => JourneyState)) => void;
  resetJourney: () => void;
};

const JourneyContext = createContext<JourneyContextValue | undefined>(undefined);

function readFromStorage(): JourneyState {
  if (typeof window === "undefined") return INITIAL_JOURNEY_STATE;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_JOURNEY_STATE;
    return { ...INITIAL_JOURNEY_STATE, ...(JSON.parse(raw) as JourneyState) };
  } catch {
    return INITIAL_JOURNEY_STATE;
  }
}

// Session-only journey state (CLAUDE.md §14: no account/database, birth
// details never in a URL, minimal persistence). Cleared when the tab
// closes since it lives in sessionStorage, not localStorage.
export function JourneyProvider({ children }: { children: ReactNode }) {
  const [journey, setJourneyState] = useState<JourneyState>(INITIAL_JOURNEY_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setJourneyState(readFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(journey));
    } catch {
      // sessionStorage unavailable (private browsing etc) -- journey state
      // just won't survive a reload, which is an acceptable degradation.
    }
  }, [journey, hydrated]);

  function setJourney(update: JourneyState | ((prev: JourneyState) => JourneyState)) {
    setJourneyState((prev) => (typeof update === "function" ? update(prev) : update));
  }

  function resetJourney() {
    setJourneyState(INITIAL_JOURNEY_STATE);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <JourneyContext.Provider value={{ journey, hydrated, setJourney, resetJourney }}>
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney(): JourneyContextValue {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error("useJourney must be used within a JourneyProvider");
  }
  return ctx;
}
