import { describe, expect, it } from "vitest";
import { lookupSynthesis } from "../../src/interpretation/combinations.js";

describe("lookupSynthesis", () => {
  it("finds an exact influence-pair rule regardless of argument order", () => {
    const a = { body: "Sun" as const, angle: "MC" as const };
    const b = { body: "Jupiter" as const, angle: "MC" as const };
    const forward = lookupSynthesis(a, b);
    const backward = lookupSynthesis(b, a);
    expect(forward).toBeDefined();
    expect(forward).toEqual(backward);
    expect(forward!.synthesis).toBe("Visibility meets expansion.");
  });

  it("finds a body-level 'strong pair' rule regardless of angle", () => {
    const mars = { body: "Mars" as const, angle: "ASC" as const };
    const pluto = { body: "Pluto" as const, angle: "DSC" as const };
    const result = lookupSynthesis(mars, pluto);
    expect(result).toBeDefined();
    expect(result!.synthesis).toBe("Intensity compounds.");
  });

  it("returns undefined for a pair with no documented rule", () => {
    const a = { body: "Saturn" as const, angle: "DSC" as const };
    const b = { body: "Mercury" as const, angle: "ASC" as const };
    expect(lookupSynthesis(a, b)).toBeUndefined();
  });
});
