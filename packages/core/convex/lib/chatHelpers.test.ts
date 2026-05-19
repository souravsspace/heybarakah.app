import { describe, expect, it } from "bun:test";
import { deriveTitle } from "./chatHelpers";

describe("deriveTitle", () => {
  it("returns trimmed text when shorter than max", () => {
    expect(deriveTitle("Why is Fajr obligatory?")).toBe(
      "Why is Fajr obligatory?"
    );
  });

  it("collapses internal whitespace", () => {
    expect(deriveTitle("  multiple    spaces   here  ")).toBe(
      "multiple spaces here"
    );
  });

  it("truncates with an ellipsis when over the max length", () => {
    const long =
      "Tell me about the virtues of patience across many many sources please.";
    const title = deriveTitle(long);
    expect(title.endsWith("…")).toBe(true);
    expect(title.length).toBe(48);
  });

  it("falls back to a default when given empty input", () => {
    expect(deriveTitle("   ")).toBe("New conversation");
  });
});
