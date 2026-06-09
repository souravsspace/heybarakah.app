export const tokens = {
  colors: {
    primary: "#29603E",
    secondary: "#000000",
    tertiary: "#6B7280",
    neutral: "#E5E7EB",
    surface: "#FFFFFF",
    ink: "#000000",
    error: "#B42318",
  },
  radii: { none: 0, sm: 4, md: 8, lg: 12, xl: 24, full: 9999 },
  spacing: { xs: 6, sm: 14, md: 24, lg: 40, xl: 100 },
  fonts: { serif: "LibreBaskerville-Bold", sans: "Inter" },
} as const;

export type Tokens = typeof tokens;
