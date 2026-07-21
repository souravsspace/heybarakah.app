import { describe, expect, test } from "bun:test";
import { TOPIC_QUERY_KEYS } from "@/lib/sync-topics";

describe("TOPIC_QUERY_KEYS", () => {
  test("prayer-logs fans out to logs, streak and achievements", () => {
    expect(TOPIC_QUERY_KEYS["prayer-logs"]).toEqual([
      ["cf", "prayer-logs"],
      ["cf", "streak"],
      ["cf", "achievements"],
      ["cf", "achievements", "unseen"],
    ]);
  });

  test("every topic maps to at least one cf-scoped key", () => {
    for (const keys of Object.values(TOPIC_QUERY_KEYS)) {
      expect(keys.length).toBeGreaterThan(0);
      for (const key of keys) {
        expect(Array.isArray(key)).toBe(true);
        expect(key[0]).toBe("cf");
      }
    }
  });

  test("covers the expected topic set", () => {
    expect(Object.keys(TOPIC_QUERY_KEYS).sort()).toEqual([
      "achievements",
      "dhikr",
      "locations",
      "me",
      "prayer-logs",
      "shield",
      "subscription",
    ]);
  });

  test("single-key topics map to their own key", () => {
    expect(TOPIC_QUERY_KEYS.me).toEqual([["cf", "me"]]);
    expect(TOPIC_QUERY_KEYS.shield).toEqual([["cf", "shield"]]);
    expect(TOPIC_QUERY_KEYS.dhikr).toEqual([["cf", "dhikr"]]);
  });
});
