"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getThemeMood,
  getTimeOfDay,
  type ThemeMood,
  type TimeOfDay,
  type WeatherMode,
} from "@/lib/theme";
import { getWatchModeTheme } from "@/lib/themeLogic";

interface ThemeContextValue {
  timeOfDay: TimeOfDay;
  weather: WeatherMode;
  mood: ThemeMood;
  watchActive: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  watchActive = false,
}: {
  children: React.ReactNode;
  watchActive?: boolean;
}) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("afternoon");
  const [weather, setWeatherState] = useState<WeatherMode>("sunny");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeOfDay(getTimeOfDay());
    setMounted(true);
  }, []);

  const mood = useMemo(
    () => getThemeMood(timeOfDay, weather),
    [timeOfDay, weather]
  );

  const value = useMemo<ThemeContextValue>(
    () => ({ timeOfDay, weather, mood, watchActive }),
    [timeOfDay, weather, mood, watchActive]
  );

  const watchTheme = getWatchModeTheme();

  // Visual lock: static gradient and text. No mood/weather transitions, no bloom, no rain overlay.
  const wrapperStyle = mounted
    ? {
        color: watchTheme.textTone,
        ["--theme-accent" as string]: watchTheme.accent,
        ["--theme-accent-muted" as string]: watchTheme.accentMuted,
        ["--theme-text-tone" as string]: watchTheme.textTone,
        ["--theme-motion-scale" as string]: watchTheme.motionScale,
        ["--theme-shadow" as string]: "none",
      }
    : {
        color: watchTheme.textTone,
        ["--theme-accent" as string]: watchTheme.accent,
        ["--theme-accent-muted" as string]: watchTheme.accentMuted,
        ["--theme-text-tone" as string]: watchTheme.textTone,
        ["--theme-motion-scale" as string]: watchTheme.motionScale,
        ["--theme-shadow" as string]: "none",
      };

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="theme-wrapper min-h-screen"
        style={wrapperStyle}
      >
        {/* Static cinematic background. No dynamic transitions. */}
        <div
          className="fixed inset-0 -z-10"
          style={{ background: watchTheme.gradient }}
        />
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
