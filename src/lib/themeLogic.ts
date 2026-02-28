/**
 * Watch mode theme: cinematic tone when Watch is active.
 * Isolated from weather — consistent dark gradient. No clouds/rain in canvas.
 * Weather can still influence header accent glow / mode badge tint via CSS vars from parent.
 */

export interface WatchTheme {
  gradient: string;
  accent: string;
  accentMuted: string;
  textTone: string;
  motionScale: number;
}

export function getWatchModeTheme(): WatchTheme {
  return {
    gradient:
      "linear-gradient(165deg, #16151c 0%, #1c1b24 35%, #222028 100%)",
    accent: "#8b7cb8",
    accentMuted: "#a89ac9",
    textTone: "#e8e6ed",
    motionScale: 1.08,
  };
}

export const WATCH_TRANSITION_MS = 400;
