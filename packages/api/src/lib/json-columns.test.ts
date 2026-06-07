import { describe, expect, it } from "vitest";

import { parseJson, stringifyJson } from "@/lib/json-columns";

describe("json-columns", () => {
  it("round-trips a value", () => {
    const value = { a: 1, b: ["x", "y"], c: { d: true } };
    expect(parseJson(stringifyJson(value))).toEqual(value);
  });

  it("returns null for null/undefined input", () => {
    expect(parseJson(null)).toBeNull();
    expect(parseJson(undefined)).toBeNull();
  });

  it("returns null for malformed json instead of throwing", () => {
    expect(parseJson("{not json")).toBeNull();
  });
});
