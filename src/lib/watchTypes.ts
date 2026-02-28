/**
 * Gen UX Watch: intent modes and video shape.
 * All data mocked; no backend.
 */

export type WatchIntent =
  | "learn"
  | "deep-dive"
  | "stay-informed"
  | "be-inspired"
  | "wind-down"
  | "light-browse";

export type DriftRisk = "Low" | "Medium" | "High";

export interface MockVideo {
  id: string;
  title: string;
  summary: string;
  topic: string;
  emotionalIntensity: number; // 0–100
  signalScore: number; // 0–100
  driftRisk: DriftRisk;
  duration: string;
  /** YouTube video ID for thumbnail: img.youtube.com/vi/{youtubeId}/maxresdefault.jpg */
  youtubeId: string;
}

export const WATCH_ACCENT = "#6e5c6b";
