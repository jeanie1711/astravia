import { describe, expect, it } from "vitest";
import { buildUncertaintyScenarios, resolveBirthInstant } from "../../src/astro/time.js";
import type { BirthInput } from "../../src/astro/types.js";

function baseInput(overrides: Partial<BirthInput>): BirthInput {
  return {
    birthDate: "1990-06-15",
    birthLocalTime: "12:00",
    birthPlaceLabel: "Test City",
    latitude: 0,
    longitude: 0,
    timeZoneId: "UTC",
    ...overrides
  };
}

describe("resolveBirthInstant", () => {
  it("resolves an unambiguous local time to the correct UTC instant using the historical zone offset", () => {
    // Vietnam has used a fixed UTC+7 offset (no DST) for Asia/Ho_Chi_Minh
    // since long before 1987 -- Golden Case 001's reference date.
    const result = resolveBirthInstant(
      baseInput({
        birthDate: "1987-11-17",
        birthLocalTime: "17:30",
        timeZoneId: "Asia/Ho_Chi_Minh"
      })
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.resolved.utcIso).toBe("1987-11-17T10:30:00Z");
    }
  });

  it("flags a missing timezone rather than guessing", () => {
    const result = resolveBirthInstant(baseInput({ timeZoneId: "" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("MISSING_TIMEZONE");
    }
  });

  it("flags an invalid date/time rather than guessing", () => {
    const result = resolveBirthInstant(baseInput({ birthDate: "not-a-date" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("INVALID_DATE_OR_TIME");
    }
  });

  it("flags an ambiguous DST fold instead of silently picking one occurrence", () => {
    // America/New_York fall-back in 2023: 01:30 local happens twice.
    const result = resolveBirthInstant(
      baseInput({
        birthDate: "2023-11-05",
        birthLocalTime: "01:30",
        timeZoneId: "America/New_York"
      })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("AMBIGUOUS_DST_FOLD");
      if (result.error.kind === "AMBIGUOUS_DST_FOLD") {
        expect(result.error.earlierUtcIso).not.toBe(result.error.laterUtcIso);
      }
    }
  });

  it("flags a nonexistent DST gap instead of silently normalizing it", () => {
    // America/New_York spring-forward in 2023: clocks jump 02:00 -> 03:00,
    // so 02:30 local never happens.
    const result = resolveBirthInstant(
      baseInput({
        birthDate: "2023-03-12",
        birthLocalTime: "02:30",
        timeZoneId: "America/New_York"
      })
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.kind).toBe("NONEXISTENT_DST_GAP");
    }
  });
});

describe("buildUncertaintyScenarios", () => {
  it("builds symmetric lower/upper instants around the baseline", () => {
    const scenarios = buildUncertaintyScenarios("2000-01-01T12:00:00Z", 30);
    expect(scenarios.baselineUtcIso).toBe("2000-01-01T12:00:00Z");
    expect(scenarios.lowerUtcIso).toBe("2000-01-01T11:30:00Z");
    expect(scenarios.upperUtcIso).toBe("2000-01-01T12:30:00Z");
  });

  it("collapses to a single instant for zero uncertainty", () => {
    const scenarios = buildUncertaintyScenarios("2000-01-01T12:00:00Z", 0);
    expect(scenarios.lowerUtcIso).toBe(scenarios.baselineUtcIso);
    expect(scenarios.upperUtcIso).toBe(scenarios.baselineUtcIso);
  });
});
