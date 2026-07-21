import { describe, expect, test } from "bun:test";

import { ALL_WINDOWS } from "./validators";

describe("ALL_WINDOWS", () => {
  test("holds the five notifiable prayer windows in order", () => {
    expect(ALL_WINDOWS).toEqual(["fajr", "dhuhr", "asr", "maghrib", "isha"]);
  });

  test("excludes sunrise", () => {
    expect(ALL_WINDOWS).not.toContain("sunrise");
  });

  test("entries are unique", () => {
    expect(new Set(ALL_WINDOWS).size).toBe(ALL_WINDOWS.length);
  });
});
