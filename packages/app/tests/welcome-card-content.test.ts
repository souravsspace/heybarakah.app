import { describe, expect, test } from "bun:test";

import { welcomeCardContent } from "../constants/welcome-card-content";

describe("welcome card content", () => {
  test("gives every welcome card concise lesson metadata", () => {
    expect(welcomeCardContent).toHaveLength(12);
    expect(welcomeCardContent.every((card) => card.duration === "5 min")).toBe(
      true
    );
    expect(welcomeCardContent.every((card) => card.eyebrow.length > 0)).toBe(
      true
    );
    expect(welcomeCardContent.every((card) => card.detail.length > 0)).toBe(
      true
    );
  });

  test("keeps travel copy focused on prayer lock lessons", () => {
    expect(welcomeCardContent[5]).toMatchObject({
      title: "Stay mindful while traveling",
      eyebrow: "Travel salah",
      detail: "Short lessons for prayer times on the move",
      duration: "5 min",
    });
  });
});
