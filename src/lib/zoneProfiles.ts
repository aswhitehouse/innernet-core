/**
 * Simulated generative interpretation: user intent → zone profile.
 * Keywords map to zone; zone drives accent, gradient, density, motion.
 * All logic client-side, mocked.
 */

import type { MockVideo } from "@/lib/watchTypes";

export type ZoneId =
  | "vintage"
  | "ai"
  | "calm"
  | "deep"
  | "music"
  | "restoration"
  | "default";

export interface ZoneProfile {
  id: ZoneId;
  accent: string;
  gradient: string;
  /** Layout: "soft" | "balanced" | "dense" */
  density: "soft" | "balanced" | "dense";
  /** Motion: "slow" | "normal" | "sharp" */
  motion: "slow" | "normal" | "sharp";
  /** Optional glow tint for transition */
  glowTint: string;
}

const ZONE_PROFILES: Record<ZoneId, ZoneProfile> = {
  vintage: {
    id: "vintage",
    accent: "#b89870",
    gradient:
      "linear-gradient(165deg, #1c1916 0%, #242018 40%, #2a261e 100%)",
    density: "soft",
    motion: "slow",
    glowTint: "rgba(184,152,112,0.12)",
  },
  ai: {
    id: "ai",
    accent: "#6b9dc4",
    gradient:
      "linear-gradient(165deg, #141a20 0%, #1a2228 45%, #202830 100%)",
    density: "dense",
    motion: "sharp",
    glowTint: "rgba(107,157,196,0.15)",
  },
  calm: {
    id: "calm",
    accent: "#8a9b88",
    gradient:
      "linear-gradient(165deg, #161c18 0%, #1e2420 50%, #242a26 100%)",
    density: "soft",
    motion: "slow",
    glowTint: "rgba(138,155,136,0.1)",
  },
  deep: {
    id: "deep",
    accent: "#7a6b9a",
    gradient:
      "linear-gradient(165deg, #16151c 0%, #1e1c26 45%, #252330 100%)",
    density: "dense",
    motion: "normal",
    glowTint: "rgba(122,107,154,0.12)",
  },
  music: {
    id: "music",
    accent: "#a87a8a",
    gradient:
      "linear-gradient(165deg, #1a1618 0%, #221c1e 45%, #2a2426 100%)",
    density: "balanced",
    motion: "normal",
    glowTint: "rgba(168,122,138,0.12)",
  },
  restoration: {
    id: "restoration",
    accent: "#8b9c6a",
    gradient:
      "linear-gradient(165deg, #181c16 0%, #202418 45%, #282c20 100%)",
    density: "balanced",
    motion: "slow",
    glowTint: "rgba(139,156,106,0.1)",
  },
  default: {
    id: "default",
    accent: "#8b7cb8",
    gradient:
      "linear-gradient(165deg, #16151c 0%, #1c1b24 35%, #222028 100%)",
    density: "balanced",
    motion: "normal",
    glowTint: "rgba(139,124,184,0.12)",
  },
};

/** Keyword → zone (order matters: first match wins for tone) */
const KEYWORD_ZONE: { keywords: string[]; zone: ZoneId }[] = [
  { keywords: ["vintage", "retro", "old", "nostalgic", "analog"], zone: "vintage" },
  { keywords: ["audio", "amp", "amps", "speaker", "hi-fi", "hifi"], zone: "vintage" },
  { keywords: ["ai", "machine learning", "neural", "llm", "generative"], zone: "ai" },
  { keywords: ["calm", "peaceful", "quiet", "meditation", "slow"], zone: "calm" },
  { keywords: ["deep", "focused", "concentrate", "dive", "thorough"], zone: "deep" },
  { keywords: ["music", "song", "album", "listen", "jazz", "ambient"], zone: "music" },
  { keywords: ["restoration", "restore", "repair", "rebuild", "fix"], zone: "restoration" },
  { keywords: ["build", "diy", "maker"], zone: "restoration" },
];

/**
 * Simulated: interpret natural language intent and return a zone profile.
 * Parses input for keywords; maps to zone; returns profile for UI morphing.
 */
export function interpretIntent(input: string): ZoneProfile {
  const normalized = input.toLowerCase().trim();
  if (!normalized) return ZONE_PROFILES.default;

  for (const { keywords, zone } of KEYWORD_ZONE) {
    if (keywords.some((k) => normalized.includes(k))) {
      return ZONE_PROFILES[zone];
    }
  }

  return ZONE_PROFILES.default;
}

export function getZoneProfile(zoneId: ZoneId): ZoneProfile {
  return ZONE_PROFILES[zoneId];
}
