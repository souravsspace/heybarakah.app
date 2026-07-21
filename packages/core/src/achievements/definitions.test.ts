import { describe, expect, test } from "bun:test";

import { ACHIEVEMENT_CODES, ACHIEVEMENTS } from "./definitions";

const TIERS = new Set(["bronze", "silver", "gold"]);
const CATEGORIES = new Set([
  "beginnings",
  "continuity",
  "fajr",
  "mercy",
  "night",
  "reflection",
  "remembrance",
  "salah",
  "seasons",
]);

describe("ACHIEVEMENTS", () => {
  test("is non-empty", () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  test("codes are unique", () => {
    const codes = ACHIEVEMENTS.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  test("every entry has required non-empty fields", () => {
    for (const a of ACHIEVEMENTS) {
      expect(a.code).toBeTruthy();
      expect(a.title).toBeTruthy();
      expect(a.description).toBeTruthy();
      expect(a.icon).toBeTruthy();
    }
  });

  test("tier is one of bronze/silver/gold", () => {
    for (const a of ACHIEVEMENTS) {
      expect(TIERS.has(a.tier)).toBe(true);
    }
  });

  test("category is a known category", () => {
    for (const a of ACHIEVEMENTS) {
      expect(CATEGORIES.has(a.category)).toBe(true);
    }
  });

  test("quotes, when present, carry text and source", () => {
    for (const a of ACHIEVEMENTS) {
      if (a.quote) {
        expect(a.quote.text).toBeTruthy();
        expect(a.quote.source).toBeTruthy();
      }
    }
  });
});

describe("ACHIEVEMENT_CODES", () => {
  test("mirrors ACHIEVEMENTS order and length", () => {
    expect(ACHIEVEMENT_CODES).toEqual(ACHIEVEMENTS.map((a) => a.code));
  });

  test("contains the terminal 'complete' achievement", () => {
    expect(ACHIEVEMENT_CODES).toContain("complete");
  });
});
