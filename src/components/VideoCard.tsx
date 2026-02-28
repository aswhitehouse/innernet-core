"use client";

import Image from "next/image";
import type { MockVideo } from "@/lib/watchTypes";

const THUMB = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

interface VideoCardProps {
  video: MockVideo;
  onSelect: () => void;
}

export function VideoCard({ video, onSelect }: VideoCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group relative w-full overflow-hidden rounded-xl bg-black/20 shadow-md transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <div className="aspect-video w-full">
        <Image
          src={THUMB(video.youtubeId)}
          alt=""
          width={320}
          height={180}
          className="h-full w-full object-cover transition-transform duration-400 ease-out group-hover:scale-105"
          unoptimized
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent p-2.5">
        <p className="line-clamp-1 text-left text-xs font-medium text-white/95">
          {video.title}
        </p>
      </div>
      <div className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/90">
        {video.duration}
      </div>
    </button>
  );
}
