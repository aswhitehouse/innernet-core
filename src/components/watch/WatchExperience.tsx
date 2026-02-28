"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { WatchIntent } from "@/lib/watchTypes";
import type { MockVideo } from "@/lib/watchTypes";
import { MOCK_VIDEOS } from "@/data/mockVideos";
import {
  getSessionTrendLabel,
  getStoredSession,
  SESSION_INSIGHT_THRESHOLD,
  saveSession,
  type WatchSession,
} from "@/lib/watchSession";
import { IntentSelector } from "./IntentSelector";
import { ModeLayoutRenderer } from "./ModeLayoutRenderer";
import { VideoCard } from "./VideoCard";
import { DriftConfirmDialog } from "./DriftConfirmDialog";

const INITIAL_SESSION: WatchSession = {
  intent: null,
  clickCount: 0,
  clickedIds: [],
  intensitySum: 0,
};

export function WatchExperience() {
  const [intent, setIntent] = useState<WatchIntent | null>(null);
  const [session, setSession] = useState<WatchSession>(INITIAL_SESSION);
  const [pendingDriftVideo, setPendingDriftVideo] = useState<MockVideo | null>(null);
  const [sessionDismissed, setSessionDismissed] = useState(false);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const needsDriftConfirm = (video: MockVideo) =>
    video.emotionalIntensity >= 60 || video.driftRisk === "High";

  const recordClick = useCallback((video: MockVideo) => {
    setSession((prev) => {
      const next: WatchSession = {
        ...prev,
        intent,
        clickCount: prev.clickCount + 1,
        clickedIds: [...prev.clickedIds, video.id],
        intensitySum: prev.intensitySum + video.emotionalIntensity,
      };
      saveSession(next);
      return next;
    });
  }, [intent]);

  const handleSelectVideo = useCallback(
    (video: MockVideo) => {
      if (needsDriftConfirm(video)) {
        setPendingDriftVideo(video);
        return;
      }
      recordClick(video);
      /* Mock: could show "Playing..." or do nothing */
    },
    [recordClick]
  );

  const handleDriftContinue = useCallback(() => {
    if (pendingDriftVideo) {
      recordClick(pendingDriftVideo);
      setPendingDriftVideo(null);
    }
  }, [pendingDriftVideo, recordClick]);

  const handleDriftStay = useCallback(() => {
    setPendingDriftVideo(null);
  }, []);

  const handleDriftRebalance = useCallback(() => {
    setPendingDriftVideo(null);
    setIntent(null);
    setSessionDismissed(false);
  }, []);

  const trendLabel = useMemo(() => getSessionTrendLabel(session), [session]);
  const showSessionBanner =
    trendLabel && session.clickCount >= SESSION_INSIGHT_THRESHOLD && !sessionDismissed;

  return (
    <div
      className="flex min-h-[360px] flex-col rounded-2xl transition-all duration-500 ease-out"
      style={{ ["--watch-accent" as string]: "#6e5c6b" }}
    >
      <div className="border-b border-black/[0.06] px-5 py-3">
        <h2
          className="text-sm font-semibold uppercase tracking-wider opacity-80"
          style={{ color: "var(--watch-accent)" }}
        >
          Watch
        </h2>
        <p className="mt-0.5 text-xs opacity-70" style={{ color: "var(--theme-text-tone)" }}>
          Gen UX — intent-led, transparent, alive.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-5">
        <IntentSelector value={intent} onChange={setIntent} />

        {intent && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70" style={{ color: "var(--theme-text-tone)" }}>
                Mode: <strong>{intent.replace("-", " ")}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIntent(null)}
                className="text-xs font-medium opacity-70 hover:opacity-100"
                style={{ color: "var(--watch-accent)" }}
              >
                Change intent
              </button>
            </div>
            {showSessionBanner && (
              <div
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-black/[0.06] bg-white/50 px-4 py-3"
                role="status"
              >
                <p className="text-sm opacity-90" style={{ color: "var(--theme-text-tone)" }}>
                  {trendLabel}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSessionDismissed(true)}
                    className="text-xs font-medium opacity-70 hover:opacity-100"
                    style={{ color: "var(--theme-text-tone)" }}
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIntent(null);
                      setSessionDismissed(true);
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: "var(--watch-accent)",
                      color: "#fff",
                    }}
                  >
                    Adjust intent
                  </button>
                </div>
              </div>
            )}
            <ModeLayoutRenderer
              intent={intent}
              videos={MOCK_VIDEOS}
              onSelectVideo={handleSelectVideo}
            />
          </>
        )}

        {intent && session.clickCount === 0 && (
          <p className="text-xs opacity-50" style={{ color: "var(--theme-text-tone)" }}>
            Choose a video to start. High-intensity or high drift-risk items will ask before continuing.
          </p>
        )}
      </div>

      <DriftConfirmDialog
        video={pendingDriftVideo}
        onContinue={handleDriftContinue}
        onStay={handleDriftStay}
        onRebalance={handleDriftRebalance}
      />
    </div>
  );
}
