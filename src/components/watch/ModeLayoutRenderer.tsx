"use client";

import type { MockVideo } from "@/lib/watchTypes";
import type { WatchIntent } from "@/lib/watchTypes";
import { VideoCard } from "./VideoCard";

interface ModeLayoutRendererProps {
  intent: WatchIntent;
  videos: MockVideo[];
  onSelectVideo: (video: MockVideo) => void;
}

/** Group videos by topic for Deep Dive */
function byTopic(videos: MockVideo[]): Map<string, MockVideo[]> {
  const map = new Map<string, MockVideo[]>();
  for (const v of videos) {
    const list = map.get(v.topic) ?? [];
    list.push(v);
    map.set(v.topic, list);
  }
  return map;
}

export function ModeLayoutRenderer({ intent, videos, onSelectVideo }: ModeLayoutRendererProps) {
  if (intent === "learn") {
    return (
      <div className="space-y-3 transition-all duration-500 ease-out">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: "var(--theme-text-tone)" }}>
          Structured list · summary first
        </p>
        <div className="space-y-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              intent={intent}
              variant="list"
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </div>
    );
  }

  if (intent === "wind-down") {
    return (
      <div className="transition-all duration-500 ease-out">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: "var(--theme-text-tone)" }}>
          Softer focus · minimal metadata
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              intent={intent}
              variant="minimal"
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </div>
    );
  }

  if (intent === "deep-dive") {
    const grouped = byTopic(videos);
    const topics = Array.from(grouped.keys());
    return (
      <div className="space-y-6 transition-all duration-500 ease-out">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: "var(--theme-text-tone)" }}>
          Clustered by topic
        </p>
        {/* Simple topic graph mock: circles/nodes */}
        <div className="flex flex-wrap gap-3">
          {topics.map((topic) => (
            <div
              key={topic}
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-medium opacity-80"
              style={{
                borderColor: "var(--watch-accent)",
                color: "var(--theme-text-tone)",
              }}
            >
              {topic.slice(0, 2)}
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {topics.map((topic) => (
            <div key={topic}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider opacity-80" style={{ color: "var(--watch-accent)" }}>
                {topic}
              </h3>
              <div className="space-y-2">
                {(grouped.get(topic) ?? []).map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    intent={intent}
                    variant="list"
                    onSelect={onSelectVideo}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (intent === "stay-informed") {
    /* Time-sorted mock: same list, label as "Latest" */
    return (
      <div className="space-y-3 transition-all duration-500 ease-out">
        <p className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: "var(--theme-text-tone)" }}>
          Time-sorted · low emotional framing
        </p>
        <div className="space-y-3">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              intent={intent}
              variant="list"
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </div>
    );
  }

  if (intent === "be-inspired") {
    return (
      <div className="transition-all duration-500 ease-out">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: "var(--theme-text-tone)" }}>
          Visual focus · medium density
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              intent={intent}
              variant="grid"
              onSelect={onSelectVideo}
            />
          ))}
        </div>
      </div>
    );
  }

  /* light-browse */
  return (
    <div className="transition-all duration-500 ease-out">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider opacity-60" style={{ color: "var(--theme-text-tone)" }}>
        Casual browse
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            intent={intent}
            variant="compact"
            onSelect={onSelectVideo}
          />
        ))}
      </div>
    </div>
  );
}
