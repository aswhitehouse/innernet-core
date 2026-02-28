"use client";

interface PortalPlayerProps {
  youtubeId: string;
  title: string;
  onExit: () => void;
}

/**
 * Embedded YouTube player inside Innernet frame.
 * No autoplay of next; no YouTube chrome beyond the player.
 * Visually contained within the portal.
 */
export function PortalPlayer({ youtubeId, title, onExit }: PortalPlayerProps) {
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&modestbranding=1&rel=0`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black shadow-2xl">
      <div className="aspect-video w-full">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <div className="absolute right-3 top-3">
        <button
          type="button"
          onClick={onExit}
          className="rounded-xl border border-white/20 bg-black/60 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/10"
          style={{ color: "var(--theme-text-tone)" }}
        >
          Exit
        </button>
      </div>
    </div>
  );
}
