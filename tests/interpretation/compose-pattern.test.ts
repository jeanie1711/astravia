import { describe, expect, it } from "vitest";
import { detectPattern } from "../../src/interpretation/compose-pattern.js";
import type { Influence, RankedCity, StabilityLabel } from "../../src/scoring/types.js";

function city(
  cityId: string,
  primaryInfluence: Influence | undefined,
  secondaryInfluences: Influence[] = [],
  stability: StabilityLabel = "HIGH"
): RankedCity {
  return {
    cityId,
    goal: "CAREER",
    internalScore: 0.7,
    stars: 4,
    label: "Strong",
    primaryInfluence,
    secondaryInfluences,
    coherence: "MEDIUM",
    stability,
    archetypeId: "VISIBILITY"
  };
}

const sunMc: Influence = { body: "Sun", angle: "MC" };
const venusAsc: Influence = { body: "Venus", angle: "ASC" };
const saturnAsc: Influence = { body: "Saturn", angle: "ASC" };

describe("detectPattern", () => {
  it("detects the Sun-MC visibility pattern at >=3 cities", () => {
    const cities = [city("a", sunMc), city("b", sunMc), city("c", sunMc)];
    expect(detectPattern(cities)).toBe(
      "Visibility and professional identity repeat across several of your strongest locations."
    );
  });

  it("detects the Venus pattern when Venus appears as primary or secondary at >=3 cities", () => {
    const cities = [
      city("a", venusAsc),
      city("b", { body: "Sun", angle: "MC" }, [venusAsc]),
      city("c", venusAsc)
    ];
    expect(detectPattern(cities)).toBe("Connection, collaboration and social ease are recurring themes across your map.");
  });

  it("detects the Saturn/Pluto-as-secondary pattern at >=3 cities", () => {
    // Deliberately varied primaries so the Sun-MC pattern (checked first)
    // doesn't win by coincidence -- this test is specifically about the
    // Saturn/Pluto-secondary rule.
    const cities = [
      city("a", { body: "Mars", angle: "MC" }, [saturnAsc]),
      city("b", { body: "Mercury", angle: "MC" }, [{ body: "Pluto", angle: "MC" }]),
      city("c", { body: "Mars", angle: "ASC" }, [saturnAsc])
    ];
    expect(detectPattern(cities)).toBe(
      "Many of your strongest places pair opportunity with responsibility or transformation; your map is not primarily an \"easy path\" pattern."
    );
  });

  it("detects the high-stability pattern when nothing else qualifies", () => {
    const cities = [
      city("a", { body: "Mars", angle: "MC" }, [], "HIGH"),
      city("b", { body: "Mercury", angle: "IC" }, [], "EXACT"),
      city("c", { body: "Uranus", angle: "ASC" }, [], "HIGH")
    ];
    expect(detectPattern(cities)).toBe("Your strongest recommendations remain relatively consistent across your birth-time range.");
  });

  it("detects the time-sensitive pattern when nothing else qualifies", () => {
    const cities = [
      city("a", { body: "Mars", angle: "MC" }, [], "TIME_SENSITIVE"),
      city("b", { body: "Mercury", angle: "IC" }, [], "TIME_SENSITIVE"),
      city("c", { body: "Uranus", angle: "ASC" }, [], "TIME_SENSITIVE")
    ];
    expect(detectPattern(cities)).toBe(
      "Your ranking changes noticeably across your birth-time range, so exact birth time matters more for this chart."
    );
  });

  it("returns undefined when no threshold is met (section omitted)", () => {
    const cities = [city("a", sunMc), city("b", venusAsc)];
    expect(detectPattern(cities)).toBeUndefined();
  });

  it("I006: pattern text never claims a fixed personality trait about the user", () => {
    const cities = [city("a", sunMc), city("b", sunMc), city("c", sunMc)];
    const pattern = detectPattern(cities)!;
    expect(pattern.toLowerCase()).not.toMatch(/\byou are\b/);
  });
});
