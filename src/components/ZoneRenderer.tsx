"use client";

import type { MockVideo } from "@/lib/watchTypes";
import type { ZoneProfile } from "@/lib/zoneProfiles";
import type { ZoneData } from "@/data/mockZoneData";
import { HeroZoneVideo } from "./HeroZoneVideo";
import { ZoneCluster } from "./ZoneCluster";

interface ZoneRendererProps {
  profile: ZoneProfile;
  data: ZoneData;
  onPlayHero: () => void;
  onSelectClusterVideo: (video: MockVideo) => void;
}

/**
 * Renders the zone experience: one hero + finite cluster of 4–6 supporting videos.
 * No infinite scroll; structured cluster only.
 */
export function ZoneRenderer({
  profile,
  data,
  onPlayHero,
  onSelectClusterVideo,
}: ZoneRendererProps) {
  return (
    <div className="flex flex-col gap-10">
      <div onClick={onPlayHero} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onPlayHero()}>
        <HeroZoneVideo video={data.hero} profile={profile} delayMs={0} />
      </div>
      <ZoneCluster
        videos={data.cluster}
        profile={profile}
        onSelect={onSelectClusterVideo}
      />
    </div>
  );
}
