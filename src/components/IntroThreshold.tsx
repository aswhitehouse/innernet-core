"use client";

import { useCallback, useState } from "react";

const TRANSITION_MS = 700;

export type IntroMode = "explore" | "drift";

interface IntroThresholdProps {
  onSelect: (mode: IntroMode) => void;
  /** When set, headline becomes welcome + where to go */
  welcomeName?: string | null;
  /** Short line about last session e.g. "Last time: Explore — video" */
  lastSessionSummary?: string | null;
}

/**
 * Full-screen intro on fresh load. Two equal halves, soft seam, atmospheric hover.
 * Click Explore → left expands, right fades → load Explore UI.
 * Click Drift → right expands, left fades → load Drift UI.
 */
export function IntroThreshold({
  onSelect,
  welcomeName,
  lastSessionSummary,
}: IntroThresholdProps) {
  const [hover, setHover] = useState<"explore" | "drift" | null>(null);
  const [exiting, setExiting] = useState<IntroMode | null>(null);

  const handleSelect = useCallback(
    (mode: IntroMode) => {
      if (exiting) return;
      setExiting(mode);
      const t = setTimeout(() => {
        onSelect(mode);
      }, TRANSITION_MS);
      return () => clearTimeout(t);
    },
    [exiting, onSelect]
  );

  return (
    <div
      className="intro-threshold fixed inset-0 z-50 flex h-dvh w-full max-w-[100%] flex-row overflow-x-hidden"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
      data-hover={hover ?? undefined}
      data-exiting={exiting ?? undefined}
    >
      {/* Top: centered headline — only when not exiting; safe-area + max-width so nothing clips */}
      {!exiting && (
        <div
          className="safe-area-x pointer-events-none absolute left-0 right-0 top-0 z-10 flex flex-col items-center gap-1 pt-[max(3rem,env(safe-area-inset-top,0px)+2rem)] text-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
        >
          <p className="font-display w-full max-w-[min(100%,36rem)] px-2 text-lg font-medium leading-snug tracking-tight opacity-95 sm:text-xl">
            {welcomeName
              ? `Welcome, ${welcomeName}, where should we go today?`
              : "How do you want to move today?"}
          </p>
          <p className="w-full max-w-[min(100%,36rem)] px-2 text-xs font-light leading-snug text-white/80">
            {lastSessionSummary || "Innernet adapts to your pace."}
          </p>
        </div>
      )}

      {/* Left — EXPLORE */}
      <button
        type="button"
        className="intro-half intro-half-explore flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-10 sm:px-8 sm:py-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        onMouseEnter={() => setHover("explore")}
        onMouseLeave={() => setHover(null)}
        onClick={() => handleSelect("explore")}
        aria-label="Choose Explore, follow intention, shape the path"
      >
        <p className="text-sm font-medium uppercase tracking-[0.25em] opacity-90">
          Explore
        </p>
        <p className="max-w-xs text-center text-sm font-light leading-relaxed opacity-80">
          Follow intention. Shape the path.
        </p>
        <p className="mt-1 text-xs opacity-50">Start with a clear direction.</p>
      </button>

      {/* Vertical seam: soft fade blend */}
      <div className="intro-seam" aria-hidden />

      {/* Right — DRIFT */}
      <button
        type="button"
        className="intro-half intro-half-drift flex min-w-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-10 sm:px-8 sm:py-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        onMouseEnter={() => setHover("drift")}
        onMouseLeave={() => setHover(null)}
        onClick={() => handleSelect("drift")}
        aria-label="Choose Drift, wander, let it unfold"
      >
        <p className="text-sm font-medium uppercase tracking-[0.25em] opacity-90">
          Drift
        </p>
        <p className="max-w-xs text-center text-sm font-light leading-relaxed opacity-80">
          Wander. Let it unfold.
        </p>
        <p className="mt-1 text-xs opacity-50">Start without a destination.</p>
      </button>
    </div>
  );
}
