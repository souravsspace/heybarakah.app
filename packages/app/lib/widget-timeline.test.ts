import { describe, expect, test } from "bun:test";
import { buildTimelineEntries, DEFAULT_SNAPSHOT } from "@/lib/widget-timeline";
import type { WidgetSnapshot } from "@/lib/widgets-native";

/**
 * The App Group `UserDefaults` write rejects the whole timeline array if any
 * value is not property-list-safe (a JS `null` becomes `NSNull`, a non-finite
 * number stays `NaN`). A rejected write leaves the widget extension with an
 * empty timeline → WidgetKit `CHSErrorDomain 1101` placeholder. These tests
 * pin that every entry's props are pure plist after `buildTimelineEntries`.
 */
function findUnsafe(value: unknown, path = "props"): string[] {
  if (value === null) {
    return [`${path} === null`];
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? [] : [`${path} === ${value}`];
  }
  if (value === undefined) {
    return [`${path} === undefined`];
  }
  if (typeof value === "string" || typeof value === "boolean") {
    return [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, i) => findUnsafe(item, `${path}[${i}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) =>
      findUnsafe(item, `${path}.${key}`)
    );
  }
  return [`${path} is ${typeof value}`];
}

describe("buildTimelineEntries plist safety", () => {
  test("DEFAULT_SNAPSHOT (lockNow/tomorrowFajrISO null) yields no null/undefined/NaN props", () => {
    const entries = buildTimelineEntries(DEFAULT_SNAPSHOT);
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(findUnsafe(entry.props)).toEqual([]);
    }
  });

  test("null top-level fields are dropped, not converted", () => {
    const [{ props }] = buildTimelineEntries(DEFAULT_SNAPSHOT);
    expect("lockNow" in props).toBe(false);
    expect("tomorrowFajrISO" in props).toBe(false);
  });

  test("non-finite numbers are coerced to 0", () => {
    const snapshot: WidgetSnapshot = {
      ...DEFAULT_SNAPSHOT,
      dhikr: {
        count: Number.NaN,
        sessionTotal: Number.POSITIVE_INFINITY,
        target: 33,
      },
    };
    const [{ props }] = buildTimelineEntries(snapshot);
    expect(props.dhikr.count).toBe(0);
    expect(props.dhikr.sessionTotal).toBe(0);
    expect(props.dhikr.target).toBe(33);
  });

  test("empty-prayer seed pads the timeline with future runway", () => {
    const entries = buildTimelineEntries(DEFAULT_SNAPSHOT);
    expect(entries.length).toBeGreaterThan(1);
    const now = Date.now();
    expect(entries.at(-1)?.date.getTime()).toBeGreaterThan(now);
  });
});
