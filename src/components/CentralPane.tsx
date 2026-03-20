"use client";

import type { TrackId } from "@/components/Tile";
import { ResearchTrack } from "@/components/tracks/ResearchTrack";
import { NewsTrack } from "@/components/tracks/NewsTrack";
import { SovereignWatchPortal } from "@/components/SovereignWatchPortal";
import { ReflectTrack } from "@/components/tracks/ReflectTrack";

interface CentralPaneProps {
  activeTrack: TrackId | null;
  /** When provided, Watch track shows a "Zoom out" control that calls this to return to main page */
  onCloseTrack?: () => void;
  /** Once true, Watch portal stays mounted when zoomed out so state and playback are preserved */
  watchHasBeenOpened?: boolean;
}

const trackComponents: Record<TrackId, React.ComponentType<{ compact?: boolean; onZoomOut?: () => void }>> = {
  research: ResearchTrack,
  news: NewsTrack,
  watch: SovereignWatchPortal as React.ComponentType<{ compact?: boolean; onZoomOut?: () => void }>,
  reflect: ReflectTrack,
};

export function CentralPane({ activeTrack, onCloseTrack, watchHasBeenOpened = false }: CentralPaneProps) {
  const isWatchActive = activeTrack === "watch";

  return (
    <div
      className={`rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-500 ease-out ${
        isWatchActive
          ? "min-h-[480px] overflow-x-hidden border-0 bg-transparent"
          : "min-h-[320px] overflow-hidden border border-black/[0.06] bg-white/50"
      }`}
    >
      {/* Watch portal: keep mounted when opened so state (and playback) is preserved when zoomed out */}
      {watchHasBeenOpened && (
        <div
          className={isWatchActive ? "flex min-h-[480px] flex-1 flex-col" : "hidden"}
          style={
            isWatchActive
              ? undefined
              : {
                  position: "absolute",
                  left: -9999,
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                  visibility: "hidden" as const,
                  pointerEvents: "none" as const,
                }
          }
        >
          <SovereignWatchPortal onCollapse={onCloseTrack} />
        </div>
      )}

      {/* Other content: placeholder or non-Watch track (only when Watch isn’t the active view) */}
      {(!watchHasBeenOpened || !isWatchActive) && (
        <>
          {!activeTrack && (
            <div className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
              <p
                className="text-lg font-medium opacity-80"
                style={{ color: "var(--theme-text-tone)" }}
              >
                Choose a track above to begin.
              </p>
              <p
                className="mt-1 text-sm opacity-60"
                style={{ color: "var(--theme-text-tone)" }}
              >
                Your space will open here, no page jumps, no clutter.
              </p>
            </div>
          )}
          {activeTrack === "research" && <ResearchTrack />}
          {activeTrack === "news" && <NewsTrack />}
          {activeTrack === "reflect" && <ReflectTrack />}
        </>
      )}
    </div>
  );
}
