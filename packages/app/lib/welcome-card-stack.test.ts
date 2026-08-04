import { describe, expect, test } from "bun:test";
import {
  clearWelcomeCardDrag,
  completeWelcomeCardSwipe,
  createWelcomeCardStackState,
  startWelcomeCardDrag,
  startWelcomeCardExit,
} from "@/lib/welcome-card-stack";

describe("welcome-card-stack", () => {
  test("create builds sequential order with null drag/outgoing", () => {
    expect(createWelcomeCardStackState(3)).toEqual({
      cardOrder: [0, 1, 2],
      dragIndex: null,
      outgoingIndex: null,
    });
  });

  test("create with zero cards yields empty order", () => {
    expect(createWelcomeCardStackState(0).cardOrder).toEqual([]);
  });

  test("startDrag sets dragIndex to front card", () => {
    const s = startWelcomeCardDrag(createWelcomeCardStackState(3));
    expect(s.dragIndex).toBe(0);
    expect(s.cardOrder).toEqual([0, 1, 2]);
  });

  test("startDrag on empty stack sets dragIndex null", () => {
    expect(
      startWelcomeCardDrag(createWelcomeCardStackState(0)).dragIndex
    ).toBeNull();
  });

  test("clearDrag resets dragIndex only", () => {
    const dragged = startWelcomeCardDrag(createWelcomeCardStackState(3));
    const cleared = clearWelcomeCardDrag(dragged);
    expect(cleared.dragIndex).toBeNull();
    expect(cleared.cardOrder).toEqual([0, 1, 2]);
  });

  test("startExit marks front card outgoing and clears drag", () => {
    const s = startWelcomeCardExit(
      startWelcomeCardDrag(createWelcomeCardStackState(3))
    );
    expect(s.outgoingIndex).toBe(0);
    expect(s.dragIndex).toBeNull();
  });

  test("completeSwipe rotates outgoing card to the back", () => {
    let s = createWelcomeCardStackState(3);
    s = startWelcomeCardExit(s);
    s = completeWelcomeCardSwipe(s);
    expect(s.cardOrder).toEqual([1, 2, 0]);
    expect(s.outgoingIndex).toBeNull();
    expect(s.dragIndex).toBeNull();
  });

  test("completeSwipe without outgoing just clears drag", () => {
    const s = startWelcomeCardDrag(createWelcomeCardStackState(3));
    const done = completeWelcomeCardSwipe(s);
    expect(done.cardOrder).toEqual([0, 1, 2]);
    expect(done.dragIndex).toBeNull();
  });

  test("full cycle returns to original order after N swipes", () => {
    let s = createWelcomeCardStackState(3);
    for (let i = 0; i < 3; i++) {
      s = completeWelcomeCardSwipe(startWelcomeCardExit(s));
    }
    expect(s.cardOrder).toEqual([0, 1, 2]);
  });
});
