"use client";

import { useEffect, useState } from "react";
import type { ZoneProfile } from "@/lib/zoneProfiles";

interface ZoneTransitionLayerProps {
  profile: ZoneProfile | null;
  /** Previous profile when morphing to new zone (gradient crossfade) */
  previousProfile?: ZoneProfile | null;
  /** Idle = true means prompt state; false means zone is visible */
  idle: boolean;
  /** When user focuses prompt in zone: dim the canvas */
  dimmed?: boolean;
}

/**
 * Handles visual morph: background gradient, accent, optional light sweep.
 * Crossfades between previous and current gradient when profile changes.
 */
export function ZoneTransitionLayer({
  profile,
  previousProfile,
  idle,
  dimmed = false,
}: ZoneTransitionLayerProps) {
  const [showPrevious, setShowPrevious] = useState(false);
  const [prevProfile, setPrevProfile] = useState<ZoneProfile | null>(null);

  useEffect(() => {
    if (previousProfile && profile && previousProfile.id !== profile.id) {
      setPrevProfile(previousProfile);
      setShowPrevious(true);
      const t = setTimeout(() => {
        setShowPrevious(false);
        setPrevProfile(null);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [previousProfile, profile]);

  return (
    <>
      {/* Previous gradient (crossfade out when morphing) — on top so it can fade to reveal current */}
      {prevProfile && showPrevious && (
        <div
          className="pointer-events-none fixed inset-0 -z-10 animate-gradient-fade-out"
          style={{
            background: prevProfile.gradient,
          }}
        />
      )}

      {/* Base zone gradient — visible when not idle */}
      {profile && (
        <div
          className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700 ease-out"
          style={{
            opacity: idle ? 0 : dimmed ? 0.6 : 1,
            background: profile.gradient,
          }}
        />
      )}

      {/* Subtle ambient glow when zone is active */}
      {profile && !idle && (
        <div
          className="pointer-events-none fixed inset-0 -z-[9] transition-opacity duration-500 ease-out"
          style={{
            opacity: dimmed ? 0.25 : 0.6,
            background: `radial-gradient(ellipse 80% 50% at 50% 30%, ${profile.glowTint} 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Dim overlay when prompt focused (surface preparing to morph) */}
      {dimmed && (
        <div
          className="pointer-events-none fixed inset-0 -z-[8] bg-black/30 transition-opacity duration-300"
          aria-hidden
        />
      )}
    </>
  );
}
