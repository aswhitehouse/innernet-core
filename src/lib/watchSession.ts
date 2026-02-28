"use client";

/**
 * Session state for Gen UX Watch.
 * Tracks intent, clicks, and running intensity to show "trending" messages.
 */

const SESSION_KEY = "innernet-watch-session";

export interface WatchSession {
  intent: string | null;
  clickCount: number;
  clickedIds: string[];
  intensitySum: number;
}

export function getStoredSession(): WatchSession {
  if (typeof window === "undefined") {
    return { intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 };
  }
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 };
    const parsed = JSON.parse(raw) as WatchSession;
    return {
      intent: parsed.intent ?? null,
      clickCount: parsed.clickCount ?? 0,
      clickedIds: Array.isArray(parsed.clickedIds) ? parsed.clickedIds : [],
      intensitySum: typeof parsed.intensitySum === "number" ? parsed.intensitySum : 0,
    };
  } catch {
    return { intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 };
  }
}

export function saveSession(session: WatchSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
}

export function averageIntensity(session: WatchSession): number {
  if (session.clickCount === 0) return 0;
  return Math.round(session.intensitySum / session.clickCount);
}

/** After 2–3 clicks we show session evolution message */
export const SESSION_INSIGHT_THRESHOLD = 2;

/** Label for session trend (analytical vs intensity) */
export function getSessionTrendLabel(session: WatchSession): string | null {
  if (session.clickCount < SESSION_INSIGHT_THRESHOLD) return null;
  const avg = averageIntensity(session);
  if (avg >= 55) return "Your session intensity is increasing.";
  if (avg <= 35) return "Your session is trending analytical.";
  return "Your session is mixed.";
}
