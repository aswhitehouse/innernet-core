"use client";

import { useState, useCallback, useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Tile, type TrackId } from "@/components/Tile";
import { CentralPane } from "@/components/CentralPane";
import {
  ResearchPreview,
  NewsPreview,
  WatchPreview,
  ReflectPreview,
} from "@/components/tracks/TilePreviews";

const TRACKS: { id: TrackId; label: string; icon: string; accentHint?: string }[] = [
  { id: "research", label: "Research", icon: "🔬", accentHint: "#5c6b6e" },
  { id: "news", label: "News", icon: "🌍", accentHint: "#6b6e5c" },
  { id: "watch", label: "Watch", icon: "🎥", accentHint: "#6e5c6b" },
  { id: "reflect", label: "Reflect", icon: "🌿", accentHint: "#5e6b5c" },
];

const PREVIEWS: Record<TrackId, React.ReactNode> = {
  research: <ResearchPreview />,
  news: <NewsPreview />,
  watch: <WatchPreview />,
  reflect: <ReflectPreview />,
};

const NAME_KEY = "innernet-name";

function getStoredName(): string {
  if (typeof window === "undefined") return "there";
  return localStorage.getItem(NAME_KEY) || "there";
}

function HomeContent({
  activeTrack,
  onTrackChange,
  name,
  watchHasBeenOpened,
}: {
  activeTrack: TrackId | null;
  onTrackChange: (id: TrackId | null) => void;
  name: string;
  watchHasBeenOpened: boolean;
}) {
  const handleSelect = useCallback(
    (id: TrackId) => {
      onTrackChange(activeTrack === id ? null : id);
    },
    [activeTrack, onTrackChange]
  );

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header: welcome — recedes when Watch is active */}
      <header
        className={`mb-8 transition-all duration-500 ease-out ${
          activeTrack === "watch" ? "opacity-50" : ""
        }`}
      >
        <h1
          className={`font-medium tracking-tight transition-all duration-500 ${
            activeTrack === "watch" ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
          }`}
          style={{ color: "var(--theme-text-tone)" }}
        >
          Welcome, {name}. Where should we go today?
        </h1>
        <p
          className="mt-1 text-sm opacity-70"
          style={{ color: "var(--theme-text-tone)" }}
        >
          My Innernet — your digital habitat
        </p>
      </header>

      {/* Cognitive Canvas: central pane */}
      <section className="mb-8">
        <CentralPane
          activeTrack={activeTrack}
          onCloseTrack={activeTrack ? () => onTrackChange(null) : undefined}
          watchHasBeenOpened={watchHasBeenOpened}
        />
      </section>

      {/* Track tiles grid */}
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="tablist"
        aria-label="Tracks"
      >
        {TRACKS.map(({ id, label, icon, accentHint }) => (
          <Tile
            key={id}
            id={id}
            label={label}
            icon={icon}
            isActive={activeTrack === id}
            onSelect={() => handleSelect(id)}
            accentHint={accentHint}
          >
            {PREVIEWS[id]}
          </Tile>
        ))}
      </section>
    </div>
  );
}

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);
  const [name, setName] = useState("there");
  const [watchHasBeenOpened, setWatchHasBeenOpened] = useState(false);

  useEffect(() => {
    setName(getStoredName());
  }, []);

  useEffect(() => {
    if (activeTrack === "watch") setWatchHasBeenOpened(true);
  }, [activeTrack]);

  return (
    <ThemeProvider watchActive={activeTrack === "watch"}>
      <HomeContent
        activeTrack={activeTrack}
        onTrackChange={setActiveTrack}
        name={name}
        watchHasBeenOpened={watchHasBeenOpened}
      />
    </ThemeProvider>
  );
}
