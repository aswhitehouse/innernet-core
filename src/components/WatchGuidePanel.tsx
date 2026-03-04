"use client";

import { useEffect, useState } from "react";

interface WatchGuidePanelProps {
  reflection: string;
  currentTopic: string;
  stayingInZone: boolean;
  onStayInZone: () => void;
  onBranchOutward: () => void;
  onZoomOut: () => void;
  /** Layout: 'card' for mobile joined under player, 'standalone' for desktop stack */
  layout?: "card" | "standalone";
}

export function WatchGuidePanel({
  reflection,
  currentTopic,
  stayingInZone,
  onStayInZone,
  onBranchOutward,
  onZoomOut,
  layout = "standalone",
}: WatchGuidePanelProps) {
  const baseClasses =
    layout === "card"
      ? "border-t border-white/10 bg-black/40 px-4 py-3 space-y-3"
      : "mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 space-y-3";

  const [summary, setSummary] = useState<string>("");
  const [userMessage, setUserMessage] = useState<string>("");
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Fetch an initial guide summary whenever topic/reflection change.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentTopic && !reflection) return;
      setLoading(true);
      try {
        const res = await fetch("/api/watch-guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: currentTopic, reflection }),
        });
        const data = await res.json();
        if (!cancelled && data?.text) {
          setSummary(data.text);
          setReply("");
        }
      } catch {
        if (!cancelled) {
          setSummary(reflection);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [currentTopic, reflection]);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = userMessage.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/watch-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: currentTopic, reflection: summary || reflection, userMessage: trimmed }),
      });
      const data = await res.json();
      if (data?.text) {
        setReply(data.text);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={baseClasses}>
      <div className="flex items-center justify-between gap-2">
        <p
          className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-60"
          style={{ color: "var(--theme-text-tone)" }}
        >
          Guide
        </p>
        <button
          type="button"
          onClick={onZoomOut}
          className="rounded-xl border border-white/20 bg-black/60 px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm transition-colors hover:bg-white/10"
        >
          Zoom Out
        </button>
      </div>

      <p
        className="text-xs font-light leading-relaxed opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        {summary || reflection}
      </p>

      {/* Mini conversational strip: guide + your latest prompt */}
      <div className="mt-1 space-y-1.5 text-[11px] leading-relaxed">
        <div className="inline-flex max-w-full flex-col rounded-2xl bg-white/5 px-3 py-2">
          <span className="text-[9px] font-medium uppercase tracking-[0.18em] opacity-60">
            Guide
          </span>
          <span className="mt-1 opacity-90" style={{ color: "var(--theme-text-tone)" }}>
            {reply || "Standing by for any thoughts you might want to explore."}
          </span>
        </div>
        {userMessage && (
          <div className="inline-flex max-w-full flex-col self-end rounded-2xl bg-white/3 px-3 py-2 text-right">
            <span className="text-[9px] font-medium uppercase tracking-[0.18em] opacity-60">
              You
            </span>
            <span className="mt-1 opacity-80" style={{ color: "var(--theme-text-tone)" }}>
              {userMessage}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="mt-2 flex items-center gap-2">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Ask the guide to reflect…"
          className="flex-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-light placeholder:opacity-60 focus:border-white/25 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20"
          style={{ color: "var(--theme-text-tone)" }}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-medium opacity-90 transition-colors hover:bg-white/20 disabled:cursor-default disabled:opacity-50"
        >
          {loading ? "Thinking" : "Send"}
        </button>
      </form>

      <div className="mt-2 flex flex-wrap justify-center gap-3">
        {stayingInZone ? (
          <button
            type="button"
            onClick={onBranchOutward}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10"
            style={{ color: "var(--theme-text-tone)" }}
          >
            Explore directions
          </button>
        ) : (
          <>
            <button
            type="button"
              onClick={onStayInZone}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Stay in this zone
            </button>
            <button
              type="button"
              onClick={onBranchOutward}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Branch outward
            </button>
          </>
        )}
      </div>
    </div>
  );
}

