import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeMode = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

const STORAGE_KEY = "@barakah/app-theme-mode";

export interface ThemeColors {
  bg: string;
  bgElevated: string;
  border: string;
  card: string;
  chevron: string;
  divider: string;
  error: string;
  errorSoft: string;
  ink: string;
  inkMuted: string;
  inkSubtle: string;
  neutralSoft: string;
  premium: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  surface: string;
  surfaceSoft: string;
}

const LIGHT: ThemeColors = {
  bg: "#FFFFFF",
  bgElevated: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceSoft: "#F6F6F4",
  card: "#FFFFFF",
  ink: "#0A0A0A",
  inkMuted: "#6B7280",
  inkSubtle: "#A1A1AA",
  primary: "#29603E",
  primaryDark: "#1B3F29",
  primarySoft: "#E8F0EA",
  border: "#EAEAEA",
  divider: "#F0F0F0",
  error: "#B42318",
  errorSoft: "#FBEAE8",
  neutralSoft: "#F4F4F2",
  chevron: "#A1A1AA",
  premium: "#C9A23A",
};

const DARK: ThemeColors = {
  bg: "#000000",
  bgElevated: "#0E0E0E",
  surface: "#141414",
  surfaceSoft: "#171717",
  card: "#1A1A1A",
  ink: "#FFFFFF",
  inkMuted: "#8E8E93",
  inkSubtle: "#5E5E62",
  primary: "#00D26A",
  primaryDark: "#00A856",
  primarySoft: "#0E2A1B",
  border: "#262626",
  divider: "#222222",
  error: "#FF453A",
  errorSoft: "#2A1517",
  neutralSoft: "#1A1A1A",
  chevron: "#5E5E62",
  premium: "#E4C168",
};

interface ThemeContextValue {
  colors: ThemeColors;
  mode: ThemeMode;
  scheme: ColorScheme;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v === "light" || v === "dark" || v === "system") {
        setModeState(v);
      }
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {
      // ignore persistence failure — in-memory state still updated
    });
  };

  const scheme: ColorScheme = useMemo(() => {
    if (mode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return mode;
  }, [mode, systemScheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      colors: scheme === "dark" ? DARK : LIGHT,
      setMode,
    }),
    [mode, scheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
