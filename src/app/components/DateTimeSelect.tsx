import { useState, type CSSProperties } from "react";

// Plain <select> dropdowns, not native <input type="date">/type="time">
// (2026-09-17): the native pickers rendered blank and oversized in real
// mobile testing -- both Instagram's in-app browser and plain mobile
// Chrome -- even after forcing color-scheme: light app-wide. A <select>
// has none of that browser's own complex internal sub-field/icon
// rendering, so its closed/collapsed appearance is consistent everywhere
// we can't otherwise control.
const selectStyle: CSSProperties = {
  minHeight: 48,
  padding: "12px 8px",
  borderRadius: "var(--astravia-radius-control)",
  border: "1px solid var(--astravia-border-strong)",
  background: "var(--astravia-surface)",
  font: "15px var(--font-body)",
  color: "var(--astravia-ink)",
  colorScheme: "light",
  boxSizing: "border-box",
  flex: 1,
  minWidth: 0
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

// value/onChange use the same "YYYY-MM-DD" shape <input type="date">'s
// value already did, so nothing else in the journey/API layer changes.
// Day/month/year are each held in their own local state, seeded from
// `value` only once on mount -- deriving them by re-parsing `value` on
// every render would discard whichever parts the user already picked
// each time a single select changes, since the combined string stays ""
// until all three are chosen (a real bug caught in testing: picking Day
// then Month "forgot" Day, because parsing "" for the still-incomplete
// value read back an empty day).
export function DateSelect({
  value,
  onChange,
  dayLabel,
  monthLabel,
  yearLabel
}: {
  value: string;
  onChange: (next: string) => void;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
}) {
  const [initialYear, initialMonth, initialDay] = value.split("-");
  const [day, setDay] = useState(initialDay ?? "");
  const [month, setMonth] = useState(initialMonth ?? "");
  const [year, setYear] = useState(initialYear ?? "");
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  function commit(next: { year?: string; month?: string; day?: string }) {
    const y = next.year ?? year;
    const m = next.month ?? month;
    const d = next.day ?? day;
    if (next.day !== undefined) setDay(next.day);
    if (next.month !== undefined) setMonth(next.month);
    if (next.year !== undefined) setYear(next.year);
    onChange(y && m && d ? `${y}-${m}-${d}` : "");
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select aria-label={dayLabel} value={day} onChange={(e) => commit({ day: e.target.value })} style={selectStyle}>
        <option value="">{dayLabel}</option>
        {days.map((d) => (
          <option key={d} value={pad2(d)}>
            {d}
          </option>
        ))}
      </select>
      <select
        aria-label={monthLabel}
        value={month}
        onChange={(e) => commit({ month: e.target.value })}
        style={{ ...selectStyle, flex: 1.7 }}
      >
        <option value="">{monthLabel}</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={name} value={pad2(i + 1)}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label={yearLabel}
        value={year}
        onChange={(e) => commit({ year: e.target.value })}
        style={{ ...selectStyle, flex: 1.2 }}
      >
        <option value="">{yearLabel}</option>
        {years.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

// Same local-state-per-field reasoning as DateSelect above. value/onChange
// use the same 24-hour "HH:MM" shape <input type="time">'s value already
// did.
export function TimeSelect({
  value,
  onChange,
  hourLabel,
  minuteLabel
}: {
  value: string;
  onChange: (next: string) => void;
  hourLabel: string;
  minuteLabel: string;
}) {
  const [initialHour, initialMinute] = value.split(":");
  const [hour, setHour] = useState(initialHour ?? "");
  const [minute, setMinute] = useState(initialMinute ?? "");
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  function commit(next: { hour?: string; minute?: string }) {
    const h = next.hour ?? hour;
    const m = next.minute ?? minute;
    if (next.hour !== undefined) setHour(next.hour);
    if (next.minute !== undefined) setMinute(next.minute);
    onChange(h && m ? `${h}:${m}` : "");
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <select aria-label={hourLabel} value={hour} onChange={(e) => commit({ hour: e.target.value })} style={selectStyle}>
        <option value="">{hourLabel}</option>
        {hours.map((h) => (
          <option key={h} value={pad2(h)}>
            {pad2(h)}
          </option>
        ))}
      </select>
      <select
        aria-label={minuteLabel}
        value={minute}
        onChange={(e) => commit({ minute: e.target.value })}
        style={selectStyle}
      >
        <option value="">{minuteLabel}</option>
        {minutes.map((m) => (
          <option key={m} value={pad2(m)}>
            {pad2(m)}
          </option>
        ))}
      </select>
    </div>
  );
}
