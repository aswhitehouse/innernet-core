/**
 * Sovereign Watch: static visual system. No dynamic theme/weather.
 * Deep navy → charcoal gradient. Subtle, consistent accent.
 */

export interface WatchTheme {
  gradient: string;
  accent: string;
  accentMuted: string;
  textTone: string;
  motionScale: number;
}

/** Static cinematic gradient: deep navy → charcoal. No transitions. */
export const SOVEREIGN_GRADIENT =
  "linear-gradient(180deg, #0f1419 0%, #1a1f26 30%, #252b33 60%, #2d3439 100%)";

export function getWatchModeTheme(): WatchTheme {
  return {
    gradient: SOVEREIGN_GRADIENT,
    accent: "#6b7c9e",
    accentMuted: "#8a9ab5",
    textTone: "#e8eaed",
    motionScale: 1,
  };
}

export const WATCH_TRANSITION_MS = 400;
