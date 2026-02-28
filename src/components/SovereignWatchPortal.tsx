"use client";

import { useState, useCallback } from "react";
import type { MockVideo } from "@/lib/watchTypes";
import type { ZoneProfile } from "@/lib/zoneProfiles";
import { interpretIntent } from "@/lib/zoneProfiles";
import {
  getYouTubeResults,
  ZONE_LABELS,
  type YouTubePortalResult,
} from "@/data/mockYouTubeResults";
import { IntentInput } from "./IntentInput";
import { ZoneTransitionLayer } from "./ZoneTransitionLayer";
import { HeroVideo } from "./HeroVideo";
import { YouTubeCluster } from "./YouTubeCluster";
import { PortalPlayer } from "./PortalPlayer";
import { BranchOverlay } from "./BranchOverlay";

type Phase = "idle" | "interpreting" | "zone" | "playing" | "after-play";

const INTERPRETING_MS = 400;
const PORTAL_PLACEHOLDER = "What do you want to explore on YouTube?";

interface SovereignWatchPortalProps {
  /** Closes the Watch experience and returns to main page (like a window close) */
  onZoomOut?: () => void;
}

export function SovereignWatchPortal({ onZoomOut }: SovereignWatchPortalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [intentText, setIntentText] = useState("");
  const [zoneProfile, setZoneProfile] = useState<ZoneProfile | null>(null);
  const [previousZoneProfile, setPreviousZoneProfile] = useState<ZoneProfile | null>(null);
  const [portalData, setPortalData] = useState<YouTubePortalResult | null>(null);
  const [zoneContentVisible, setZoneContentVisible] = useState(true);
  const [promptFocused, setPromptFocused] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<MockVideo | null>(null);

  const isIdle = phase === "idle";
  const isAnchored = !isIdle;
  const zoneLabel = zoneProfile ? ZONE_LABELS[zoneProfile.id] : "";

  const handleSubmitIntent = useCallback(() => {
    const text = intentText.trim();
    if (!text) return;

    const profile = interpretIntent(text);
    const data = getYouTubeResults(profile.id);

    if (zoneProfile) {
      setPhase("interpreting");
      setPreviousZoneProfile(zoneProfile);
      setTimeout(() => {
        setPhase("zone");
        setZoneContentVisible(false);
        setZoneProfile(profile);
        setPortalData(data);
        setTimeout(() => {
          setZoneContentVisible(true);
          setPreviousZoneProfile(null);
        }, 600);
      }, INTERPRETING_MS);
      return;
    }

    setPhase("interpreting");
    setTimeout(() => {
      setZoneProfile(profile);
      setPortalData(data);
      setPhase("zone");
    }, INTERPRETING_MS);
  }, [intentText, zoneProfile]);

  const handlePlayHero = useCallback(() => {
    if (portalData) setPlayingVideo(portalData.hero);
    setPhase("playing");
  }, [portalData]);

  const handleSelectClusterVideo = useCallback((video: MockVideo) => {
    setPlayingVideo(video);
    setPhase("playing");
  }, []);

  const handleExitPlayer = useCallback(() => {
    setPlayingVideo(null);
    setPhase("after-play");
  }, []);

  const handleBranchChoice = useCallback(
    (option: string) => {
      if (!zoneProfile) return;
      const data = getYouTubeResults(zoneProfile.id);
      setPortalData(data);
      setPhase("zone");
    },
    [zoneProfile]
  );

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      style={
        zoneProfile
          ? {
              ["--theme-accent" as string]: zoneProfile.accent,
              ["--theme-text-tone" as string]: "#e8e6ed",
            }
          : undefined
      }
    >
      <ZoneTransitionLayer
        profile={zoneProfile}
        previousProfile={previousZoneProfile}
        idle={isIdle}
        dimmed={promptFocused}
      />

      {/* Zoom out — window-close style, top-right */}
      {onZoomOut && (
        <div className="absolute right-3 top-3 z-10 flex justify-end">
          <button
            type="button"
            onClick={onZoomOut}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            title="Zoom out"
            aria-label="Zoom out to main page"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Persistent prompt bar — always visible */}
      <div
        className={`flex shrink-0 flex-col items-center px-4 transition-all duration-500 ease-out ${
          isIdle ? "flex-1 justify-center py-12" : "pt-4 pb-2"
        }`}
      >
        <IntentInput
          variant={isIdle ? "idle" : "anchored"}
          value={intentText}
          onChange={setIntentText}
          onSubmit={handleSubmitIntent}
          disabled={phase === "interpreting"}
          interpreting={phase === "interpreting"}
          onFocus={() => isAnchored && setPromptFocused(true)}
          onBlur={() => setPromptFocused(false)}
          placeholder={PORTAL_PLACEHOLDER}
        />
        {isAnchored && (
          <p
            className="mt-2 text-center text-xs opacity-40 transition-opacity duration-300"
            style={{ color: "var(--theme-text-tone)" }}
          >
            Render a new direction.
          </p>
        )}
      </div>

      {/* Zone content: hero + cluster, or player, or branch overlay */}
      {(phase === "zone" || phase === "playing" || phase === "after-play") &&
        zoneProfile &&
        portalData && (
          <div
            className="flex flex-1 flex-col overflow-y-auto px-4 pb-12 pt-2 transition-opacity duration-300"
            style={{ opacity: promptFocused ? 0.5 : 1 }}
          >
            <div
              className="flex flex-col gap-10 transition-opacity duration-[350ms] ease-out"
              style={{ opacity: zoneContentVisible ? 1 : 0 }}
            >
              {phase === "zone" && (
                <>
                  <HeroVideo
                    video={portalData.hero}
                    zoneLabel={zoneLabel}
                    onPlay={handlePlayHero}
                  />
                  <YouTubeCluster
                    videos={portalData.cluster}
                    onSelect={handleSelectClusterVideo}
                  />
                </>
              )}

              {phase === "playing" && playingVideo && (
                <>
                  <PortalPlayer
                    youtubeId={playingVideo.youtubeId}
                    title={playingVideo.title}
                    onExit={handleExitPlayer}
                  />
                  <HeroVideo
                    video={portalData.hero}
                    zoneLabel={zoneLabel}
                    onPlay={handlePlayHero}
                  />
                  <YouTubeCluster
                    videos={portalData.cluster}
                    onSelect={handleSelectClusterVideo}
                  />
                </>
              )}

              {phase === "after-play" && (
                <>
                  <BranchOverlay
                    options={portalData.branchOptions}
                    onSelect={handleBranchChoice}
                  />
                  <HeroVideo
                    video={portalData.hero}
                    zoneLabel={zoneLabel}
                    onPlay={handlePlayHero}
                  />
                  <YouTubeCluster
                    videos={portalData.cluster}
                    onSelect={handleSelectClusterVideo}
                  />
                </>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
