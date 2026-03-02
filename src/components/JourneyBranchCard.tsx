"use client";

import Image from "next/image";
import type { JourneyBranch } from "@/lib/branches";

interface JourneyBranchCardProps {
  branch: JourneyBranch;
  index: number;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/** Single branch card: title, description, one thumbnail. No metrics. Hover lift + optional stagger/enter. */
export function JourneyBranchCard({ branch, index, onSelect, className, style }: JourneyBranchCardProps) {
  const thumb = branch.video.thumbnailUrl ?? `https://img.youtube.com/vi/${branch.video.youtubeId}/default.jpg`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`branch-card-lift group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left transition-all duration-300 hover:border-white/20 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${className ?? ""}`}
      style={style}
    >
      <div className="branch-card-thumb aspect-video w-full overflow-hidden">
        <Image
          src={thumb}
          alt=""
          width={400}
          height={225}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          unoptimized
        />
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span
          className="text-sm font-medium"
          style={{ color: "var(--theme-text-tone)" }}
        >
          {branch.title}
        </span>
        <p className="line-clamp-2 text-xs opacity-80" style={{ color: "var(--theme-text-tone)" }}>
          {branch.description}
        </p>
      </div>
    </button>
  );
}
