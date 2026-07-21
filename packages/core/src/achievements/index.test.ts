import { describe, expect, test } from "bun:test";

import * as achievements from "./index";

describe("achievements barrel", () => {
  test("re-exports calendar helpers", () => {
    expect(typeof achievements.isInRamadan).toBe("function");
    expect(typeof achievements.isInSacredMonth).toBe("function");
    expect(typeof achievements.enumerateDates).toBe("function");
  });

  test("re-exports definitions", () => {
    expect(Array.isArray(achievements.ACHIEVEMENTS)).toBe(true);
    expect(Array.isArray(achievements.ACHIEVEMENT_CODES)).toBe(true);
  });

  test("re-exports evaluate helpers", () => {
    expect(typeof achievements.evaluateAchievements).toBe("function");
    expect(typeof achievements.evaluateAllProgress).toBe("function");
  });
});
