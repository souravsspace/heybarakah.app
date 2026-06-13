import { describe, expect, it } from "vitest";

import {
  BACKFILL_ORDER,
  type ConvexDoc,
  toD1Row,
  toInsertSql,
  toSqlLiteral,
} from "./transform";

const fixedId = () => "generated-uuid";

describe("toD1Row", () => {
  it("preserves authUserId and drops Convex internal fields", () => {
    const doc: ConvexDoc = {
      _id: "convex123",
      _creationTime: 1_700_000_000_000,
      authUserId: "user_abc",
      date: "2026-06-09",
      prayer: "fajr",
      status: "on_time",
      updatedAt: 1_700_000_000_001,
    };
    const row = toD1Row("prayerLogs", doc, fixedId);
    expect(row.authUserId).toBe("user_abc");
    expect(row).not.toHaveProperty("_id");
    expect(row).not.toHaveProperty("_creationTime");
    expect(row.id).toBe("generated-uuid");
  });

  it("preserves the original id for Better Auth identity tables", () => {
    const doc: ConvexDoc = { _id: "auth_user_1", email: "a@b.com" };
    const row = toD1Row("user", doc, fixedId);
    // This id IS the authUserId every app row references — must not change.
    expect(row.id).toBe("auth_user_1");
  });

  it("serializes object/array values to JSON strings", () => {
    const doc: ConvexDoc = {
      _id: "x",
      authUserId: "u",
      timings: [{ date: "2026-06-09" }],
      raw: { a: 1 },
    };
    const row = toD1Row("prayerTimeCaches" as never, doc, fixedId);
    expect(row.timings).toBe('[{"date":"2026-06-09"}]');
    expect(row.raw).toBe('{"a":1}');
  });

  it("omits undefined fields (optional Convex values)", () => {
    const doc: ConvexDoc = { _id: "x", authUserId: "u", city: undefined };
    const row = toD1Row("userLocations", doc, fixedId);
    expect(row).not.toHaveProperty("city");
  });
});

describe("toSqlLiteral", () => {
  it("escapes single quotes", () => {
    expect(toSqlLiteral("O'Brien")).toBe("'O''Brien'");
  });
  it("maps null/undefined to NULL and booleans to 0/1", () => {
    expect(toSqlLiteral(null)).toBe("NULL");
    expect(toSqlLiteral(undefined)).toBe("NULL");
    expect(toSqlLiteral(true)).toBe("1");
    expect(toSqlLiteral(false)).toBe("0");
  });
  it("emits finite numbers raw and non-finite as NULL", () => {
    expect(toSqlLiteral(42)).toBe("42");
    expect(toSqlLiteral(Number.POSITIVE_INFINITY)).toBe("NULL");
  });
});

describe("toInsertSql", () => {
  it("builds a multi-row insert keyed on the first row's columns", () => {
    const sql = toInsertSql("dhikrAggregate", [
      { id: "1", authUserId: "u1", total: 10 },
      { id: "2", authUserId: "u2", total: 20 },
    ]);
    expect(sql).toContain('INSERT OR IGNORE INTO "dhikrAggregate"');
    expect(sql).toContain(`('1', 'u1', 10)`);
    expect(sql).toContain(`('2', 'u2', 20)`);
  });
  it("returns empty string for no rows", () => {
    expect(toInsertSql("users", [])).toBe("");
  });

  it("uses the union of keys across heterogeneous rows (missing → NULL, no data dropped)", () => {
    const sql = toInsertSql("userLocations" as never, [
      { id: "1", a: "x", b: "y" },
      { id: "2", a: "z", c: "w" },
    ]);
    // Column list is the union in first-seen order, id first.
    expect(sql).toContain(
      'INSERT OR IGNORE INTO "userLocations" ("id", "a", "b", "c") VALUES'
    );
    // Row 1 lacks `c` → trailing NULL; its `b` value is preserved.
    expect(sql).toContain(`('1', 'x', 'y', NULL)`);
    // Row 2 lacks `b` → NULL in that slot; its `c` value is NOT dropped.
    expect(sql).toContain(`('2', 'z', NULL, 'w')`);
  });
});

describe("BACKFILL_ORDER", () => {
  it("imports identity tables before user-keyed data", () => {
    expect(BACKFILL_ORDER.indexOf("user")).toBeLessThan(
      BACKFILL_ORDER.indexOf("users")
    );
    expect(BACKFILL_ORDER.indexOf("users")).toBeLessThan(
      BACKFILL_ORDER.indexOf("prayerLogs")
    );
  });
});
