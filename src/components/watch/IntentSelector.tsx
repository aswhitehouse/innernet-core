"use client";

import type { WatchIntent } from "@/lib/watchTypes";

const INTENTS: { id: WatchIntent; label: string; icon: string; tone: "structured" | "calm" | "balanced" }[] = [
  { id: "learn", label: "Learn", icon: "📚", tone: "structured" },
  { id: "deep-dive", label: "Deep Dive", icon: "🧠", tone: "structured" },
  { id: "stay-informed", label: "Stay Informed", icon: "🌍", tone: "structured" },
  { id: "be-inspired", label: "Be Inspired", icon: "🎨", tone: "balanced" },
  { id: "wind-down", label: "Wind Down", icon: "🌿", tone: "calm" },
  { id: "light-browse", label: "Light Browse", icon: "🔍", tone: "calm" },
];

interface IntentSelectorProps {
  value: WatchIntent | null;
  onChange: (intent: WatchIntent) => void;
}

export function IntentSelector({ value, onChange }: IntentSelectorProps) {
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white/40 p-4 backdrop-blur-sm">
      <p
        className="mb-3 text-sm font-medium opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        What kind of watching are we doing?
      </p>
      <div className="flex flex-wrap gap-2">
        {INTENTS.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all duration-300 ease-out"
            style={{
              borderColor: value === id ? "var(--watch-accent)" : "rgba(0,0,0,0.08)",
              backgroundColor: value === id ? "rgba(110,92,107,0.12)" : "rgba(255,255,255,0.6)",
              color: value === id ? "var(--watch-accent)" : "var(--theme-text-tone)",
            }}
          >
            <span aria-hidden>{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
