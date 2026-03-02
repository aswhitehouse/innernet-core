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

/** Shown in bottom-left ambient line; not tied to real weather. Change to your city if you like. */
const CLOUDY_LOCATION = "Sydney";

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
        {/* Layer 1 (farthest): static clouds image with very subtle motion */}
        <div
          className="fixed inset-0 -z-20 bg-clouds-morph"
          aria-hidden
        />
        {/* Layer 2 (atmosphere): dark gradient overlay — lighter so clouds show through */}
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.6) 100%)",
          }}
        />
        {/* Layer 3: subtle base gradient tint */}
        <div
          className="fixed inset-0 -z-[5]"
          style={{ background: watchTheme.gradient, opacity: 0.12 }}
        />
        {/* Bottom-left: subtle cloudy-day line (ambient, not connected to real weather) */}
        <div
          className="fixed bottom-4 right-4 z-0 flex items-center gap-2 text-xs font-light"
          style={{ color: "var(--theme-text-tone)", opacity: 0.42 }}
          aria-hidden
        >
          <span className="opacity-90" aria-hidden>☁</span>
          <span>It&apos;s cloudy today in {CLOUDY_LOCATION}</span>
        </div>
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
