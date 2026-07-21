import { describe, expect, test } from "bun:test";
import { semverLt } from "@/lib/semver";

describe("semverLt", () => {
  test("lower major/minor/patch returns true", () => {
    expect(semverLt("1.0.0", "2.0.0")).toBe(true);
    expect(semverLt("1.2.0", "1.3.0")).toBe(true);
    expect(semverLt("1.2.3", "1.2.4")).toBe(true);
  });

  test("higher or equal returns false", () => {
    expect(semverLt("2.0.0", "1.9.9")).toBe(false);
    expect(semverLt("1.2.3", "1.2.3")).toBe(false);
    expect(semverLt("1.10.0", "1.9.0")).toBe(false);
  });

  test("missing parts count as zero", () => {
    expect(semverLt("0.9", "0.9.2")).toBe(true);
    expect(semverLt("0.9.0", "0.9")).toBe(false);
    expect(semverLt("1", "1.0.0")).toBe(false);
  });

  test("numeric (not lexical) comparison of parts", () => {
    expect(semverLt("1.9.0", "1.10.0")).toBe(true);
    expect(semverLt("1.10.0", "1.9.0")).toBe(false);
  });

  test("non-numeric parts treated as zero", () => {
    expect(semverLt("1.x.0", "1.0.1")).toBe(true);
    expect(semverLt("1.0.0", "1.x.0")).toBe(false);
  });

  test("trims surrounding whitespace", () => {
    expect(semverLt("  1.0.0  ", "1.0.1")).toBe(true);
  });
});
