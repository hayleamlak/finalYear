import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";

type ThemeMode = "light" | "dark";

type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  dangerSoft: string;
};

type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleMode: () => void;
};

const THEME_STORAGE_KEY = "fyp_mobile_theme_mode_v1";

const lightColors: ThemeColors = {
  background: "#f8fafc",
  surface: "#ffffff",
  surfaceAlt: "#f1f5f9",
  text: "#0f172a",
  textMuted: "#334155",
  textSubtle: "#64748b",
  border: "rgba(15, 23, 42, 0.12)",
  primary: "#d97706",
  primaryText: "#ffffff",
  accent: "#7c2d12",
  accentSoft: "rgba(217, 119, 6, 0.12)",
  dangerSoft: "rgba(220, 38, 38, 0.14)",
};

const darkColors: ThemeColors = {
  background: "#07111f",
  surface: "#0f1b2d",
  surfaceAlt: "#132033",
  text: "#f8fafc",
  textMuted: "#cbd5e1",
  textSubtle: "#94a3b8",
  border: "rgba(148, 163, 184, 0.16)",
  primary: "#f59e0b",
  primaryText: "#111827",
  accent: "#fbbf24",
  accentSoft: "rgba(245, 158, 11, 0.16)",
  dangerSoft: "rgba(252, 165, 165, 0.2)",
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");

  useEffect(() => {
    const loadMode = async () => {
      try {
        const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
          setMode(stored);
          return;
        }

        setMode(systemScheme === "dark" ? "dark" : "light");
      } catch {
        setMode(systemScheme === "dark" ? "dark" : "light");
      }
    };

    void loadMode();
  }, [systemScheme]);

  const value = useMemo<ThemeContextValue>(() => {
    const toggleMode = () => {
      const nextMode: ThemeMode = mode === "dark" ? "light" : "dark";
      setMode(nextMode);
      void SecureStore.setItemAsync(THEME_STORAGE_KEY, nextMode);
    };

    return {
      mode,
      colors: mode === "dark" ? darkColors : lightColors,
      toggleMode,
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}
