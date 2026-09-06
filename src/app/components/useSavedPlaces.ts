"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "astravia_saved_places";

// Local-only bookmarking (product feedback 2026-09-06, item 10): "Save
// place" becomes a bookmarked visual state. Deliberately session/local
// storage, not an account-backed list (CLAUDE.md §4/§14 -- no accounts or
// database-backed profiles in the MVP), so this is a per-browser
// convenience, not a synced "My Saved Places" feature.
function readSaved(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

export function useSavedPlaces() {
  const [saved, setSaved] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setSaved(readSaved());
  }, []);

  const toggle = useCallback((cityId: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(cityId)) {
        next.delete(cityId);
      } else {
        next.add(cityId);
      }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Local storage may be unavailable (private browsing, quota) --
        // the toggle still works for the current page render.
      }
      return next;
    });
  }, []);

  return { saved, toggle };
}
