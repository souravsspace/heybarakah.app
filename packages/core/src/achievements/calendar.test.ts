import { describe, expect, test } from "bun:test";

import {
  enumerateDates,
  isInRamadan,
  isInSacredMonth,
  RAMADAN_RANGES,
  ramadanRangeContaining,
  SACRED_MONTH_RANGES,
} from "./calendar";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

describe("isInRamadan", () => {
  test("start and end boundaries are inclusive", () => {
    expect(isInRamadan("2026-02-18")).toBe(true);
    expect(isInRamadan("2026-03-19")).toBe(true);
  });

  test("mid-range date is inside", () => {
    expect(isInRamadan("2026-03-01")).toBe(true);
  });

  test("day before and after are outside", () => {
    expect(isInRamadan("2026-02-17")).toBe(false);
    expect(isInRamadan("2026-03-20")).toBe(false);
  });

  test("date in no range returns false", () => {
    expect(isInRamadan("2000-01-01")).toBe(false);
  });
});

describe("isInSacredMonth", () => {
  test("boundary inclusive", () => {
    expect(isInSacredMonth("2025-01-01")).toBe(true);
    expect(isInSacredMonth("2025-01-30")).toBe(true);
  });

  test("outside gap returns false", () => {
    expect(isInSacredMonth("2025-02-15")).toBe(false);
  });
});

describe("ramadanRangeContaining", () => {
  test("returns the containing range", () => {
    expect(ramadanRangeContaining("2026-03-01")).toEqual({
      start: "2026-02-18",
      end: "2026-03-19",
    });
  });

  test("returns null when outside every range", () => {
    expect(ramadanRangeContaining("2026-04-01")).toBeNull();
  });
});

describe("enumerateDates", () => {
  test("inclusive of both endpoints, ascending, no gaps", () => {
    const dates = enumerateDates({ start: "2026-02-18", end: "2026-02-21" });
    expect(dates).toEqual([
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
      "2026-02-21",
    ]);
  });

  test("single-day range yields one date", () => {
    expect(enumerateDates({ start: "2026-03-01", end: "2026-03-01" })).toEqual([
      "2026-03-01",
    ]);
  });

  test("crosses month boundary correctly", () => {
    const dates = enumerateDates({ start: "2026-02-27", end: "2026-03-02" });
    expect(dates).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
    ]);
  });

  test("length of a real Ramadan range matches inclusive day count", () => {
    const range = { start: "2026-02-18", end: "2026-03-19" };
    // 30 days inclusive.
    expect(enumerateDates(range)).toHaveLength(30);
  });
});

describe("range table invariants", () => {
  test("every range has start <= end", () => {
    for (const r of [...RAMADAN_RANGES, ...SACRED_MONTH_RANGES]) {
      expect(r.start <= r.end).toBe(true);
    }
  });

  test("ranges use ISO YYYY-MM-DD keys", () => {
    for (const r of [...RAMADAN_RANGES, ...SACRED_MONTH_RANGES]) {
      expect(r.start).toMatch(ISO_DATE);
      expect(r.end).toMatch(ISO_DATE);
    }
  });

  test("ramadan ranges are chronologically sorted and non-overlapping", () => {
    for (let i = 1; i < RAMADAN_RANGES.length; i++) {
      expect(RAMADAN_RANGES[i - 1].end < RAMADAN_RANGES[i].start).toBe(true);
    }
  });
});
