import { describe, expect, test } from "bun:test";
import { getWelcomeLayout } from "@/lib/welcome-layout";

describe("getWelcomeLayout", () => {
  test("clamps column width to [318, 330]", () => {
    expect(getWelcomeLayout(200).columnWidth).toBe(318); // (200-36)=164 → floored to 318
    expect(getWelcomeLayout(1000).columnWidth).toBe(330); // (1000-36) → capped at 330
  });

  test("column width tracks screen within the band", () => {
    // 360-36 = 324, inside [318,330]
    expect(getWelcomeLayout(360).columnWidth).toBe(324);
  });

  test("card width equals column width", () => {
    const l = getWelcomeLayout(360);
    expect(l.cardWidth).toBe(l.columnWidth);
  });

  test("derived heights are rounded multiples of card width", () => {
    const l = getWelcomeLayout(360);
    expect(l.cardHeight).toBe(Math.round(l.cardWidth * 1.3));
    expect(l.imageHeight).toBe(Math.round(l.cardWidth * 0.8));
  });

  test("button width capped at 350", () => {
    expect(getWelcomeLayout(1000).buttonWidth).toBe(350);
    expect(getWelcomeLayout(300).buttonWidth).toBe(300 - 22);
  });

  test("static margins are constant", () => {
    const l = getWelcomeLayout(400);
    expect(l.buttonHeight).toBe(70);
    expect(l.heroTopMargin).toBe(0);
    expect(l.cardTopMargin).toBe(24);
    expect(l.footerBottomMargin).toBe(62);
  });
});
