"use client";

import {
  createContext,
  useCallback,
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
import { getWeatherFromLocation } from "@/lib/weatherFromLocation";
import { getWatchModeTheme, WATCH_TRANSITION_MS } from "@/lib/themeLogic";
import { CloudLayer } from "@/components/CloudLayer";
import { RainLayer } from "@/components/RainLayer";
import { WindowFrame } from "@/components/WindowFrame";

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

  useEffect(() => {
    getWeatherFromLocation().then(setWeatherState);
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
  const transitionSec = WATCH_TRANSITION_MS / 1000;
  const duration = mood.gradientShiftDuration ?? 75;
  const hasShift = Boolean(mood.gradientSecond);

  const wrapperStyle = mounted
    ? {
        color: watchActive ? watchTheme.textTone : mood.textTone,
        ["--theme-accent" as string]: watchActive ? watchTheme.accent : mood.accent,
        ["--theme-accent-muted" as string]: watchActive ? watchTheme.accentMuted : mood.accentMuted,
        ["--theme-text-tone" as string]: watchActive ? watchTheme.textTone : mood.textTone,
        ["--theme-motion-scale" as string]: watchActive ? watchTheme.motionScale : mood.motionScale,
        ["--theme-shadow" as string]: mood.shadowTone ?? "none",
        ["--gradient-shift-duration" as string]: `${duration}s`,
      }
    : {
        color: "#3d3a36",
        ["--theme-accent" as string]: mood.accent,
        ["--theme-accent-muted" as string]: mood.accentMuted,
        ["--theme-text-tone" as string]: mood.textTone,
        ["--theme-motion-scale" as string]: mood.motionScale,
        ["--theme-shadow" as string]: "none",
        ["--gradient-shift-duration" as string]: "75s",
      };

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="theme-wrapper min-h-screen ease-out"
        style={{
          ...wrapperStyle,
          transition: `color ${transitionSec}s, --theme-accent ${transitionSec}s, --theme-accent-muted ${transitionSec}s, --theme-text-tone ${transitionSec}s`,
        }}
      >
        {/* Base background: same cinematic dark as Watch/videos page everywhere */}
        <div
          className="fixed inset-0 -z-10 transition-opacity ease-out"
          style={{
            background: watchTheme.gradient,
            transitionDuration: `${transitionSec}s`,
          }}
        />
        {hasShift && (
          <div
            className="fixed inset-0 -z-10 animate-gradient-breathe opacity-80"
            style={{
              background: mood.gradientSecond ?? mood.gradient,
              animationDuration: `${duration}s`,
            }}
          />
        )}
        {/* Sunny: very subtle light bloom */}
        {mounted && mood.hasBloom && !watchActive && (
          <div
            className="pointer-events-none fixed inset-0 -z-[9] opacity-[0.15]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,252,245,0.6) 0%, transparent 55%)",
            }}
          />
        )}
        {/* Rainy: slight blur texture overlay (atmospheric) */}
        {mounted && mood.hasRainyBlur && !watchActive && (
          <div
            className="pointer-events-none fixed inset-0 -z-[9] opacity-[0.04]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              filter: "saturate(0.7)",
            }}
          />
        )}
        {/* Cloudy: drifting clouds — not shown in Watch mode */}
        {mounted && weather === "cloudy" && !watchActive && (
          <CloudLayer />
        )}
        {/* Rainy: falling rain — not shown in Watch mode */}
        {mounted && weather === "rainy" && !watchActive && (
          <RainLayer />
        )}
        {/* Window feel: vignette + glass */}
        {mounted && !watchActive && <WindowFrame />}
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
