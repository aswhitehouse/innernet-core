"use client";

import { useState } from "react";

const sections = [
  {
    title: "Context & framing",
    body: "Current work is oriented around lightweight systems for personal knowledge and ambient context. The goal is to reduce friction between intention and action.",
  },
  {
    title: "Open questions",
    body: "How might a 'cognitive canvas' support both focus and serendipity without becoming another feed? What minimal invariants should persist across sessions?",
  },
  {
    title: "Methods",
    body: "Iterative prototyping with a bias toward calm, low-chrome interfaces. Preference for local-first and optional connectivity.",
  },
];

const citations = [
  "Engelbart, D. (1962). Augmenting Human Intellect.",
  "Nielsen, J. (1994). Usability Engineering. Morgan Kaufmann.",
  "Hall, E. (1966). The Hidden Dimension. Anchor.",
];

export function ResearchTrack() {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="flex h-full flex-col p-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider opacity-70"
        style={{ color: "var(--theme-accent)" }}
      >
        Research
      </h2>
      <p
        className="mt-1 text-base opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        Structured notes and references. Calm, analytical tone.
      </p>
      <div className="mt-6 space-y-2">
        {sections.map((s, i) => (
          <div
            key={i}
            className="rounded-xl border border-black/[0.06] bg-white/50 transition-colors"
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--theme-text-tone)" }}
              >
                {s.title}
              </span>
              <span
                className="text-xs opacity-60"
                style={{ color: "var(--theme-text-tone)" }}
              >
                {expanded === i ? "−" : "+"}
              </span>
            </button>
            {expanded === i && (
              <div
                className="border-t border-black/[0.06] px-4 py-3 text-sm leading-relaxed opacity-85"
                style={{ color: "var(--theme-text-tone)" }}
              >
                {s.body}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 border-t border-black/[0.06] pt-4">
        <p
          className="text-xs font-medium uppercase tracking-wider opacity-60"
          style={{ color: "var(--theme-text-tone)" }}
        >
          References
        </p>
        <ul className="mt-2 space-y-1 text-xs opacity-80" style={{ color: "var(--theme-text-tone)" }}>
          {citations.map((c, i) => (
            <li key={i} className="font-mono">{c}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
