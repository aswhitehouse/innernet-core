"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { PortalVideo } from "@/lib/portalVideo";
import { searchItemToPortalVideo } from "@/lib/portalVideo";
import { generateIntentReflection, getBranchTransitionSentence, getInterludePrimaryFromIntent, getInterludeSecondaryFromIntent, getInterludePrimaryFromBranch, getInterludeSecondaryFromBranch } from "@/lib/framing";
import { generateBranches, type JourneyBranch } from "@/lib/branches";
import { IntentInput } from "./IntentInput";
import { HeroVideo } from "./HeroVideo";
import { PortalPlayer } from "./PortalPlayer";
import { JourneyBranchCard } from "./JourneyBranchCard";
import { DirectionalInterlude } from "./DirectionalInterlude";

type Phase = "idle" | "loading" | "interlude" | "framing" | "branching" | "playing" | "morphing";

const PORTAL_PLACEHOLDER = "Render a new direction";
const FORMING_HERO_MS = 600;
const FORMING_REFLECTION_MS = 1100;
const FORMING_BRANCH_MS = 1500;
const FORMING_DONE_MS = 1800;
const MORPH_EXIT_MS = 450;
const MORPH_ENTER_MS = 500;
const MAX_BREADCRUMBS = 2;

interface SovereignWatchPortalProps {
  onCollapse?: () => void;
}

export function SovereignWatchPortal({ onCollapse }: SovereignWatchPortalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [intentText, setIntentText] = useState("");
  const [reflection, setReflection] = useState("");
  const [currentTopic, setCurrentTopic] = useState("");
  const [reflectionStack, setReflectionStack] = useState<string[]>([]);
  const [hero, setHero] = useState<PortalVideo | null>(null);
  const [allVideos, setAllVideos] = useState<PortalVideo[]>([]);
  const [branches, setBranches] = useState<JourneyBranch[]>([]);
  const [playingVideo, setPlayingVideo] = useState<PortalVideo | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [branchLoading, setBranchLoading] = useState(false);
  const [phaseBeforePlay, setPhaseBeforePlay] = useState<Phase>("framing");
  const [flowForming, setFlowForming] = useState(false);
  const [heroRevealed, setHeroRevealed] = useState(false);
  const [reflectionRevealed, setReflectionRevealed] = useState(false);
  const [branchRevealed, setBranchRevealed] = useState(false);
  const [morphStep, setMorphStep] = useState<"exit" | "enter" | null>(null);
  const [pendingBranch, setPendingBranch] = useState<JourneyBranch | null>(null);
  const [interludePrimary, setInterludePrimary] = useState("");
  const [interludeSecondary, setInterludeSecondary] = useState("");
  const [interludeMode, setInterludeMode] = useState<"intent" | "branch" | null>(null);
  const [pendingBranchForMorph, setPendingBranchForMorph] = useState<JourneyBranch | null>(null);
  const [stayingInZone, setStayingInZone] = useState(false);
  const formingTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const morphTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const isIdle = phase === "idle";

  useEffect(() => {
    if (phase !== "framing" || !flowForming) return;
    formingTimers.current.push(
      setTimeout(() => setHeroRevealed(true), FORMING_HERO_MS),
      setTimeout(() => setReflectionRevealed(true), FORMING_REFLECTION_MS),
      setTimeout(() => setBranchRevealed(true), FORMING_BRANCH_MS),
      setTimeout(() => setFlowForming(false), FORMING_DONE_MS)
    );
    return () => {
      formingTimers.current.forEach(clearTimeout);
      formingTimers.current = [];
    };
  }, [phase, flowForming]);

  useEffect(() => {
    return () => {
      morphTimers.current.forEach(clearTimeout);
      morphTimers.current = [];
    };
  }, []);

  const fetchSearch = useCallback(async (q: string): Promise<PortalVideo[]> => {
    const res = await fetch(`/api/youtube-search?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Search failed");
    }
    const items: Array<{ videoId: string; title: string; thumbnailUrl: string; channelTitle: string }> = await res.json();
    return items.map(searchItemToPortalVideo);
  }, []);

  const handleSubmitIntent = useCallback(async () => {
    const text = intentText.trim();
    if (!text) return;

    setSearchError(null);
    setPhase("loading");

    try {
      const videos = await fetchSearch(text);
      if (videos.length === 0) {
        setSearchError("No results");
        setPhase("idle");
        return;
      }
      setReflection(generateIntentReflection(text));
      setCurrentTopic(text);
      setHero(videos[0]);
      setAllVideos(videos);
      setBranches([]);
      setReflectionStack([]);
      setInterludePrimary(getInterludePrimaryFromIntent(text));
      setInterludeSecondary(getInterludeSecondaryFromIntent(text));
      setInterludeMode("intent");
      setStayingInZone(false);
      setFlowForming(false);
      setHeroRevealed(false);
      setReflectionRevealed(false);
      setBranchRevealed(false);
      setPhase("interlude");
    } catch {
      setSearchError("Search failed");
      setPhase("idle");
    }
  }, [intentText, fetchSearch]);

  const handleStayInZone = useCallback(() => {
    setStayingInZone(true);
  }, []);

  const handleInterludeComplete = useCallback(() => {
    if (interludeMode === "intent") {
      setPhase("framing");
      setFlowForming(true);
      setHeroRevealed(false);
      setReflectionRevealed(false);
      setBranchRevealed(false);
      setInterludeMode(null);
    } else if (interludeMode === "branch" && pendingBranchForMorph) {
      const branch = pendingBranchForMorph;
      setPhase("morphing");
      setMorphStep("exit");
      setPendingBranch(branch);
      setBranchLoading(true);
      setInterludeMode(null);
      setPendingBranchForMorph(null);

      const applyMorph = (videos: PortalVideo[]) => {
        const nextBranches = generateBranches(videos, branch.title);
        setReflectionStack((prev) => {
          const next = [reflection, ...prev].slice(0, MAX_BREADCRUMBS);
          return next;
        });
        setReflection(generateIntentReflection(branch.title));
        setCurrentTopic(branch.title);
        setHero(branch.video);
        setAllVideos(videos);
        setBranches(nextBranches);
        setMorphStep("enter");
        setPendingBranch(null);
        morphTimers.current.push(
          setTimeout(() => {
            setBranchLoading(false);
            setPhase("branching");
            setMorphStep(null);
          }, MORPH_ENTER_MS)
        );
      };

      morphTimers.current.push(
        setTimeout(async () => {
          try {
            const videos = await fetchSearch(branch.title);
            if (videos.length > 0) applyMorph(videos);
            else applyMorph(allVideos);
          } catch {
            applyMorph(allVideos);
          }
        }, MORPH_EXIT_MS)
      );
    }
  }, [interludeMode, pendingBranchForMorph, reflection, fetchSearch, allVideos]);

  const handleBranchOutward = useCallback(() => {
    const next = generateBranches(allVideos, currentTopic);
    setBranches(next);
    setPhase("branching");
  }, [allVideos, currentTopic]);

  const handleBranchSelect = useCallback((branch: JourneyBranch) => {
    setInterludePrimary(getInterludePrimaryFromBranch(branch.title));
    setInterludeSecondary(getInterludeSecondaryFromBranch(branch.title));
    setInterludeMode("branch");
    setPendingBranchForMorph(branch);
    setPhase("interlude");
  }, []);

  const handlePlayHero = useCallback(() => {
    if (hero) {
      setPhaseBeforePlay(phase);
      setPlayingVideo(hero);
      setPhase("playing");
    }
  }, [hero, phase]);

  const handleExitPlayer = useCallback(() => {
    setPlayingVideo(null);
    setPhase(phaseBeforePlay);
  }, [phaseBeforePlay]);

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* Prompt bar at top */}
      <div
        className={`flex shrink-0 flex-col items-center px-4 ${
          isIdle ? "flex-1 justify-center py-12" : "pt-4 pb-2"
        }`}
      >
        <IntentInput
          variant={isIdle ? "idle" : "anchored"}
          value={intentText}
          onChange={setIntentText}
          onSubmit={handleSubmitIntent}
          disabled={phase === "loading"}
          interpreting={phase === "loading"}
          placeholder={PORTAL_PLACEHOLDER}
        />
        {searchError && (
          <p className="mt-2 text-center text-xs text-red-300/90">
            {searchError}
          </p>
        )}
      </div>

      {phase === "loading" && (
        <div className="flex flex-1 min-h-[120px]" aria-hidden />
      )}

      {/* Framing / Branching / Morphing / Interlude: stable container */}
      {(phase === "framing" || phase === "branching" || phase === "morphing" || phase === "interlude") && hero && (
        <div className="relative flex flex-1 flex-col gap-8 min-h-0 overflow-y-auto px-4 pb-12 pt-2">
          {/* Directional interlude overlay — covers content during intent or branch declaration */}
          {phase === "interlude" && (
            <DirectionalInterlude
              primary={interludePrimary}
              secondary={interludeSecondary}
              onComplete={handleInterludeComplete}
            />
          )}

          {/* Main content: hidden during interlude so overlay owns the frame */}
          {phase !== "interlude" && (
            <>
              {/* Breadcrumb stack: only when we have stack and not in exit */}
              {reflectionStack.length > 0 && morphStep !== "exit" && (
                <div className="flex flex-col gap-1">
                  {reflectionStack.map((line, i) => (
                    <p
                      key={i}
                      className="flow-breadcrumb-line text-center font-light"
                      style={{ color: "var(--theme-text-tone)" }}
                    >
                      {line}
                    </p>
                  ))}
                </div>
              )}

              {/* Hero first (interlude establishes hierarchy: hero secondary, then reflection, then branches) */}
              <div
                className={`flex flex-col gap-3 ${
                  morphStep === "exit"
                    ? "morph-hero-exit"
                    : morphStep === "enter"
                      ? "morph-hero-enter"
                      : flowForming
                        ? `flow-form-hero-wrap ${heroRevealed ? "flow-hero-revealed" : ""}`
                        : ""
                }`}
              >
                <p
                  className={`text-[10px] font-medium uppercase tracking-widest opacity-50 ${
                    morphStep === "enter" ? "" : flowForming && !heroRevealed ? "opacity-0" : ""
                  }`}
                  style={{ color: "var(--theme-text-tone)", fontVariant: "small-caps" }}
                >
                  First stop
                </p>
                <div className={morphStep === "enter" ? "" : flowForming && heroRevealed ? "flow-hero-in" : ""}>
                  <HeroVideo video={hero} onPlay={handlePlayHero} />
                </div>
              </div>

              {/* Reflection below hero — smaller, revealed after hero when forming */}
              {morphStep === "exit" ? (
                <p
                  className="morph-reflection-to-breadcrumb text-center font-light"
                  style={{ color: "var(--theme-text-tone)" }}
                >
                  {reflection}
                </p>
              ) : morphStep === "enter" ? (
                <p
                  className="flow-reflection-in text-center text-xs font-light opacity-90"
                  style={{ color: "var(--theme-text-tone)" }}
                >
                  {reflection}
                </p>
              ) : flowForming ? (
                reflectionRevealed && (
                  <p
                    className="flow-reflection-in text-center text-xs font-light opacity-90"
                    style={{ color: "var(--theme-text-tone)" }}
                  >
                    {reflection}
                  </p>
                )
              ) : (
                <p
                  className="text-center text-xs font-light opacity-90"
                  style={{ color: "var(--theme-text-tone)" }}
                >
                  {reflection}
                </p>
              )}

              {/* Framing: two options — or, after "Stay", a single Explore directions link */}
              {phase === "framing" && (branchRevealed || !flowForming) && (
                <div
                  className={flowForming && !branchRevealed ? "opacity-0" : "flow-branch-in"}
                  style={{ animationDelay: flowForming ? "0ms" : undefined }}
                >
                  {stayingInZone ? (
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        type="button"
                        onClick={handleBranchOutward}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                        style={{ color: "var(--theme-text-tone)" }}
                      >
                        Explore directions
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap justify-center gap-4">
                      <button
                        type="button"
                        onClick={handleStayInZone}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                        style={{ color: "var(--theme-text-tone)" }}
                      >
                        Stay in this zone
                      </button>
                      <button
                        type="button"
                        onClick={handleBranchOutward}
                        className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                        style={{ color: "var(--theme-text-tone)" }}
                      >
                        Branch outward
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Branching / Morphing: transition sentence + cards */}
              {(phase === "branching" || phase === "morphing") && (
                <>
                  <p
                    className={`text-center text-sm font-light opacity-80 ${
                      morphStep === "enter" ? "flow-branch-in" : ""
                    }`}
                    style={{ color: "var(--theme-text-tone)" }}
                  >
                    {getBranchTransitionSentence(currentTopic)}
                  </p>
                  {morphStep === "enter" ? (
                    <div className="grid gap-6 sm:grid-cols-3">
                      {branches.map((branch, i) => (
                        <JourneyBranchCard
                          key={branch.video.id}
                          branch={branch}
                          index={i}
                          onSelect={() => handleBranchSelect(branch)}
                          className="morph-cards-enter"
                          style={{ animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-3">
                      {branches.map((branch, i) => (
                        <JourneyBranchCard
                          key={branch.video.id}
                          branch={branch}
                          index={i}
                          onSelect={() => handleBranchSelect(branch)}
                          className={morphStep === "exit" ? "morph-cards-exit" : "journey-fade-in"}
                          style={morphStep === "exit" ? undefined : { animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Playing: embed only; exit returns to framing or branching */}
      {phase === "playing" && playingVideo && (
        <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-12 pt-2">
          <PortalPlayer
            youtubeId={playingVideo.youtubeId}
            title={playingVideo.title}
            thumbnailUrl={playingVideo.thumbnailUrl}
            onExit={handleExitPlayer}
          />
        </div>
      )}
    </div>
  );
}
