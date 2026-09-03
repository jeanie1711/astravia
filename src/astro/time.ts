import { Temporal } from "@js-temporal/polyfill";
import type {
  BirthInput,
  LocalTimeResolution,
  UncertaintyMinutes,
  UncertaintyScenarios
} from "./types.js";

// Parses "YYYY-MM-DD" + "HH:mm[:ss]" into a Temporal.PlainDateTime without
// attaching any timezone/offset meaning yet.
function parsePlainDateTime(
  birthDate: string,
  birthLocalTime: string
): Temporal.PlainDateTime | undefined {
  try {
    return Temporal.PlainDateTime.from(`${birthDate}T${birthLocalTime}`);
  } catch {
    return undefined;
  }
}

// Resolves a local civil birth date/time against its historical IANA timezone.
// Never infers UTC from the place's present-day offset: Temporal.TimeZone
// resolves the offset that was actually in effect for that IANA zone on that
// historical date. Ambiguous (DST fold) and nonexistent (DST gap) local times
// are surfaced as explicit results rather than silently normalized, per
// CLAUDE.md §10 and the calc spec §4.
export function resolveBirthInstant(input: BirthInput): LocalTimeResolution {
  if (!input.timeZoneId) {
    return { ok: false, error: { kind: "MISSING_TIMEZONE" } };
  }

  const plainDateTime = parsePlainDateTime(input.birthDate, input.birthLocalTime);
  if (!plainDateTime) {
    return { ok: false, error: { kind: "INVALID_DATE_OR_TIME" } };
  }

  let timeZone: Temporal.TimeZone;
  try {
    timeZone = new Temporal.TimeZone(input.timeZoneId);
  } catch {
    return { ok: false, error: { kind: "MISSING_TIMEZONE" } };
  }

  const possibleInstants = timeZone.getPossibleInstantsFor(plainDateTime);

  if (possibleInstants.length === 0) {
    return { ok: false, error: { kind: "NONEXISTENT_DST_GAP" } };
  }

  if (possibleInstants.length === 2) {
    const [earlier, later] = possibleInstants as [Temporal.Instant, Temporal.Instant];
    return {
      ok: false,
      error: {
        kind: "AMBIGUOUS_DST_FOLD",
        earlierUtcIso: earlier.toString(),
        laterUtcIso: later.toString()
      }
    };
  }

  const [instant] = possibleInstants as [Temporal.Instant];
  return { ok: true, resolved: { utcIso: instant.toString() } };
}

// Resolves a specific, already-disambiguated UTC instant (used when the
// caller has chosen the earlier/later occurrence of an ambiguous fold).
export function instantFromUtcIso(utcIso: string): string {
  return Temporal.Instant.from(utcIso).toString();
}

// Builds the three independent uncertainty scenario instants (T-u, T, T+u).
// Each is a plain UTC-instant shift from the resolved baseline instant; the
// astronomy calculation must still be run independently for each (G007) --
// this function only produces the instants, not any calculation shortcut.
export function buildUncertaintyScenarios(
  baselineUtcIso: string,
  uncertaintyMinutes: UncertaintyMinutes
): UncertaintyScenarios {
  const baseline = Temporal.Instant.from(baselineUtcIso);

  const lower = baseline.subtract({ minutes: uncertaintyMinutes });
  const upper = baseline.add({ minutes: uncertaintyMinutes });

  return {
    lowerUtcIso: lower.toString(),
    baselineUtcIso: baseline.toString(),
    upperUtcIso: upper.toString()
  };
}
