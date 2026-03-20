"use client";

import type { MockVideo } from "@/lib/watchTypes";

interface DriftConfirmDialogProps {
  video: MockVideo | null;
  onContinue: () => void;
  onStay: () => void;
  onRebalance: () => void;
}

export function DriftConfirmDialog({
  video,
  onContinue,
  onStay,
  onRebalance,
}: DriftConfirmDialogProps) {
  if (!video) return null;

  const isHighIntensity = video.emotionalIntensity >= 60;
  const isHighDrift = video.driftRisk === "High";
  const message = isHighIntensity
    ? "You're moving toward high-intensity content."
    : "This may shift your feed toward more opinion-driven material.";
  const subMessage = "Continue in this direction?";

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      aria-modal
      role="dialog"
      aria-labelledby="drift-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-black/[0.08] bg-white/95 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out"
        style={{ color: "var(--theme-text-tone)" }}
      >
        <h2 id="drift-dialog-title" className="text-sm font-semibold opacity-90">
          Notice
        </h2>
        <p className="mt-2 text-sm leading-relaxed opacity-90">
          {message} {subMessage}
        </p>
        <p className="mt-1 text-xs opacity-70">
          &ldquo;{video.title}&rdquo;, Intensity {video.emotionalIntensity}, Drift risk: {video.driftRisk}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onContinue}
            className="rounded-xl border border-black/[0.1] bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[0.04]"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onStay}
            className="rounded-xl px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--watch-accent)", color: "#fff" }}
          >
            Stay in current mode
          </button>
          <button
            type="button"
            onClick={onRebalance}
            className="rounded-xl border border-black/[0.08] bg-white/80 px-3 py-2 text-sm font-medium transition-colors hover:bg-black/[0.03]"
          >
            Rebalance suggestions
          </button>
        </div>
      </div>
    </div>
  );
}
