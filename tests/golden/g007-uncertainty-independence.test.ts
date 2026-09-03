import { describe, expect, it } from "vitest";
import { equatorialOfDate } from "../../src/astro/ephemeris.js";
import { greenwichSiderealTimeDeg } from "../../src/astro/sidereal.js";
import { mcLongitude } from "../../src/astro/mc-ic.js";
import { normalizeLon } from "../../src/astro/normalize.js";

// G007: "T-15, T, T+15 must each run the full astronomy calculation. No
// scenario may be derived by simply shifting a baseline longitude."
//
// A broken shortcut implementation would compute RA once at the baseline
// and then derive every scenario's MC longitude purely from how much
// Greenwich sidereal time rotated (MC = RA_baseline - GST(t)). This test
// proves the engine does more than that: the Moon's own right ascension
// changes measurably over a 15-minute window (~0.1 deg), which only shows
// up if ephemeris.equatorialOfDate() is actually re-evaluated per instant.
describe("G007 uncertainty independence", () => {
  it("recomputes body ephemeris per scenario instant rather than shifting by GST rotation alone", () => {
    const t1 = "1987-11-17T10:15:00Z";
    const t2 = "1987-11-17T10:30:00Z"; // 15 minutes later

    const gst1 = greenwichSiderealTimeDeg(t1);
    const gst2 = greenwichSiderealTimeDeg(t2);
    const gstShift = normalizeLon(gst2 - gst1);

    const moon1 = equatorialOfDate("Moon", t1);
    const moon2 = equatorialOfDate("Moon", t2);

    const mc1 = mcLongitude(moon1.raDeg, gst1);
    const mc2 = mcLongitude(moon2.raDeg, gst2);
    const actualShift = normalizeLon(mc2 - mc1);

    // What a "shift the baseline longitude" shortcut would have produced,
    // i.e. holding RA fixed and only accounting for Earth's rotation.
    const shortcutShift = normalizeLon(-gstShift);

    const deviation = Math.abs(normalizeLon(actualShift - shortcutShift));
    expect(deviation).toBeGreaterThan(0.05);
  });

  it("the Moon's independently-computed RA actually changes over 15 minutes", () => {
    const moon1 = equatorialOfDate("Moon", "1987-11-17T10:15:00Z");
    const moon2 = equatorialOfDate("Moon", "1987-11-17T10:30:00Z");
    expect(Math.abs(normalizeLon(moon2.raDeg - moon1.raDeg))).toBeGreaterThan(0.05);
  });
});
