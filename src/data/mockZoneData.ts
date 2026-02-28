/**
 * Mock zone data: each zone has one hero and a finite cluster of 4–6 related videos.
 * No infinite scroll; clusters are fixed.
 */

import type { MockVideo } from "@/lib/watchTypes";
import { MOCK_VIDEOS } from "@/lib/mockVideos";
import type { ZoneId } from "@/lib/zoneProfiles";

export interface ZoneData {
  hero: MockVideo;
  cluster: MockVideo[];
  /** Branch options shown after "finish" — explicit evolution */
  branchOptions: string[];
}

/** Map zone → hero + cluster. Reuse MOCK_VIDEOS with different ordering per zone. */
const ZONE_VIDEOS: Record<ZoneId, { heroIndex: number; clusterIndices: number[]; branchOptions: string[] }> = {
  vintage: {
    heroIndex: 0,
    clusterIndices: [1, 5, 6, 8, 2],
    branchOptions: [
      "Go deeper into vintage amps",
      "Shift to restoration builds",
      "Explore tape and vinyl",
    ],
  },
  ai: {
    heroIndex: 1,
    clusterIndices: [0, 5, 8, 4, 3],
    branchOptions: [
      "Stay in this zone",
      "Explore ethics and policy",
      "Shift to practical tools",
    ],
  },
  calm: {
    heroIndex: 8,
    clusterIndices: [0, 4, 5, 6, 1],
    branchOptions: [
      "Stay in this zone",
      "Go deeper into minimal systems",
      "Explore ambient sound",
    ],
  },
  deep: {
    heroIndex: 4,
    clusterIndices: [0, 1, 5, 8, 3],
    branchOptions: [
      "Go deeper into focus",
      "Shift to research methods",
      "Explore adjacent ideas",
    ],
  },
  music: {
    heroIndex: 6,
    clusterIndices: [8, 0, 5, 1, 4],
    branchOptions: [
      "Stay in this zone",
      "Explore music production",
      "Shift to culture and design",
    ],
  },
  restoration: {
    heroIndex: 2,
    clusterIndices: [8, 4, 0, 5, 1],
    branchOptions: [
      "Go deeper into restoration",
      "Shift to vintage audio",
      "Explore DIY builds",
    ],
  },
  default: {
    heroIndex: 0,
    clusterIndices: [1, 4, 5, 8, 6],
    branchOptions: [
      "Stay in this zone",
      "Go deeper",
      "Explore adjacent ideas",
    ],
  },
};

export function getZoneData(zoneId: ZoneId): ZoneData {
  const config = ZONE_VIDEOS[zoneId];
  const hero = MOCK_VIDEOS[config.heroIndex];
  const cluster = config.clusterIndices.map((i) => MOCK_VIDEOS[i]);
  return {
    hero,
    cluster,
    branchOptions: config.branchOptions,
  };
}
