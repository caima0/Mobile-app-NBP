import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/const/Colors";

export type ThemeName = "light" | "dark";
export type ThemePreference = ThemeName | "system";
export type ThemeColors = typeof Colors.light;

type ThemeContextValue = {
  theme: ThemeName;
  preference: ThemePreference;
  colors: ThemeColors;
  isDark: boolean;
  setPreference: (pref: ThemePreference) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "theme-preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setPreferenceState(saved);
        }
      } catch (e) {
        console.warn("Failed to load theme preference", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const setPreference = useCallback((pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref).catch((e) =>
      console.warn("Failed to save theme preference", e),
    );
  }, []);

  const theme: ThemeName =
    preference === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : preference;

  const toggleTheme = useCallback(() => {
    setPreference(theme === "dark" ? "light" : "dark");
  }, [theme, setPreference]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      preference,
      colors: Colors[theme],
      isDark: theme === "dark",
      setPreference,
      toggleTheme,
    }),
    [theme, preference, setPreference, toggleTheme],
  );

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
