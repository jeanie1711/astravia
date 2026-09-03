import { describe, expect, it } from "vitest";
import { computeAllLinesAtInstant } from "../../src/astro/lines.js";

describe("G006 determinism", () => {
  it("same input produces byte-equivalent structured output after canonical JSON serialization", () => {
    const utcIso = "1987-11-17T10:30:00Z";
    const a = computeAllLinesAtInstant(utcIso);
    const b = computeAllLinesAtInstant(utcIso);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
