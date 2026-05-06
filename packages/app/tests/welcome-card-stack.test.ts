import { describe, expect, test } from "bun:test";

import {
  completeWelcomeCardSwipe,
  createWelcomeCardStackState,
  startWelcomeCardExit,
} from "../lib/welcome-card-stack";

describe("welcome card stack", () => {
  test("completes a swipe by hiding the outgoing card before it can return to the top", () => {
    const initialState = createWelcomeCardStackState(4);
    const exitingState = startWelcomeCardExit(initialState);

    const completedState = completeWelcomeCardSwipe(exitingState);

    expect(completedState).toEqual({
      cardOrder: [1, 2, 3, 0],
      dragIndex: null,
      outgoingIndex: null,
    });
  });
});
