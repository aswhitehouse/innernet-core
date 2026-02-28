/**
 * Lightweight theme engine: time of day + weather.
 * Weather is now driven by location (see weatherFromLocation.ts); no manual toggle.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type WeatherMode = "sunny" | "cloudy" | "rainy";

export interface ThemeMood {
  /** CSS gradient value for background */
  gradient: string;
  /** Second gradient for slow shift (optional) */
  gradientSecond?: string;
  /** Main accent hex */
  accent: string;
  accentMuted: string;
  textTone: string;
  motionScale: number;
  /** For "alive" gradient shift (seconds) */
  gradientShiftDuration?: number;
  /** Deeper shadows (evening) — CSS shadow value */
  shadowTone?: string;
  /** Sunny: subtle light bloom */
  hasBloom?: boolean;
  /** Rainy: desaturation + blur overlay */
  hasRainyBlur?: boolean;
}

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function getThemeMood(time: TimeOfDay, weather: WeatherMode): ThemeMood {
  const base = timeBase[time];
  const weatherMod = weatherMods[weather];
  const gradient =
    weather === "sunny"
      ? base.gradient
      : weather === "cloudy"
        ? (base.gradientCloudy ?? base.gradient)
        : (base.gradientRainy ?? base.gradient);
  const gradientSecond =
    weather === "sunny"
      ? base.gradientSecond
      : weather === "rainy"
        ? base.gradientRainy
        : undefined;
  return {
    gradient,
    gradientSecond: gradientSecond ?? base.gradientSecond,
    accent: weatherMod.accentShift ?? base.accent,
    accentMuted: base.accentMuted,
    textTone: base.textTone,
    motionScale: base.motionScale * weatherMod.motionScale,
    gradientShiftDuration: base.gradientShiftDuration ?? 75,
    shadowTone: base.shadowTone,
    hasBloom: weather === "sunny" ? base.hasBloom : false,
    hasRainyBlur: weather === "rainy",
  };
}

type TimeBase = ThemeMood & {
  gradientCloudy?: string;
  gradientRainy?: string;
  gradientSecond?: string;
};

const timeBase: Record<TimeOfDay, TimeBase> = {
  // Morning: clear sky, cool blue, warm horizon
  morning: {
    gradient:
      "linear-gradient(180deg, #7eb8da 0%, #a8d4ee 25%, #c8e2f0 55%, #e8dcc8 85%, #eed8c4 100%)",
    gradientSecond:
      "linear-gradient(180deg, #6ba8cc 0%, #9ccce8 40%, #b8dcec 70%, #e0d4c0 100%)",
    gradientCloudy:
      "linear-gradient(180deg, #8b9ca8 0%, #a8b4bc 30%, #c4cacf 60%, #d4d6d2 85%, #d8d4cc 100%)",
    gradientRainy:
      "linear-gradient(180deg, #5a6570 0%, #6b7580 35%, #7a8388 65%, #8a8e8a 100%)",
    accent: "#5c6e6b",
    accentMuted: "#7a8a87",
    textTone: "#2c3438",
    motionScale: 1.05,
    gradientShiftDuration: 80,
    hasBloom: true,
  },
  // Afternoon: bright sky, strong horizon
  afternoon: {
    gradient:
      "linear-gradient(180deg, #4a90c4 0%, #6ba8d8 22%, #8fc4e8 50%, #b8d8f0 78%, #e0e8dc 100%)",
    gradientSecond:
      "linear-gradient(180deg, #5a9cd0 0%, #7eb4e0 45%, #a8cce8 75%, #c8dcd8 100%)",
    gradientCloudy:
      "linear-gradient(180deg, #7a8c98 0%, #94a4ae 28%, #b0bcc4 55%, #c8cecc 82%, #d0d2cc 100%)",
    gradientRainy:
      "linear-gradient(180deg, #4a5560 0%, #5c6670 40%, #6e767c 70%, #808680 100%)",
    accent: "#5a6a7a",
    accentMuted: "#7a8a96",
    textTone: "#2a3238",
    motionScale: 1,
    gradientShiftDuration: 75,
    hasBloom: true,
  },
  // Evening: golden hour, then dusk
  evening: {
    gradient:
      "linear-gradient(180deg, #2c2844 0%, #4a3c5c 20%, #8a6a60 45%, #c89470 70%, #e0b890 95%, #d8b088 100%)",
    gradientSecond:
      "linear-gradient(180deg, #3a3450 0%, #6a5070 35%, #9a7868 65%, #c8a078 100%)",
    gradientCloudy:
      "linear-gradient(180deg, #4a4858 0%, #6a6470 35%, #8a8488 65%, #a09890 100%)",
    gradientRainy:
      "linear-gradient(180deg, #3a3a44 0%, #4a4c54 40%, #5a5c60 80%, #6a6a64 100%)",
    accent: "#8a7a6a",
    accentMuted: "#a89888",
    textTone: "#e8e0d8",
    motionScale: 1.12,
    gradientShiftDuration: 70,
    shadowTone: "0 4px 24px rgba(0,0,0,0.15)",
    hasBloom: false,
  },
  // Night: deep blue-black sky
  night: {
    gradient:
      "linear-gradient(180deg, #0c0e18 0%, #141824 25%, #1c2030 55%, #242830 85%, #2a2c30 100%)",
    gradientSecond:
      "linear-gradient(180deg, #101420 0%, #181c2c 50%, #202428 100%)",
    gradientCloudy:
      "linear-gradient(180deg, #14161c 0%, #1c1e24 40%, #24262a 80%, #2a2a2c 100%)",
    gradientRainy:
      "linear-gradient(180deg, #0e1014 0%, #16181c 50%, #1e2024 100%)",
    accent: "#8a9ab0",
    accentMuted: "#a0aeb8",
    textTone: "#d4d8dc",
    motionScale: 1.2,
    gradientShiftDuration: 90,
    shadowTone: "0 8px 32px rgba(0,0,0,0.3)",
    hasBloom: false,
  },
};

const weatherMods: Record<
  WeatherMode,
  { accentShift?: string; motionScale: number }
> = {
  sunny: { motionScale: 1 },
  cloudy: { motionScale: 0.92 },
  rainy: { motionScale: 0.82 },
};
