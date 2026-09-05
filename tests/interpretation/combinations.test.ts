import { describe, expect, it } from "vitest";
import { lookupSynthesis } from "../../src/interpretation/combinations.js";

// v0.2 (06-interpretation-library.md §3): synthesis is generated from the
// category-pair tier (Reinforcing/Layered/Complex-effortful) instead of a
// 25-pair lookup table, so it's defined for every possible pair -- there is
// no "undocumented pair" case any more.
describe("lookupSynthesis", () => {
  it("Reinforcing: both Personal/Benefic -> a doubled-down synthesis, primary's theme first", () => {
    const sunMc = { body: "Sun" as const, angle: "MC" as const };
    const jupiterMc = { body: "Jupiter" as const, angle: "MC" as const };
    const result = lookupSynthesis(sunMc, jupiterMc);
    expect(result.synthesis).toContain("doubled-down signal");
    expect(result.synthesis.startsWith("Visibility, professional identity, recognition")).toBe(true);
  });

  it("Complex/effortful: both Malefic/Transformative -> a compounding, demanding synthesis", () => {
    const marsMc = { body: "Mars" as const, angle: "MC" as const };
    const plutoMc = { body: "Pluto" as const, angle: "MC" as const };
    const result = lookupSynthesis(marsMc, plutoMc);
    expect(result.synthesis).toContain("demanding on every side");
  });

  it("Layered: one challenging, one not -> a layered, opportunity-alongside-effort synthesis", () => {
    const saturnDsc = { body: "Saturn" as const, angle: "DSC" as const };
    const mercuryAsc = { body: "Mercury" as const, angle: "ASC" as const };
    const result = lookupSynthesis(saturnDsc, mercuryAsc);
    expect(result.synthesis).toContain("opportunity alongside effort");
    // The easeful influence's theme leads, regardless of which argument it was.
    expect(result.synthesis.startsWith("Curiosity, adaptability, social intelligence")).toBe(true);
  });

  it("is always defined -- category-pair coverage has no gaps, unlike the old 25-pair table", () => {
    const a = { body: "Saturn" as const, angle: "DSC" as const };
    const b = { body: "Mercury" as const, angle: "ASC" as const };
    expect(lookupSynthesis(a, b)).toBeDefined();
  });
});
