"use client";

import type { MockVideo } from "@/lib/watchTypes";
import { VideoCard } from "./VideoCard";

interface VideoRailProps {
  videos: MockVideo[];
  title?: string;
  onSelect: (video: MockVideo) => void;
}

export function VideoRail({ videos, title, onSelect }: VideoRailProps) {
  return (
    <section className="w-full">
      {title && (
        <h3
          className="mb-4 text-sm font-medium opacity-75"
          style={{ color: "var(--theme-text-tone)" }}
        >
          {title}
        </h3>
      )}
      <div className="flex gap-5 overflow-x-auto pb-1">
        {videos.map((video) => (
          <div
            key={video.id}
            className="flex-shrink-0"
            style={{ width: "min(200px, 28vw)" }}
          >
            <VideoCard video={video} onSelect={() => onSelect(video)} />
          </div>
        ))}
      </div>
    </section>
  );
}
