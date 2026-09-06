import { describe, expect, it } from "vitest";
import { classifyDiscovery } from "../../src/app/components/discoveryLabel.js";

describe("classifyDiscovery", () => {
  it("always reads as a strong regional pattern for CORRIDOR, regardless of population", () => {
    expect(classifyDiscovery("CORRIDOR", 5, 50)).toBe("STRONG_PATTERN");
    expect(classifyDiscovery("CORRIDOR", 2, 5_000_000)).toBe("STRONG_PATTERN");
  });

  it("classifies a well-known top city as familiar", () => {
    expect(classifyDiscovery("ANCHOR", 4, 3_000_000)).toBe("FAMILIAR");
  });

  it("classifies an obscure top city with a strong match as unexpected", () => {
    expect(classifyDiscovery("ANCHOR", 5, 46)).toBe("UNEXPECTED");
    expect(classifyDiscovery("MIXED", 4, 100_000)).toBe("UNEXPECTED");
  });

  it("classifies an obscure top city with a weaker match as a wildcard", () => {
    expect(classifyDiscovery("ANCHOR", 3, 46)).toBe("WILDCARD");
    expect(classifyDiscovery("MIXED", 2, 100_000)).toBe("WILDCARD");
  });

  it("classifies a mid-familiarity top city as worth exploring", () => {
    expect(classifyDiscovery("ANCHOR", 4, 800_000)).toBe("WORTH_EXPLORING");
  });

  it("treats a missing population as obscure rather than familiar", () => {
    expect(classifyDiscovery("ANCHOR", 5, undefined)).toBe("UNEXPECTED");
  });
});
