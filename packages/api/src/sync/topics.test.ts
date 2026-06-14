import { describe, expect, it } from "vitest";

import { SYNC_TOPICS, topicForPath } from "@/sync/topics";

describe("topicForPath", () => {
  it("maps a base domain path to its topic", () => {
    expect(topicForPath("/api/v1/prayer-logs")).toBe("prayer-logs");
    expect(topicForPath("/api/v1/shield")).toBe("shield");
    expect(topicForPath("/api/v1/me")).toBe("me");
    expect(topicForPath("/api/v1/subscription")).toBe("subscription");
    expect(topicForPath("/api/v1/locations")).toBe("locations");
    expect(topicForPath("/api/v1/achievements")).toBe("achievements");
  });

  it("maps nested sub-paths to the parent domain topic", () => {
    expect(topicForPath("/api/v1/prayer-logs/clear")).toBe("prayer-logs");
    expect(topicForPath("/api/v1/me/profile")).toBe("me");
    expect(topicForPath("/api/v1/me/avatar")).toBe("me");
    expect(topicForPath("/api/v1/locations/abc123/active")).toBe("locations");
    expect(topicForPath("/api/v1/shield/ios")).toBe("shield");
    expect(topicForPath("/api/v1/dhikr/presets/increment")).toBe("dhikr");
  });

  it("ignores a trailing query string", () => {
    expect(topicForPath("/api/v1/prayer-logs/week?startDate=2026-06-12")).toBe(
      "prayer-logs"
    );
  });

  it("returns null for non-reactive or unknown domains", () => {
    expect(topicForPath("/api/v1/health")).toBeNull();
    expect(topicForPath("/api/v1/prayer-times")).toBeNull();
    expect(topicForPath("/api/v1/app-config")).toBeNull();
    expect(topicForPath("/api/auth/sign-in/email")).toBeNull();
    expect(topicForPath("/")).toBeNull();
  });

  it("keeps every topic value a stable string", () => {
    for (const value of Object.values(SYNC_TOPICS)) {
      expect(typeof value).toBe("string");
    }
  });
});
