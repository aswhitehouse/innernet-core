"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CentralPane } from "@/components/CentralPane";
import { Tile, type TrackId } from "@/components/Tile";
import { WatchTilePreview } from "@/components/tile-previews/WatchTilePreview";
import { IntroThreshold } from "@/components/IntroThreshold";
import { IdentityGate } from "@/components/IdentityGate";

const STORAGE_KEY = "innernet-mode";

type IdentityPayload = {
  name: string;
  lastSession: { at: string; mode: string; summary: string } | null;
};

function postTrajectory(mode: string, summary: string) {
  fetch("/api/identity/trajectory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ mode, summary }),
  }).catch(() => {});
}

const TRACKS: { id: TrackId; label: string; icon: string }[] = [
  { id: "watch", label: "Video", icon: "▶" },
];

const SUGGESTION_TRACKS: { id: TrackId; label: string; icon: string }[] = [
  { id: "watch", label: "Video", icon: "▶" },
];

const PREVIEWS: Record<TrackId, React.ReactNode> = {
  watch: <WatchTilePreview />,
  research: null,
  news: null,
  reflect: null,
};

function HomeContent({
  enabledTracks,
  activeTrack,
  onEnableTrack,
  onTrackChange,
}: {
  enabledTracks: TrackId[];
  activeTrack: TrackId | null;
  onEnableTrack: (id: TrackId) => void;
  onTrackChange: (id: TrackId | null) => void;
}) {
  const suggestions = SUGGESTION_TRACKS.filter(
    (t) => !enabledTracks.includes(t.id)
  );
  const watchOnly =
    enabledTracks.length === 1 && enabledTracks[0] === "watch";

  // Single source (video only): full-width explore — no sidebar, portal + input immediately
  if (watchOnly) {
    return (
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        <CentralPane
          activeTrack={activeTrack}
          watchHasBeenOpened
        />
      </main>
    );
  }

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 sm:flex-row sm:items-start sm:gap-8 sm:px-6 sm:pt-8">
      <aside className="flex w-full shrink-0 flex-col gap-4 sm:w-[280px]">
        <div className="rounded-2xl border border-black/[0.06] bg-white/70 p-4 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/40">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45 dark:text-white/45">
            Sources
          </p>
          <div className="flex flex-col gap-3">
            {enabledTracks.map((id) => {
              const meta = TRACKS.find((t) => t.id === id);
              if (!meta) return null;
              return (
                <Tile
                  key={id}
                  id={id}
                  label={meta.label}
                  icon={meta.icon}
                  isActive={activeTrack === id}
                  onSelect={() =>
                    onTrackChange(activeTrack === id ? null : id)
                  }
                >
                  {PREVIEWS[id]}
                </Tile>
              );
            })}
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="rounded-2xl border border-dashed border-black/10 bg-white/40 p-4 backdrop-blur-md dark:border-white/10 dark:bg-black/20">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40 dark:text-white/40">
              Add source
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onEnableTrack(t.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
                >
                  <span>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      <section className="min-h-[320px] flex-1 rounded-3xl border border-black/[0.06] bg-white/60 p-4 shadow-sm backdrop-blur-xl dark:border-white/[0.08] dark:bg-black/40 sm:p-6">
        <CentralPane
          activeTrack={activeTrack}
          watchHasBeenOpened
        />
      </section>
    </main>
  );
}

export default function Home() {
  const router = useRouter();
  const [identity, setIdentity] = useState<IdentityPayload | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const [mode, setMode] = useState<"intro" | "explore" | "drift" | null>(null);
  const [enabledTracks, setEnabledTracks] = useState<TrackId[]>([]);
  const [activeTrack, setActiveTrack] = useState<TrackId | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as
      | "explore"
      | "drift"
      | null;
    if (stored === "explore" || stored === "drift") {
      setMode(stored);
      if (stored === "explore") {
        // Video only: open explore input immediately (no second click)
        setEnabledTracks(["watch"]);
        setActiveTrack("watch");
      }
    } else {
      setMode("intro");
    }
    setHasCheckedStorage(true);
  }, []);

  const handleChooseExplore = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "explore");
    }
    setEnabledTracks(["watch"]);
    setActiveTrack("watch");
    setMode("explore");
    postTrajectory("explore", "Opened Explore — video search");
  };

  const handleChooseDrift = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "drift");
    }
    setMode("drift");
    postTrajectory("drift", "Opened Drift (not ready)");
  };

  const handleLogout = async () => {
    await fetch("/api/identity/logout", {
      method: "POST",
      credentials: "include",
    });
    setIdentity(null);
    setMode(null);
    setHasCheckedStorage(false);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setHasCheckedStorage(true);
    setMode("intro");
  };

  const handleEnableTrack = (id: TrackId) => {
    setEnabledTracks((prev) =>
      prev.includes(id) ? prev : [...prev, id]
    );
    // One click into explore: activating video opens portal + input immediately
    if (id === "watch") {
      setActiveTrack("watch");
    }
  };

  const handleTrackChange = (id: TrackId | null) => {
    setActiveTrack(id);
  };

  if (!identity) {
    return (
      <IdentityGate
        onIdentified={(payload) => {
          setIdentity(payload);
          // Always land on intro after identify so "Welcome, {name}, where should we go today?" shows.
          // Explore/Drift from localStorage resume only via the intro halves.
          setMode("intro");
          setHasCheckedStorage(true);
        }}
      />
    );
  }

  if (!hasCheckedStorage || mode === null) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f6f8] text-black dark:bg-[#050608] dark:text-white">
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-pulse rounded-full bg-black/10 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (mode === "intro") {
    return (
      <IntroThreshold
        welcomeName={identity.name}
        lastSessionSummary={
          identity.lastSession
            ? `Last time: ${identity.lastSession.summary}`
            : null
        }
        onSelect={(m) =>
          m === "explore" ? handleChooseExplore() : handleChooseDrift()
        }
      />
    );
  }

  if (mode === "drift") {
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f6f8] text-black dark:bg-[#050608] dark:text-white">
        <header className="relative z-10 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-black/60 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
                Innernet
              </p>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Drift
              </h1>
              {identity && (
                <p className="mt-1 text-sm font-medium text-black/80 dark:text-white/90">
                  Welcome, {identity.name}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  window.localStorage.removeItem(STORAGE_KEY);
                  setMode("intro");
                }}
                className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                Switch mode
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
              >
                Change user
              </button>
            </div>
          </div>
        </header>
        <main className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div
            className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-left shadow-sm dark:border-amber-900/50 dark:bg-amber-950/40"
            role="status"
          >
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Drift is not ready for consumption yet.
            </p>
            <p className="mt-2 text-sm text-amber-800/90 dark:text-amber-200/80">
              Please come back when we&apos;ve finished implementation.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-6 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/5"
          >
            Back home
          </button>
        </main>
      </div>
    );
  }

  // Explore (video only) — full-width, input visible on load
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f6f8] text-black dark:bg-[#050608] dark:text-white">
      <header className="relative z-10 border-b border-black/5 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-white/5 dark:bg-black/60 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">
              Innernet
            </p>
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
              Explore
            </h1>
            {identity && (
              <p className="mt-1 text-sm font-medium text-black/80 dark:text-white/90">
                Welcome, {identity.name}, where should we go today?
              </p>
            )}
            <p className="mt-0.5 text-xs text-black/50 dark:text-white/50">
              Search videos below
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                window.localStorage.removeItem(STORAGE_KEY);
                setMode("intro");
              }}
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              Switch mode
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs font-medium text-black/70 backdrop-blur-sm transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:hover:bg-white/10"
            >
              Change user
            </button>
          </div>
        </div>
      </header>

      <HomeContent
        enabledTracks={enabledTracks}
        activeTrack={activeTrack}
        onEnableTrack={handleEnableTrack}
        onTrackChange={handleTrackChange}
      />
    </div>
  );
}
