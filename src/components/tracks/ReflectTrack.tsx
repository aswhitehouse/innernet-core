"use client";

import { useState } from "react";

const prompts = [
  "What felt most aligned today?",
  "What would you let go of before tomorrow?",
];

export function ReflectTrack() {
  const [value, setValue] = useState("");

  return (
    <div className="flex h-full flex-col p-6">
      <h2
        className="text-sm font-semibold uppercase tracking-wider opacity-70"
        style={{ color: "var(--theme-accent)" }}
      >
        Reflect
      </h2>
      <p
        className="mt-1 text-base opacity-90"
        style={{ color: "var(--theme-text-tone)" }}
      >
        Soft prompts. No pressure. Local only.
      </p>
      <div className="mt-8 space-y-6">
        {prompts.map((p, i) => (
          <p
            key={i}
            className="text-lg font-light italic leading-relaxed opacity-90"
            style={{ color: "var(--theme-text-tone)", fontFamily: "var(--font-serif, Georgia, serif)" }}
          >
            {p}
          </p>
        ))}
      </div>
      <div className="mt-8">
        <label
          htmlFor="reflect-input"
          className="text-xs font-medium uppercase tracking-wider opacity-60"
          style={{ color: "var(--theme-text-tone)" }}
        >
          Optional note
        </label>
        <textarea
          id="reflect-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="A few words, if you like..."
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-black/[0.08] bg-white/50 px-4 py-3 text-sm placeholder:opacity-50 focus:border-[var(--theme-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--theme-accent)]"
          style={{
            color: "var(--theme-text-tone)",
          }}
        />
      </div>
    </div>
  );
}
