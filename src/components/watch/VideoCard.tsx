"use client";

import type { MockVideo } from "@/lib/watchTypes";
import type { WatchIntent } from "@/lib/watchTypes";

interface VideoCardProps {
  video: MockVideo;
  intent: WatchIntent;
  onSelect: (video: MockVideo) => void;
  /** Layout variant: list (summary first), grid (thumbnail emphasis), minimal (wind down) */
  variant?: "list" | "grid" | "minimal" | "compact";
}

export function VideoCard({ video, intent, onSelect, variant = "list" }: VideoCardProps) {
  const showIntensity = intent !== "wind-down";
  const showSignal = intent === "learn" || intent === "deep-dive" || intent === "stay-informed" || intent === "light-browse";
  const showDrift = intent !== "wind-down";
  const summaryFirst = variant === "list" || intent === "learn" || intent === "stay-informed";

  const isHighIntensity = video.emotionalIntensity >= 60;
  const isHighDrift = video.driftRisk === "High";

  const handleClick = () => {
    onSelect(video);
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      className="flex cursor-pointer flex-col rounded-xl border border-black/[0.06] bg-white/50 transition-all duration-300 ease-out hover:border-black/[0.1] hover:bg-white/70 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        ["--watch-accent" as string]: "#6e5c6b",
      }}
    >
      {variant === "minimal" ? (
        /* Wind Down: large thumbnail area, minimal text */
        <>
          <div
            className="flex aspect-video items-center justify-center rounded-t-xl text-4xl opacity-30"
            style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
          >
            ▶
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium opacity-90" style={{ color: "var(--theme-text-tone)" }}>
              {video.title}
            </h3>
            <p className="mt-0.5 text-xs opacity-70" style={{ color: "var(--theme-text-tone)" }}>
              {video.duration}
            </p>
          </div>
        </>
      ) : (
        <>
          {summaryFirst ? (
            <>
              <div className="p-4">
                <h3 className="text-sm font-medium" style={{ color: "var(--theme-text-tone)" }}>
                  {video.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed opacity-85" style={{ color: "var(--theme-text-tone)" }}>
                  {video.summary}
                </p>
                {(showSignal || showIntensity || showDrift) && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {showSignal && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                        style={{
                          backgroundColor: "var(--watch-accent)",
                          color: "#fff",
                        }}
                      >
                        Signal {video.signalScore}
                      </span>
                    )}
                    {showIntensity && (
                      <span
                        className="rounded-full border px-2 py-0.5 text-[10px] opacity-80"
                        style={{
                          borderColor: "var(--theme-accent-muted)",
                          color: "var(--theme-text-tone)",
                        }}
                      >
                        Intensity {video.emotionalIntensity}
                      </span>
                    )}
                    {showDrift && (
                      <span
                        className={`text-[10px] uppercase tracking-wider ${
                          video.driftRisk === "High" ? "opacity-90" : "opacity-60"
                        }`}
                        style={{ color: "var(--theme-text-tone)" }}
                      >
                        Drift: {video.driftRisk}
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  <span
                    className="text-[10px] uppercase tracking-wider opacity-60"
                    style={{ color: "var(--theme-text-tone)" }}
                  >
                    #{video.topic}
                  </span>
                  <span className="text-[10px] opacity-50" style={{ color: "var(--theme-text-tone)" }}>
                    · {video.duration}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* Grid / compact: thumbnail then summary */
            <>
              <div
                className="flex aspect-video items-center justify-center rounded-t-xl text-2xl opacity-30"
                style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
              >
                ▶
              </div>
              <div className="p-3">
                <h3 className="text-sm font-medium" style={{ color: "var(--theme-text-tone)" }}>
                  {video.title}
                </h3>
                <p className="mt-1 text-xs opacity-80 line-clamp-2" style={{ color: "var(--theme-text-tone)" }}>
                  {video.summary}
                </p>
                {showSignal && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: "var(--watch-accent)", color: "#fff" }}
                    >
                      Signal {video.signalScore}
                    </span>
                    {showIntensity && (
                      <span className="text-[10px] opacity-70" style={{ color: "var(--theme-text-tone)" }}>
                        Intensity {video.emotionalIntensity}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </article>
  );
}
