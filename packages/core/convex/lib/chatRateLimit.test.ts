import { describe, expect, it } from "bun:test";
import { DAILY_CHAT_LIMIT, todayKey } from "./chatRateLimit";

describe("todayKey", () => {
  it("formats a fixed timestamp as YYYY-MM-DD in UTC", () => {
    const ts = Date.UTC(2026, 4, 19, 12, 0, 0);
    expect(todayKey(ts)).toBe("2026-05-19");
  });

  it("pads single-digit month and day with leading zeros", () => {
    const ts = Date.UTC(2026, 0, 3, 0, 0, 0);
    expect(todayKey(ts)).toBe("2026-01-03");
  });

  it("stays in UTC across the day boundary", () => {
    const ts = Date.UTC(2026, 11, 31, 23, 59, 59);
    expect(todayKey(ts)).toBe("2026-12-31");
  });
});

describe("DAILY_CHAT_LIMIT", () => {
  it("is the contractually agreed 100/day cap", () => {
    expect(DAILY_CHAT_LIMIT).toBe(100);
  });
});
