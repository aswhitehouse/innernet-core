/**
 * Simulated YouTube results for the Sovereign Portal.
 * No API calls; all data client-side. Intent → zone → hero + finite cluster.
 */

import type { MockVideo } from "@/lib/watchTypes";
import { MOCK_VIDEOS } from "@/lib/mockVideos";
import type { ZoneId } from "@/lib/zoneProfiles";

export interface YouTubePortalResult {
  hero: MockVideo;
  cluster: MockVideo[];
  branchOptions: string[];
}

/** Human-readable zone label for "Zone: …" in the UI */
export const ZONE_LABELS: Record<ZoneId, string> = {
  vintage: "Vintage Audio",
  ai: "AI & Machine Learning",
  calm: "Calm & Minimal",
  deep: "Deep Focus",
  music: "Music & Sound",
  restoration: "Restoration & DIY",
  default: "Explore",
};

/** Zone → hero index, cluster indices (4–6), and branch options. */
const ZONE_CONFIG: Record<
  ZoneId,
  { heroIndex: number; clusterIndices: number[]; branchOptions: string[] }
> = {
  vintage: {
    heroIndex: 0,
    clusterIndices: [1, 5, 6, 8, 2],
    branchOptions: [
      "Stay in this zone?",
      "Go deeper into tube amplifiers?",
      "Shift toward restoration builds?",
      "Take another direction?",
    ],
  },
  ai: {
    heroIndex: 1,
    clusterIndices: [0, 5, 8, 4, 3],
    branchOptions: [
      "Stay in this zone?",
      "Explore ethics and policy",
      "Shift to practical tools",
      "Take another direction?",
    ],
  },
  calm: {
    heroIndex: 8,
    clusterIndices: [0, 4, 5, 6, 1],
    branchOptions: [
      "Stay in this zone?",
      "Go deeper into minimal systems",
      "Explore ambient sound",
      "Take another direction?",
    ],
  },
  deep: {
    heroIndex: 4,
    clusterIndices: [0, 1, 5, 8, 3],
    branchOptions: [
      "Stay in this zone?",
      "Go deeper into focus",
      "Shift to research methods",
      "Take another direction?",
    ],
  },
  music: {
    heroIndex: 6,
    clusterIndices: [8, 0, 5, 1, 4],
    branchOptions: [
      "Stay in this zone?",
      "Explore music production",
      "Shift to culture and design",
      "Take another direction?",
    ],
  },
  restoration: {
    heroIndex: 2,
    clusterIndices: [8, 4, 0, 5, 1],
    branchOptions: [
      "Stay in this zone?",
      "Go deeper into restoration",
      "Shift toward vintage audio",
      "Take another direction?",
    ],
  },
  default: {
    heroIndex: 0,
    clusterIndices: [1, 4, 5, 8, 6],
    branchOptions: [
      "Stay in this zone?",
      "Go deeper",
      "Explore adjacent ideas",
      "Take another direction?",
    ],
  },
};

/**
 * Simulated: get hero + cluster + branch options for a zone.
 * Used after intent interpretation and when user picks a branch.
 */
export function getYouTubeResults(zoneId: ZoneId): YouTubePortalResult {
  const config = ZONE_CONFIG[zoneId];
  const hero = MOCK_VIDEOS[config.heroIndex];
  const cluster = config.clusterIndices.map((i) => MOCK_VIDEOS[i]);
  return {
    hero,
    cluster,
    branchOptions: config.branchOptions,
  };
}
