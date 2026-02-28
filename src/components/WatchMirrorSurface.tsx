"use client";

import { useState, useCallback } from "react";
import type { ZoneProfile } from "@/lib/zoneProfiles";
import { interpretIntent } from "@/lib/zoneProfiles";
import { getZoneData } from "@/data/mockZoneData";
import { IntentInput } from "./IntentInput";
import { ZoneTransitionLayer } from "./ZoneTransitionLayer";
import { ZoneRenderer } from "./ZoneRenderer";

type Phase = "idle" | "interpreting" | "zone" | "playing" | "after-play";

const INTERPRETING_MS = 400;
const ZONE_FADE_MS = 350;

export function WatchMirrorSurface() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [intentText, setIntentText] = useState("");
  const [zoneProfile, setZoneProfile] = useState<ZoneProfile | null>(null);
  const [previousZoneProfile, setPreviousZoneProfile] = useState<ZoneProfile | null>(null);
  const [zoneData, setZoneData] = useState<ReturnType<typeof getZoneData> | null>(null);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);
  const [zoneContentVisible, setZoneContentVisible] = useState(true);
  const [promptFocused, setPromptFocused] = useState(false);
  const isIdle = phase === "idle";
  const isAnchored = !isIdle;

  const handleSubmitIntent = useCallback(() => {
    const text = intentText.trim();
    if (!text) return;

    const profile = interpretIntent(text);
    const data = getZoneData(profile.id);

    if (zoneProfile) {
      // Already in a zone: interpreting → fade out → update → fade in
      setPhase("interpreting");
      setPreviousZoneProfile(zoneProfile);

      setTimeout(() => {
        setPhase("zone");
        setZoneContentVisible(false);
        setZoneProfile(profile);
        setZoneData(data);
        setBranchOptions(data.branchOptions);

        setTimeout(() => {
          setZoneContentVisible(true);
          setPreviousZoneProfile(null);
        }, 600);
      }, INTERPRETING_MS);
      return;
    }

    // From idle: interpreting → zone
    setPhase("interpreting");
    setTimeout(() => {
      setZoneProfile(profile);
      setZoneData(data);
      setBranchOptions(data.branchOptions);
      setPhase("zone");
    }, INTERPRETING_MS);
  }, [intentText, zoneProfile]);

  const handlePlayHero = useCallback(() => setPhase("playing"), []);
  const handleFinishPlay = useCallback(() => setPhase("after-play"), []);
  const handleBranchChoice = useCallback((_option: string) => setPhase("zone"), []);

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
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

      {/* Persistent prompt bar: always visible */}
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

      {/* Zone content: hero + cluster or playing / after-play */}
      {(phase === "zone" || phase === "playing" || phase === "after-play") && zoneProfile && zoneData && (
        <div
          className="flex flex-1 flex-col overflow-y-auto px-4 pb-12 pt-2 transition-opacity duration-300"
          style={{ opacity: promptFocused ? 0.5 : 1 }}
        >
          <div
            className="flex flex-col gap-10 transition-opacity duration-[350ms] ease-out"
            style={{ opacity: zoneContentVisible ? 1 : 0 }}
          >
            {phase === "zone" && (
              <ZoneRenderer
                profile={zoneProfile}
                data={zoneData}
                onPlayHero={handlePlayHero}
                onSelectClusterVideo={() => {}}
              />
            )}

            {phase === "playing" && (
              <>
                <div className="relative overflow-hidden rounded-2xl bg-black/60">
                  <div className="flex aspect-video items-center justify-center">
                    <span className="text-4xl text-white/80">▶</span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <button
                      type="button"
                      onClick={handleFinishPlay}
                      className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium backdrop-blur-sm hover:bg-white/20"
                      style={{ color: "var(--theme-text-tone)" }}
                    >
                      Finish
                    </button>
                  </div>
                </div>
                <ZoneRenderer
                  profile={zoneProfile}
                  data={zoneData}
                  onPlayHero={handlePlayHero}
                  onSelectClusterVideo={() => {}}
                />
              </>
            )}

            {phase === "after-play" && (
              <>
                <div className="mb-8 rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
                  <p
                    className="mb-4 text-sm font-medium opacity-90"
                    style={{ color: "var(--theme-text-tone)" }}
                  >
                    Stay in this zone?
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {branchOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleBranchChoice(option)}
                        className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-white/10"
                        style={{ color: "var(--theme-text-tone)" }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <ZoneRenderer
                  profile={zoneProfile}
                  data={zoneData}
                  onPlayHero={handlePlayHero}
                  onSelectClusterVideo={() => {}}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
