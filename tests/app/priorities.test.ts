import { describe, expect, it } from "vitest";
import { deriveGoalOrder } from "../../src/app/journey/priorities.js";

describe("deriveGoalOrder", () => {
  it("puts the single selected priority's goal first", () => {
    expect(deriveGoalOrder(["CAREER_MEANING"])[0]).toBe("CAREER");
    expect(deriveGoalOrder(["DEEPER_RELATIONSHIPS"])[0]).toBe("LOVE");
  });

  it("ranks by vote count when multiple priorities map to the same goal", () => {
    // Two GROWTH-mapped picks should outrank one CAREER-mapped pick.
    const order = deriveGoalOrder(["CAREER_MEANING", "FREEDOM", "REINVENTION"]);
    expect(order[0]).toBe("GROWTH");
    expect(order[1]).toBe("CAREER");
  });

  it("breaks a tie by which goal was implied earliest in selection order", () => {
    // CAREER_MEANING selected before DEEPER_RELATIONSHIPS -- CAREER wins the 1-1 tie.
    expect(deriveGoalOrder(["CAREER_MEANING", "DEEPER_RELATIONSHIPS"])[0]).toBe("CAREER");
    expect(deriveGoalOrder(["DEEPER_RELATIONSHIPS", "CAREER_MEANING"])[0]).toBe("LOVE");
  });

  it("appends untouched goals afterward in the default order", () => {
    const order = deriveGoalOrder(["CAREER_MEANING"]);
    expect(order).toEqual(["CAREER", "LOVE", "HOME", "GROWTH"]);
  });

  it("returns all 4 goals exactly once regardless of how many priorities are selected", () => {
    const order = deriveGoalOrder(["CAREER_MEANING", "FREEDOM", "BELONGING"]);
    expect(order.sort()).toEqual(["CAREER", "GROWTH", "HOME", "LOVE"]);
  });
});
