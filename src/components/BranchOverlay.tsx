"use client";

interface BranchOverlayProps {
  options: string[];
  onSelect: (option: string) => void;
}

/**
 * After watching: branching options. No autoplay; explicit choice.
 * "Stay in this zone?", "Go deeper…", "Shift…", "Take another direction?"
 */
export function BranchOverlay({ options, onSelect }: BranchOverlayProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
      <p
        className="mb-4 text-sm font-medium opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        What next?
      </p>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/10"
            style={{ color: "var(--theme-text-tone)" }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
