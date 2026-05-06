import { describe, expect, test } from "bun:test";

import { getWelcomeLayout } from "../lib/welcome-layout";

describe("welcome layout", () => {
  test("uses a large reference-style card and matching CTA width on standard iPhone screens", () => {
    expect(getWelcomeLayout(393)).toEqual({
      columnWidth: 330,
      cardWidth: 330,
      cardHeight: 429,
      imageHeight: 264,
      buttonWidth: 350,
      buttonHeight: 70,
      heroTopMargin: 0,
      cardTopMargin: 24,
      footerBottomMargin: 62,
    });
  });

  test("keeps the card comfortably inset on narrow screens", () => {
    expect(getWelcomeLayout(360).columnWidth).toBe(324);
    expect(getWelcomeLayout(360).buttonWidth).toBe(338);
  });
});
