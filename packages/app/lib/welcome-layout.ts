export type WelcomeLayout = {
  columnWidth: number;
  cardWidth: number;
  cardHeight: number;
  imageHeight: number;
  buttonWidth: number;
  buttonHeight: number;
  heroTopMargin: number;
  cardTopMargin: number;
  footerBottomMargin: number;
};

export function getWelcomeLayout(screenWidth: number): WelcomeLayout {
  const columnWidth = Math.min(Math.max(screenWidth - 36, 318), 330);
  const cardWidth = columnWidth;

  return {
    columnWidth,
    cardWidth,
    cardHeight: Math.round(cardWidth * 1.3),
    imageHeight: Math.round(cardWidth * 0.8),
    buttonWidth: Math.min(screenWidth - 22, 350),
    buttonHeight: 70,
    heroTopMargin: 0,
    cardTopMargin: 24,
    footerBottomMargin: 62,
  };
}
