"use client";

import { useEffect, useState } from "react";

interface WatchGuidePanelProps {
  reflection: string;
  currentTopic: string;
  stayingInZone: boolean;
  onStayInZone: () => void;
  onBranchOutward: () => void;
  onZoomOut: () => void;
  /** Clear current search and return to fresh search (wrong typo / wrong results) */
  onNewSearch?: () => void;
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
  onNewSearch,
  layout = "standalone",
}: WatchGuidePanelProps) {
  const isCard = layout === "card";

  // Card (mobile under player): light surface, high contrast — avoids greyed-out dark stack
  const baseClasses = isCard
    ? "border-t border-zinc-200 bg-zinc-50 px-4 py-4 space-y-3 dark:border-zinc-700 dark:bg-zinc-800/95"
    : "mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 space-y-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/90";

  const labelClass = isCard
    ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400"
    : "text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400";

  const bodyClass = isCard
    ? "break-words text-sm font-normal leading-relaxed text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-100"
    : "break-words text-xs font-light leading-relaxed text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-100";

  const bubbleClass = isCard
    ? "inline-flex w-full max-w-full min-w-0 flex-col rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm dark:border-zinc-600 dark:bg-zinc-900"
    : "inline-flex w-full max-w-full min-w-0 flex-col rounded-2xl border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900";

  /* text-base (16px) avoids iOS Safari auto-zoom on focus; sm:text-sm tightens on larger screens */
  const inputClass = isCard
    ? "flex-1 rounded-full border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-500 shadow-inner focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 sm:text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-white/10"
    : "flex-1 rounded-full border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900/10 sm:text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100";

  const btnSecondary =
    "rounded-full border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700";

  const btnGhost =
    "rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700";

  const [summary, setSummary] = useState<string>("");
  const [userMessage, setUserMessage] = useState<string>("");
  const [reply, setReply] = useState<string>("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({
          topic: currentTopic,
          reflection: summary || reflection,
          userMessage: trimmed,
        }),
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className={labelClass}>Guide</p>
        <div className="flex flex-wrap items-center gap-2">
          {onNewSearch && (
            <button
              type="button"
              onClick={onNewSearch}
              className={btnSecondary}
            >
              New search
            </button>
          )}
          <button type="button" onClick={onZoomOut} className={btnSecondary}>
            Zoom Out
          </button>
        </div>
      </div>

      <p className={bodyClass}>{summary || reflection}</p>

      <div className="mt-1 space-y-2 text-sm leading-relaxed">
        <div className={bubbleClass}>
          <span className={labelClass}>Guide</span>
          <span className="mt-1 block break-words text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-100">
            {reply || "Standing by for any thoughts you might want to explore."}
          </span>
        </div>
        {userMessage && (
          <div
            className={`${bubbleClass} self-end text-right`}
            style={{ marginLeft: "auto" }}
          >
            <span className={labelClass}>You</span>
            <span className="mt-1 block break-words text-zinc-800 [overflow-wrap:anywhere] dark:text-zinc-100">
              {userMessage}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="mt-3 flex items-center gap-2">
        <input
          type="text"
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Ask the guide to reflect…"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {stayingInZone ? (
          <button type="button" onClick={onBranchOutward} className={btnGhost}>
            Explore directions
          </button>
        ) : (
          <>
            <button type="button" onClick={onStayInZone} className={btnGhost}>
              Stay in this zone
            </button>
            <button
              type="button"
              onClick={onBranchOutward}
              className={btnGhost}
            >
              Branch outward
            </button>
          </>
        )}
      </div>
    </div>
  );
}
