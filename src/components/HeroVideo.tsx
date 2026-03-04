"use client";

import Image from "next/image";

export interface PortalVideoShape {
  id: string;
  youtubeId: string;
  title: string;
  duration?: string;
  thumbnailUrl?: string;
}

const defaultThumb = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

interface HeroVideoProps {
  video: PortalVideoShape;
  /** Optional: shows "Zone: {zoneLabel}" when provided (Sovereign Portal) */
  zoneLabel?: string;
  /** Optional: when provided, card is clickable and triggers onPlay */
  onPlay?: () => void;
}

export function HeroVideo({ video, zoneLabel, onPlay }: HeroVideoProps) {
  const thumb = video.thumbnailUrl ?? defaultThumb(video.youtubeId);
  const duration = video.duration ?? "—";
  const isClickable = Boolean(onPlay);

  return (
    <div className="relative overflow-hidden rounded-none bg-black/40 shadow-2xl sm:rounded-2xl">
      <div
        className="absolute -z-10 inset-x-2 top-2 bottom-2 rounded-2xl"
        style={{ boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5)" }}
      />
      <div
        className={`group relative aspect-[16/9] min-h-[85vh] w-full sm:min-h-[300px] ${isClickable ? "cursor-pointer" : ""}`}
        onClick={isClickable ? onPlay : undefined}
        onKeyDown={isClickable ? (e) => e.key === "Enter" && onPlay?.() : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
      >
        <Image
          src={thumb}
          alt=""
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 1024px) 100vw, 1024px"
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ boxShadow: "inset 0 0 100px 16px rgba(0,0,0,0.2)" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/90 bg-white/10 shadow-xl backdrop-blur-sm transition-all duration-300 ease-out group-hover:scale-[1.03] group-hover:bg-white/20">
            <span className="ml-1 text-3xl text-white">▶</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          {zoneLabel && (
            <p
              className="text-xs font-medium uppercase tracking-wider opacity-80"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Zone: {zoneLabel}
            </p>
          )}
          <h2 className={`line-clamp-1 text-xl font-semibold drop-shadow-lg sm:text-2xl ${zoneLabel ? "mt-1" : ""}`}>
            {video.title}
          </h2>
          <p className="mt-1 text-xs opacity-90">{duration}</p>
        </div>
        <div className="absolute bottom-4 right-4 rounded bg-black/70 px-2.5 py-1 text-xs font-medium text-white/95">
          {duration}
        </div>
      </div>
    </div>
  );
}
