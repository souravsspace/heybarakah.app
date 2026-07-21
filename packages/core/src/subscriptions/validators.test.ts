import { describe, expect, test } from "bun:test";

import {
  PRODUCT_IDS,
  REVENUE_CAT_PERIOD_TYPES,
  REVENUE_CAT_STORES,
} from "./validators";

describe("subscription validator tables", () => {
  test("PRODUCT_IDS covers the four tiers", () => {
    expect(PRODUCT_IDS).toEqual(["yearly", "monthly", "family", "lifetime"]);
  });

  test("REVENUE_CAT_STORES includes the platform stores", () => {
    expect(REVENUE_CAT_STORES).toContain("app_store");
    expect(REVENUE_CAT_STORES).toContain("play_store");
    expect(REVENUE_CAT_STORES).toContain("stripe");
  });

  test("REVENUE_CAT_PERIOD_TYPES are normal/trial/intro", () => {
    expect(REVENUE_CAT_PERIOD_TYPES).toEqual(["normal", "trial", "intro"]);
  });

  test("all tables have unique entries", () => {
    for (const table of [
      PRODUCT_IDS,
      REVENUE_CAT_STORES,
      REVENUE_CAT_PERIOD_TYPES,
    ]) {
      expect(new Set(table).size).toBe(table.length);
    }
  });
});
