/**
 * Per-direction color tokens for the home-screen widgets, ported from the old
 * SwiftUI `Direction.swift`. The official `expo-widgets` `@expo/ui` primitives
 * take flat colors (no gradients/Canvas), so the layered wallpaper of the old
 * widget is approximated as a single `bg` per direction plus the ink/accent
 * tokens. Colors are `#rrggbbaa` strings. Visuals are device-unvalidated and
 * expected to be tuned on a real build.
 */

export type WidgetDirection =
  | "editorial"
  | "bold"
  | "dawn"
  | "night"
  | "arch"
  | "celestial";

export type WidgetScheme = "light" | "dark";

export interface DirectionTokens {
  accent: string;
  bg: string;
  hairline: string;
  ink: string;
  muted: string;
  pill: string;
}

const MOSQUE = "#29603E";
const GOLD = "#E4C168";

// `editorial`, `dawn`, and `arch` flip with the system theme; the rest are fixed.
const THEMEABLE: ReadonlySet<WidgetDirection> = new Set([
  "editorial",
  "dawn",
  "arch",
]);

const TOKENS: Record<
  WidgetDirection,
  { dark: DirectionTokens; light: DirectionTokens }
> = {
  editorial: {
    light: {
      bg: "#e8dcc4",
      ink: "#1a1408",
      muted: "#1a14088c",
      accent: MOSQUE,
      hairline: "#1a140829",
      pill: "#ffffff6b",
    },
    dark: {
      bg: "#0f0e0b",
      ink: "#f5ebdb",
      muted: "#f5ebdb94",
      accent: MOSQUE,
      hairline: "#f5ebdb2e",
      pill: "#ffffff1a",
    },
  },
  bold: {
    light: {
      bg: "#1a4329",
      ink: "#f5ebdb",
      muted: "#f5ebdb9e",
      accent: GOLD,
      hairline: "#f5ebdb38",
      pill: "#f5ebdb24",
    },
    dark: {
      bg: "#1a4329",
      ink: "#f5ebdb",
      muted: "#f5ebdb9e",
      accent: GOLD,
      hairline: "#f5ebdb38",
      pill: "#f5ebdb24",
    },
  },
  dawn: {
    light: {
      bg: "#f3d8c0",
      ink: "#2a1c10",
      muted: "#2a1c1094",
      accent: MOSQUE,
      hairline: "#2a1c1029",
      pill: "#ffffff80",
    },
    dark: {
      bg: "#0b0e0c",
      ink: "#f5ebdb",
      muted: "#f5ebdb94",
      accent: MOSQUE,
      hairline: "#f5ebdb2e",
      pill: "#ffffff1a",
    },
  },
  night: {
    light: {
      bg: "#050d09",
      ink: "#f5ebdbf2",
      muted: "#f5ebdb8c",
      accent: GOLD,
      hairline: "#f5ebdb2e",
      pill: "#f5ebdb1a",
    },
    dark: {
      bg: "#050d09",
      ink: "#f5ebdbf2",
      muted: "#f5ebdb8c",
      accent: GOLD,
      hairline: "#f5ebdb2e",
      pill: "#f5ebdb1a",
    },
  },
  arch: {
    light: {
      bg: "#ddc69d",
      ink: "#1B3F29",
      muted: "#1b3f298c",
      accent: MOSQUE,
      hairline: "#1b3f2933",
      pill: "#fffaec7a",
    },
    dark: {
      bg: "#0c0b09",
      ink: "#f5ebdb",
      muted: "#f5ebdb94",
      accent: GOLD,
      hairline: "#f5ebdb33",
      pill: "#ffffff1a",
    },
  },
  celestial: {
    light: {
      bg: "#1a2540",
      ink: "#f5ebdbf5",
      muted: "#f5ebdba6",
      accent: GOLD,
      hairline: "#f5ebdb38",
      pill: "#f5ebdb29",
    },
    dark: {
      bg: "#1a2540",
      ink: "#f5ebdbf5",
      muted: "#f5ebdba6",
      accent: GOLD,
      hairline: "#f5ebdb38",
      pill: "#f5ebdb29",
    },
  },
};

/** Resolve direction tokens for the widget's configured style and scheme. */
export function directionTokens(
  direction: WidgetDirection,
  scheme: WidgetScheme
): DirectionTokens {
  const dark = THEMEABLE.has(direction) && scheme === "dark";
  return dark ? TOKENS[direction].dark : TOKENS[direction].light;
}

/** Coerce a configuration string into a known direction, with a fallback. */
export function asDirection(
  value: string | undefined,
  fallback: WidgetDirection
): WidgetDirection {
  return value && value in TOKENS ? (value as WidgetDirection) : fallback;
}
