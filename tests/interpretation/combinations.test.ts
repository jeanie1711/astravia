import { describe, expect, it } from "vitest";
import { lookupSynthesis } from "../../src/interpretation/combinations.js";

// v0.3 (06-interpretation-library.md §3, 2026-09-13 City Story redesign):
// synthesis is generated from the category-pair tier (Reinforcing/Layered/
// Complex-effortful) instead of a hand-authored per-pair table, so it's
// defined for every possible pair -- there is no "undocumented pair" case.
// The first argument is always the primary influence, the second always
// the reinforcement (paran or secondary) -- unlike v0.2, this is now an
// order-dependent contract matching how compose-city-story.ts calls it.
describe("lookupSynthesis", () => {
  it("Reinforcing: both Personal/Benefic -> a doubled-down synthesis naming the reinforcement's theme", () => {
    const sunMc = { body: "Sun" as const, angle: "MC" as const };
    const jupiterMc = { body: "Jupiter" as const, angle: "MC" as const };
    const result = lookupSynthesis(sunMc, jupiterMc, false, "en");
    expect(result.synthesis).toContain("Sun–Jupiter influence reinforces it");
    expect(result.synthesis).toContain("professional growth, opportunity, visibility");
  });

  it("names a paran distinctly from a plain secondary influence (06 §5)", () => {
    const sunMc = { body: "Sun" as const, angle: "MC" as const };
    const jupiterMc = { body: "Jupiter" as const, angle: "MC" as const };
    const paran = lookupSynthesis(sunMc, jupiterMc, true, "en");
    const secondary = lookupSynthesis(sunMc, jupiterMc, false, "en");
    expect(paran.synthesis).toContain("paran");
    expect(secondary.synthesis).toContain("influence");
    expect(secondary.synthesis).not.toContain("paran");
  });

  it("Complex/effortful: both Malefic/Transformative -> a compounding, demanding synthesis", () => {
    const marsMc = { body: "Mars" as const, angle: "MC" as const };
    const plutoMc = { body: "Pluto" as const, angle: "MC" as const };
    const result = lookupSynthesis(marsMc, plutoMc, false, "en");
    expect(result.synthesis).toContain("doesn't come easily");
    expect(result.story).toContain("both deserve real attention");
  });

  it("Layered: primary easeful, reinforcement challenging -> weight is named", () => {
    const mercuryAsc = { body: "Mercury" as const, angle: "ASC" as const };
    const saturnDsc = { body: "Saturn" as const, angle: "DSC" as const };
    const result = lookupSynthesis(mercuryAsc, saturnDsc, true, "en");
    expect(result.synthesis).toContain("not simply a straightforward Mercury story");
    expect(result.synthesis).toContain("weight and responsibility");
  });

  it("Layered: primary challenging, reinforcement easeful -> the reinforcement lightens it, doesn't add weight", () => {
    const saturnDsc = { body: "Saturn" as const, angle: "DSC" as const };
    const mercuryAsc = { body: "Mercury" as const, angle: "ASC" as const };
    const result = lookupSynthesis(saturnDsc, mercuryAsc, false, "en");
    expect(result.synthesis).toContain("story of weight and responsibility");
    expect(result.synthesis).toContain("brings curiosity, adaptability, social intelligence into the mix");
  });

  it("is always defined -- category-pair coverage has no gaps", () => {
    const a = { body: "Saturn" as const, angle: "DSC" as const };
    const b = { body: "Mercury" as const, angle: "ASC" as const };
    expect(lookupSynthesis(a, b, false, "en")).toBeDefined();
  });
});
