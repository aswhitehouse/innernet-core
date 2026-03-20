"use client";

const summaries = [
  {
    title: "Policy and regulation",
    summary: "Updates remain incremental. No major shifts this week. Stable outlook.",
  },
  {
    title: "Technology",
    summary: "Industry focus on efficiency and consolidation. Few surprises.",
  },
  {
    title: "Climate & environment",
    summary: "Reporting continues to emphasise data over alarm. Measured tone.",
  },
];

/** Mock "system temperature" 0–100, lower = calmer */
const systemTemp = 34;

export function NewsTrack() {
  return (
    <div className="flex h-full flex-col p-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider opacity-70"
        style={{ color: "var(--theme-accent)" }}
      >
        News
      </h2>
      <p
        className="mt-1 text-base opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        System temperature and structured summaries. Stability over noise.
      </p>
      <div className="mt-6">
        <p
          className="text-xs font-medium uppercase tracking-wider opacity-60"
          style={{ color: "var(--theme-text-tone)" }}
        >
          System temperature
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div
            className="h-2 flex-1 overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${systemTemp}%`,
                backgroundColor: "var(--theme-accent)",
              }}
            />
          </div>
          <span
            className="text-sm tabular-nums opacity-80"
            style={{ color: "var(--theme-text-tone)" }}
          >
            {systemTemp}
          </span>
        </div>
        <p className="mt-1 text-xs opacity-60" style={{ color: "var(--theme-text-tone)" }}>
          Low, information flow is manageable.
        </p>
      </div>
      <ul className="mt-6 space-y-4">
        {summaries.map((s, i) => (
          <li key={i} className="rounded-xl border border-black/[0.06] bg-white/40 p-4">
            <p
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-tone)" }}
            >
              {s.title}
            </p>
            <p
              className="mt-1 text-sm leading-relaxed opacity-85"
              style={{ color: "var(--theme-text-tone)" }}
            >
              {s.summary}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
