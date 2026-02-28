"use client";

import type { WatchIntent } from "@/lib/watchTypes";

const INTENTS: { id: WatchIntent; label: string; icon: string }[] = [
  { id: "learn", label: "Learn", icon: "📚" },
  { id: "deep-dive", label: "Deep Dive", icon: "🧠" },
  { id: "stay-informed", label: "Stay Informed", icon: "🌍" },
  { id: "be-inspired", label: "Be Inspired", icon: "🎨" },
  { id: "wind-down", label: "Wind Down", icon: "🌿" },
  { id: "light-browse", label: "Light Browse", icon: "🔍" },
];

interface IntentModalProps {
  isOpen: boolean;
  current: WatchIntent | null;
  onSelect: (intent: WatchIntent) => void;
  onClose: () => void;
}

export function IntentModal({ isOpen, current, onSelect, onClose }: IntentModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal
      aria-label="Change watch mode"
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1e1c24] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="mb-3 text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: "var(--theme-text-tone)" }}>
          Mode
        </p>
        <div className="flex flex-wrap gap-2">
          {INTENTS.map(({ id, label, icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                onSelect(id);
                onClose();
              }}
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors"
              style={{
                borderColor: current === id ? "var(--theme-accent)" : "rgba(255,255,255,0.1)",
                backgroundColor: current === id ? "rgba(139,124,184,0.2)" : "transparent",
                color: "var(--theme-text-tone)",
              }}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
