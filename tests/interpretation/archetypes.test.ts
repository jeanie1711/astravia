import { describe, expect, it } from "vitest";
import { getArchetypeCopy } from "../../src/interpretation/archetypes.js";

describe("getArchetypeCopy", () => {
  it("returns copy for every documented archetype id", () => {
    const ids = [
      "VISIBILITY",
      "EXPANSION",
      "CONNECTION",
      "BELONGING",
      "CONNECTOR",
      "MOMENTUM",
      "BUILDER",
      "REINVENTION",
      "VISION",
      "TRANSFORMATION",
      "LAYERED",
      "BALANCED"
    ];
    for (const id of ids) {
      const copy = getArchetypeCopy(id);
      expect(copy.name.length).toBeGreaterThan(0);
      expect(copy.description.length).toBeGreaterThan(0);
    }
  });

  it("falls back to UNCLASSIFIED copy for an unknown id", () => {
    expect(getArchetypeCopy("NOT_A_REAL_ID")).toEqual(getArchetypeCopy("UNCLASSIFIED"));
  });
});
