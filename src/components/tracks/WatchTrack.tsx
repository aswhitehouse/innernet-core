"use client";

/**
 * Watch track — future critical piece.
 * Philosophy: surface summaries first, emotional intensity, topic tags,
 * and "Why this was surfaced" so the feed stays intentional, not rage-bait driven.
 */

const videos = [
  {
    title: "Designing for calm technology",
    summary: "Principles for interfaces that inform without overwhelming.",
    signalLevel: "high" as const,
    emotionalIntensity: "low" as const,
    tags: ["design", "attention", "calm"],
    whySurfaced: "Matches your interest in low-friction systems.",
  },
  {
    title: "The future of local-first software",
    summary: "Offline-first, sync, and ownership of data.",
    signalLevel: "high" as const,
    emotionalIntensity: "low" as const,
    tags: ["engineering", "privacy", "sync"],
    whySurfaced: "Aligned with your reading on local-first.",
  },
  {
    title: "Ambient awareness and focus",
    summary: "Balancing context with deep work. Short and practical.",
    signalLevel: "medium" as const,
    emotionalIntensity: "medium" as const,
    tags: ["productivity", "focus", "context"],
    whySurfaced: "You’ve engaged with similar topics before.",
  },
];

const intensityLabels: Record<string, string> = {
  low: "Calm",
  medium: "Moderate",
  high: "Intense",
};

export function WatchTrack() {
  return (
    <div className="flex h-full flex-col p-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider opacity-70"
        style={{ color: "var(--theme-accent)" }}
      >
        Watch
      </h2>
      <p
        className="mt-1 text-base opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        Summaries first. Emotional tone visible. You choose what to open.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v, i) => (
          <article
            key={i}
            className="flex flex-col rounded-xl border border-black/[0.06] bg-white/50 p-4 transition-shadow duration-300 hover:shadow-sm"
            style={{ boxShadow: "var(--theme-shadow)" }}
          >
            {/* Summary first — no thumbnail autoplay or clickbait */}
            <h3
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-tone)" }}
            >
              {v.title}
            </h3>
            <p
              className="mt-1.5 text-xs leading-relaxed opacity-85"
              style={{ color: "var(--theme-text-tone)" }}
            >
              {v.summary}
            </p>
            {/* Emotional intensity indicator */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor:
                    v.signalLevel === "high"
                      ? "var(--theme-accent)"
                      : "var(--theme-accent-muted)",
                  color: "#fff",
                }}
              >
                Signal: {v.signalLevel === "high" ? "High" : "Medium"}
              </span>
              <span
                className="rounded-full border px-2 py-0.5 text-xs opacity-80"
                style={{
                  borderColor: "var(--theme-accent-muted)",
                  color: "var(--theme-text-tone)",
                }}
              >
                {intensityLabels[v.emotionalIntensity]} tone
              </span>
            </div>
            {/* Topic tags */}
            <div className="mt-2 flex flex-wrap gap-1">
              {v.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] uppercase tracking-wider opacity-60"
                  style={{ color: "var(--theme-text-tone)" }}
                >
                  #{tag}
                </span>
              ))}
            </div>
            {/* Why this was surfaced — transparency layer */}
            <p
              className="mt-3 border-t border-black/[0.06] pt-2 text-[11px] italic opacity-70"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Why here: {v.whySurfaced}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
