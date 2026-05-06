export type WelcomeCardStackState = {
  cardOrder: number[];
  dragIndex: number | null;
  outgoingIndex: number | null;
};

export function createWelcomeCardStackState(cardCount: number): WelcomeCardStackState {
  return {
    cardOrder: Array.from({ length: cardCount }, (_, index) => index),
    dragIndex: null,
    outgoingIndex: null,
  };
}

export function startWelcomeCardDrag(
  state: WelcomeCardStackState,
): WelcomeCardStackState {
  return {
    ...state,
    dragIndex: state.cardOrder[0] ?? null,
  };
}

export function clearWelcomeCardDrag(
  state: WelcomeCardStackState,
): WelcomeCardStackState {
  return {
    ...state,
    dragIndex: null,
  };
}

export function startWelcomeCardExit(
  state: WelcomeCardStackState,
): WelcomeCardStackState {
  return {
    ...state,
    dragIndex: null,
    outgoingIndex: state.cardOrder[0] ?? null,
  };
}

export function completeWelcomeCardSwipe(
  state: WelcomeCardStackState,
): WelcomeCardStackState {
  if (state.outgoingIndex === null) {
    return clearWelcomeCardDrag(state);
  }

  return {
    cardOrder: [
      ...state.cardOrder.filter((cardIndex) => cardIndex !== state.outgoingIndex),
      state.outgoingIndex,
    ],
    dragIndex: null,
    outgoingIndex: null,
  };
}
