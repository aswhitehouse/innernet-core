/**
 * Session logic for Watch surface.
 * Tracks clicks and intensity; drives "Session intensity rising" badge and rebalance panel.
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

/** Show "Session intensity rising" when last click was high-intensity (e.g. >= 55) and we have at least 1 click */
export function shouldShowIntensityBadge(session: WatchSession, lastClickedIntensity: number | null): boolean {
  if (session.clickCount === 0) return false;
  return lastClickedIntensity !== null && lastClickedIntensity >= 55;
}
