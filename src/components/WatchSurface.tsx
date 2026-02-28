"use client";

import { useState, useCallback, useEffect } from "react";
import type { MockVideo } from "@/lib/watchTypes";
import type { WatchIntent } from "@/lib/watchTypes";
import { HERO_VIDEO, RAIL_VIDEOS } from "@/lib/mockVideos";
import {
  getStoredSession,
  saveSession,
  averageIntensity,
  shouldShowIntensityBadge,
  type WatchSession,
} from "@/lib/sessionLogic";
import { HeroVideo } from "./HeroVideo";
import { VideoRail } from "./VideoRail";
import { IntentModal } from "./IntentModal";

const INTENT_LABEL: Record<WatchIntent, string> = {
  "learn": "Learn",
  "deep-dive": "Deep Dive",
  "stay-informed": "Stay Informed",
  "be-inspired": "Be Inspired",
  "wind-down": "Wind Down",
  "light-browse": "Light Browse",
};

/** Single rail: 5 cards max, supportive of hero */
const RAIL_SLICE = RAIL_VIDEOS.slice(0, 5);

export function WatchSurface() {
  const [intent, setIntent] = useState<WatchIntent | null>(() => {
    if (typeof window === "undefined") return "stay-informed";
    const s = getStoredSession();
    return (s.intent as WatchIntent) || "stay-informed";
  });
  const [session, setSession] = useState<WatchSession>({ intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 });
  const [lastClickedIntensity, setLastClickedIntensity] = useState<number | null>(null);
  const [intentModalOpen, setIntentModalOpen] = useState(false);
  const [sessionPanelOpen, setSessionPanelOpen] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const currentIntent = intent ?? "stay-informed";

  const recordClick = useCallback(
    (video: MockVideo) => {
      setSession((prev) => {
        const next: WatchSession = {
          ...prev,
          intent: currentIntent,
          clickCount: prev.clickCount + 1,
          clickedIds: [...prev.clickedIds, video.id],
          intensitySum: prev.intensitySum + video.emotionalIntensity,
        };
        saveSession(next);
        return next;
      });
      setLastClickedIntensity(video.emotionalIntensity);
    },
    [currentIntent]
  );

  const handleSelectVideo = useCallback(
    (video: MockVideo) => {
      recordClick(video);
    },
    [recordClick]
  );

  const showBadge = shouldShowIntensityBadge(session, lastClickedIntensity);
  const avgIntensity = averageIntensity(session);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mode: minimal top-right */}
      <div className="flex justify-end gap-2 px-4 pt-4 pb-2">
        <span className="text-xs opacity-75" style={{ color: "var(--theme-text-tone)" }}>
          Mode: {INTENT_LABEL[currentIntent]}
        </span>
        <button
          type="button"
          onClick={() => setIntentModalOpen(true)}
          className="text-xs font-medium opacity-80 hover:opacity-100"
          style={{ color: "var(--theme-accent)" }}
        >
          Change
        </button>
      </div>

      {/* Hero — dominant, with spacing */}
      <div className="px-4 pt-2 pb-8">
        <HeroVideo video={HERO_VIDEO} />
      </div>

      {/* Single rail — supportive, reduced contrast */}
      <div className="flex flex-1 flex-col overflow-y-auto px-4 pb-12 pt-4">
        <VideoRail
          videos={RAIL_SLICE}
          title="More like this"
          onSelect={handleSelectVideo}
        />
      </div>

      {/* Session intensity — small, subtle */}
      {showBadge && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            type="button"
            onClick={() => setSessionPanelOpen((o) => !o)}
            className="rounded-md border border-white/10 bg-black/50 px-2.5 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-colors hover:bg-black/60"
            style={{ color: "var(--theme-text-tone)" }}
          >
            Session intensity rising.
          </button>
          {sessionPanelOpen && (
            <div
              className="absolute bottom-full right-0 mb-2 w-48 rounded-lg border border-white/10 bg-[#1a1920] p-2.5 shadow-xl"
              style={{ color: "var(--theme-text-tone)" }}
            >
              <p className="text-[11px] opacity-80">Average intensity: {avgIntensity}</p>
              <button
                type="button"
                onClick={() => {
                  setIntent(null);
                  setSessionPanelOpen(false);
                  setLastClickedIntensity(null);
                  saveSession({ intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 });
                  setSession({ intent: null, clickCount: 0, clickedIds: [], intensitySum: 0 });
                }}
                className="mt-2 rounded bg-white/10 px-2 py-1 text-[11px] font-medium hover:bg-white/15"
              >
                Rebalance
              </button>
            </div>
          )}
        </div>
      )}

      <IntentModal
        isOpen={intentModalOpen}
        current={currentIntent}
        onSelect={(i) => {
          setIntent(i);
          setSession((prev) => ({ ...prev, intent: i }));
          saveSession({ ...session, intent: i });
        }}
        onClose={() => setIntentModalOpen(false)}
      />
    </div>
  );
}
