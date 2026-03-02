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
  { id: "watch", label: "Watch · YouTube", icon: "🎥", accentHint: "#6e5c6b" },
  { id: "news", label: "News", icon: "🌍", accentHint: "#6b6e5c" },
  { id: "research", label: "Research", icon: "🔬", accentHint: "#5c6b6e" },
  { id: "reflect", label: "Reflect", icon: "🌿", accentHint: "#5e6b5c" },
];

const PREVIEWS: Record<TrackId, React.ReactNode> = {
  research: <ResearchPreview />,
  news: <NewsPreview />,
  watch: <WatchPreview />,
  reflect: <ReflectPreview />,
};

// Left-side suggestions: which sources the user can add as tiles.
const SUGGESTION_TRACKS: { id: TrackId; label: string; icon: string }[] = [
  { id: "watch", label: "YouTube", icon: "🎥" },
  { id: "news", label: "News", icon: "🌍" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "reflect", label: "Reflect", icon: "🌿" },
];

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
  enabledTracks,
  onEnableTrack,
}: {
  activeTrack: TrackId | null;
  onTrackChange: (id: TrackId | null) => void;
  name: string;
  watchHasBeenOpened: boolean;
  enabledTracks: TrackId[];
  onEnableTrack: (id: TrackId) => void;
}) {
  const handleSelectTrack = useCallback(
    (id: TrackId) => {
      if (id === "watch" && activeTrack === "watch") {
        onTrackChange(null);
        return;
      }
      onTrackChange(activeTrack === id ? null : id);
    },
    [activeTrack, onTrackChange]
  );

  const enabledSet = new Set(enabledTracks);
  const suggestions = SUGGESTION_TRACKS.filter((s) => !enabledSet.has(s.id));

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header: full width above */}
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

      <div className="flex gap-6">
        {/* Left: suggested sources — title aligned with top of central pane */}
        <aside className="w-40 shrink-0 space-y-3">
          <div>
            <h2
              className="text-xs font-medium uppercase tracking-[0.18em] opacity-70"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Sources
            </h2>
            <p
              className="mt-1 text-[11px] leading-snug opacity-60"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Choose what lives in your habitat. Click to add tiles.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {suggestions.length === 0 && (
              <p
                className="text-[11px] italic opacity-50"
                style={{ color: "var(--theme-text-tone)" }}
              >
                All sources added below.
              </p>
            )}
            {suggestions.map(({ id, label, icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onEnableTrack(id)}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{icon}</span>
                  <span>{label}</span>
                </span>
                <span className="text-[10px] opacity-70">Add</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Right: central pane and user-built tiles */}
        <div className="flex-1">
          <section className="mb-8">
            <CentralPane
              activeTrack={activeTrack}
              onCloseTrack={activeTrack ? () => onTrackChange(null) : undefined}
              watchHasBeenOpened={watchHasBeenOpened}
            />
          </section>

          {enabledTracks.length === 0 ? (
            <p
              className="text-sm opacity-60"
              style={{ color: "var(--theme-text-tone)" }}
            >
              Choose one or more sources on the left to build your track tiles.
            </p>
          ) : (
            <section
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
              role="tablist"
              aria-label="Tracks"
            >
              {enabledTracks.map((id) => {
                const track = TRACKS.find((t) => t.id === id);
                if (!track) return null;
                const { label, icon, accentHint } = track;
                return (
                  <Tile
                    key={id}
                    id={id}
                    label={label}
                    icon={icon}
                    isActive={activeTrack === id}
                    onSelect={() => handleSelectTrack(id)}
                    accentHint={accentHint}
                  >
                    {PREVIEWS[id]}
                  </Tile>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);
  const [name, setName] = useState("there");
  const [watchHasBeenOpened, setWatchHasBeenOpened] = useState(false);
  const [enabledTracks, setEnabledTracks] = useState<TrackId[]>([]);

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
        enabledTracks={enabledTracks}
        onEnableTrack={(id) =>
          setEnabledTracks((prev) =>
            prev.includes(id) ? prev : [...prev, id]
          )
        }
      />
    </ThemeProvider>
  );
}
