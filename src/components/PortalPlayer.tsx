"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  buildEmbedUrl,
  sendCommand,
  sendListening,
  parseYouTubeMessage,
  YT_STATE,
} from "@/lib/youtubePlayer";

const BLACK_MS = 200;
const FADE_UP_MS = 350;
const PROGRESS_POLL_MS = 250;
/** Hide controls after idle; tap video area to show again (all devices) */
const CONTROLS_AUTO_HIDE_MS = 2500;

interface PortalPlayerProps {
  youtubeId: string;
  title: string;
  thumbnailUrl?: string;
  onExit: () => void;
}

/**
 * Sovereign portal player: custom play surface → fade to black → YT iframe (minimal chrome) → custom controls.
 * Uses plain iframe + postMessage only (no YouTube IFrame API script) to avoid localhost postMessage errors.
 */
export function PortalPlayer({ youtubeId, title, thumbnailUrl, onExit }: PortalPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Start at fade-to-black so the hero click is the single intentional gesture.
  const [viewPhase, setViewPhase] = useState<"toBlack" | "loading" | "playing">("toBlack");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullViewport, setFullViewport] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef = useRef(false);
  const durationRef = useRef(0);
  isPlayingRef.current = isPlaying;
  durationRef.current = duration;

  useEffect(() => {
    if (viewPhase !== "toBlack") return;
    const t = setTimeout(() => setViewPhase("loading"), BLACK_MS);
    return () => clearTimeout(t);
  }, [viewPhase]);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent || "";
    const iOS = /iP(hone|od|ad)/.test(ua);
    setIsIOS(iOS);
  }, []);

  // When iframe loads, signal listening. On desktop we attempt muted autoplay;
  // on iOS we let the native red play button act as the main affordance.
  const onIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    sendListening(iframe);
    if (isIOS) {
      setViewPhase("playing");
      return;
    }
    // Non‑iOS: start muted, play, then gently unmute.
    sendCommand(iframe, "mute");
    sendCommand(iframe, "playVideo");
    setIsPlaying(true);
    setViewPhase("playing");
    window.setTimeout(() => {
      sendCommand(iframeRef.current, "unMute");
    }, 200);
  }, [isIOS]);

  // Listen for messages from YouTube embed (no widget script = no postMessage origin errors)
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const info = parseYouTubeMessage(event);
      if (!info) return;
      if (typeof info.currentTime === "number") setCurrentTime(info.currentTime);
      if (typeof info.duration === "number" && info.duration > 0) setDuration(info.duration);
      if (typeof info.playerState === "number") {
        const playing = info.playerState === YT_STATE.PLAYING;
        setIsPlaying(playing);
        if (info.playerState === YT_STATE.ENDED) setVideoEnded(true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Poll progress while playing (embed may not send frequent infoDelivery; we advance locally)
  useEffect(() => {
    if (viewPhase !== "playing") return;
    progressIntervalRef.current = setInterval(() => {
      setCurrentTime((t) => {
        if (isPlayingRef.current && durationRef.current > 0 && t < durationRef.current - 0.5) {
          return t + PROGRESS_POLL_MS / 1000;
        }
        return t;
      });
    }, PROGRESS_POLL_MS);
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [viewPhase]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      sendCommand(iframeRef.current, "pauseVideo");
      setIsPlaying(false);
    } else {
      sendCommand(iframeRef.current, "playVideo");
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seek = useCallback(
    (frac: number) => {
      if (!Number.isFinite(duration) || duration <= 0) return;
      const sec = frac * duration;
      sendCommand(iframeRef.current, "seekTo", [sec, true]);
      setCurrentTime(sec);
    },
    [duration]
  );

  const setVolumeLevel = useCallback((v: number) => {
    setVolume(v);
    sendCommand(iframeRef.current, "setVolume", [Math.round(v)]);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const useNativeFullscreen =
      typeof window !== "undefined" &&
      (typeof document.documentElement.requestFullscreen === "function" ||
        typeof (document.documentElement as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen === "function");
    const isMobileViewport =
      typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches;

    if (useNativeFullscreen && !isMobileViewport) {
      if (!document.fullscreenElement && !(document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
        const req = cont.requestFullscreen ?? (cont as HTMLElement & { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen;
        req?.call(cont);
        setIsFullscreen(true);
      } else {
        const exit = document.exitFullscreen ?? (document as Document & { webkitExitFullscreen?: () => void }).webkitExitFullscreen;
        exit?.call(document);
        setIsFullscreen(false);
      }
      return;
    }

    setFullViewport((v) => !v);
    setIsFullscreen((v) => !v);
  }, []);

  const handleReplay = useCallback(() => {
    sendCommand(iframeRef.current, "seekTo", [0, true]);
    sendCommand(iframeRef.current, "playVideo");
    setVideoEnded(false);
    setIsPlaying(true);
    setCurrentTime(0);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const fsEl = document.fullscreenElement ?? (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      setIsFullscreen(!!fsEl);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, []);

  const progressFrac = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  /** Chrome visible; on iOS keep always true so user isn’t stuck without tap target */
  const [controlsVisible, setControlsVisible] = useState(true);

  const clearControlsHideTimer = useCallback(() => {
    if (controlsHideTimerRef.current) {
      clearTimeout(controlsHideTimerRef.current);
      controlsHideTimerRef.current = null;
    }
  }, []);

  const scheduleControlsHide = useCallback(() => {
    if (videoEnded) return;
    clearControlsHideTimer();
    controlsHideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
      controlsHideTimerRef.current = null;
    }, CONTROLS_AUTO_HIDE_MS);
  }, [videoEnded, clearControlsHideTimer]);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    scheduleControlsHide();
  }, [scheduleControlsHide]);

  // When playback starts, show chrome briefly then auto-hide (all devices)
  useEffect(() => {
    if (viewPhase !== "playing" || videoEnded) {
      setControlsVisible(true);
      clearControlsHideTimer();
      return;
    }
    scheduleControlsHide();
    return clearControlsHideTimer;
  }, [viewPhase, videoEnded, scheduleControlsHide, clearControlsHideTimer]);

  const rootClassName = `relative overflow-hidden rounded-none bg-black shadow-2xl sm:rounded-2xl ${
    fullViewport ? "fixed inset-0 z-[9999] flex flex-col rounded-none" : ""
  }`;
  const rootStyle: React.CSSProperties = fullViewport
    ? {
        color: "var(--theme-text-tone)",
        height: "100dvh",
        width: "100%",
        minHeight: "100dvh",
      }
    : { color: "var(--theme-text-tone)" };

  const playerContent = (
    <div ref={containerRef} className={rootClassName} style={rootStyle}>
      {viewPhase === "toBlack" && (
        <div className="absolute inset-0 rounded-2xl bg-black aspect-video w-full" />
      )}

      {(viewPhase === "loading" || viewPhase === "playing") && (
        <div
          className={`relative w-full bg-black isolate ${
            fullViewport ? "flex-1 min-h-0" : "aspect-video"
          }`}
          style={fullViewport ? { flex: "1 1 0", minHeight: 0 } : undefined}
        >
          {/* Blur-zoomed video backdrop to soften hard black bars, especially for letterboxed sources */}
          {thumbnailUrl && (
            <div
              className="absolute inset-0 z-0 rounded-2xl"
              style={{
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(26px) saturate(1.05) brightness(0.55)",
                transform: "scale(1.08)",
              }}
              aria-hidden
            />
          )}
          <iframe
            ref={iframeRef}
            src={buildEmbedUrl(youtubeId, !isIOS)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 z-10 h-full w-full rounded-2xl"
            style={{
              // In fullscreen (`fullViewport`) force opacity to 1 so iOS Safari quirks
              // around load/resize can't leave us with a blank surface.
              opacity: viewPhase === "playing" || fullViewport ? 1 : 0,
              transition: `opacity ${FADE_UP_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
            onLoad={onIframeLoad}
          />
          {/* Desktop / non‑iOS: mask YouTube branding; on iOS let native UI be contextualised by the frame */}
          {!isIOS && (
            <div
              className="player-yt-mask absolute inset-0 z-20 rounded-2xl"
              aria-hidden
            />
          )}
          {/* Tap anywhere to show controls when hidden (all devices including iOS) */}
          {viewPhase === "playing" && !videoEnded && !controlsVisible && (
            <button
              type="button"
              aria-label="Show player controls"
              className="absolute inset-0 z-[25] cursor-pointer rounded-2xl bg-transparent"
              onClick={() => showControls()}
            />
          )}
          {viewPhase === "loading" && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/90 player-loading-shimmer"
              aria-hidden
            />
          )}
        </div>
      )}

      {/* When video ends, cover YouTube end screen with our own "what next?" prompt */}
      {videoEnded && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-2xl px-6 py-8"
          style={{
            background: "rgba(0,0,0,0.82)",
            color: "var(--theme-text-tone)",
          }}
        >
          <p className="text-center text-sm font-light opacity-90">
            What would you like to do next?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={handleReplay}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/15"
            >
              Replay
            </button>
            <button
              type="button"
              onClick={onExit}
              className="rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/15"
            >
              Zoom out — choose another direction
            </button>
          </div>
        </div>
      )}

      {viewPhase === "playing" && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2 rounded-b-2xl p-3 transition-opacity duration-300 ease-out ${
            controlsVisible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 60%, transparent)",
          }}
          onPointerDown={() => showControls()}
        >
          {/* Row 1: play, progress, time, fullscreen — fullscreen in first row so it’s always visible on narrow viewports (e.g. iPhone) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                togglePlay();
                showControls();
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <span className="text-base font-medium leading-none text-white/95">‖</span>
              ) : (
                <span
                  className="inline-block h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-white/95"
                  style={{ marginLeft: "3px" }}
                />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={progressFrac}
                onChange={(e) => {
                  seek(parseFloat(e.target.value));
                  showControls();
                }}
                onPointerDown={() => showControls()}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
            <span className="shrink-0 text-xs opacity-80">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <button
              type="button"
              onClick={() => {
                toggleFullscreen();
                showControls();
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-white/90 bg-white/95 text-black transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen — rotate for landscape"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <span className="text-sm font-bold leading-none" aria-hidden>
                {isFullscreen ? "✕" : "⛶"}
              </span>
            </button>
          </div>
          {/* Row 2: volume only */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => {
                setVolumeLevel(parseInt(e.target.value, 10));
                showControls();
              }}
              onPointerDown={() => showControls()}
              className="h-1 w-20 shrink-0 cursor-pointer appearance-none rounded-full bg-white/25 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              aria-label="Volume"
            />
          </div>
        </div>
      )}
    </div>
  );

  return playerContent;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
