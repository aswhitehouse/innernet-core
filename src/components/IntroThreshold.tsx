"use client";

import { useCallback, useState } from "react";

const TRANSITION_MS = 700;

export type IntroMode = "explore" | "drift";

interface IntroThresholdProps {
  onSelect: (mode: IntroMode) => void;
}

/**
 * Full-screen intro on fresh load. Two equal halves, soft seam, atmospheric hover.
 * Click Explore → left expands, right fades → load Explore UI.
 * Click Drift → right expands, left fades → load Drift UI.
 */
export function IntroThreshold({ onSelect }: IntroThresholdProps) {
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
      className="intro-threshold fixed inset-0 z-50 flex h-screen w-full"
      data-hover={hover ?? undefined}
      data-exiting={exiting ?? undefined}
    >
      {/* Top: centered headline — only when not exiting */}
      {!exiting && (
        <div
          className="pointer-events-none absolute left-0 right-0 top-12 z-10 flex flex-col items-center gap-1 text-center"
          style={{ color: "var(--theme-text-tone)" }}
        >
          <p className="font-display text-lg font-medium tracking-tight opacity-95 sm:text-xl">
            How do you want to move today?
          </p>
          <p className="text-xs font-light opacity-60">Innernet adapts to your pace.</p>
        </div>
      )}

      {/* Left — EXPLORE */}
      <button
        type="button"
        className="intro-half intro-half-explore flex flex-1 flex-col items-center justify-center gap-2 px-8 py-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        onMouseEnter={() => setHover("explore")}
        onMouseLeave={() => setHover(null)}
        onClick={() => handleSelect("explore")}
        aria-label="Choose Explore — follow intention, shape the path"
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
        className="intro-half intro-half-drift flex flex-1 flex-col items-center justify-center gap-2 px-8 py-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        onMouseEnter={() => setHover("drift")}
        onMouseLeave={() => setHover(null)}
        onClick={() => handleSelect("drift")}
        aria-label="Choose Drift — wander, let it unfold"
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
