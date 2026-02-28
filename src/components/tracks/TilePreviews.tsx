"use client";

/** Distinct micro-previews: each tile feels like a room with different acoustics. */

export function ResearchPreview() {
  return (
    <div className="tile-preview-research flex h-full flex-col gap-2 p-2.5">
      {/* Subtle horizontal grid lines */}
      <div className="flex flex-1 flex-col justify-between gap-px">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-px flex-1 min-h-[2px] rounded bg-black/[0.06]" />
        ))}
      </div>
      <div className="h-1 w-3/4 rounded-sm bg-black/[0.08]" />
      <div className="h-1 w-1/2 rounded-sm bg-black/[0.05]" />
    </div>
  );
}

export function NewsPreview() {
  return (
    <div className="tile-preview-news relative flex h-full items-center justify-center p-3">
      {/* Small circular temperature glow with pulse */}
      <div
        className="h-10 w-10 rounded-full opacity-90"
        style={{
          background: "radial-gradient(circle, var(--tile-accent) 0%, transparent 70%)",
          animation: "temperature-pulse 3s ease-in-out infinite",
        }}
      />
      <div
        className="absolute h-6 w-6 rounded-full border-2 border-black/10"
        style={{ borderColor: "var(--tile-accent)" }}
      />
    </div>
  );
}

export function WatchPreview() {
  return (
    <div className="tile-preview-watch grid grid-cols-3 gap-1.5 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-1 rounded-md bg-black/20 p-1.5">
          <div className="aspect-video rounded bg-black/25" />
          <div className="h-0.5 w-full rounded bg-black/15" />
          <div className="h-0.5 w-2/3 rounded bg-black/10" />
        </div>
      ))}
    </div>
  );
}

export function ReflectPreview() {
  return (
    <div className="tile-preview-reflect flex h-full flex-col justify-center gap-3 px-4 py-5">
      <div className="h-1.5 w-full max-w-[85%] rounded-full bg-black/[0.06]" />
      <div className="h-1.5 w-4/5 max-w-[75%] rounded-full bg-black/[0.05]" />
    </div>
  );
}
