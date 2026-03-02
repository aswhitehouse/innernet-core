/**
 * Minimal video shape for sovereign YouTube portal.
 * API returns this; hero/cluster components accept it.
 */
export interface PortalVideo {
  id: string;
  youtubeId: string;
  title: string;
  duration?: string;
  thumbnailUrl?: string;
  channelTitle?: string;
}

export function searchItemToPortalVideo(item: {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}): PortalVideo {
  return {
    id: item.videoId,
    youtubeId: item.videoId,
    title: item.title,
    duration: "—",
    thumbnailUrl: item.thumbnailUrl,
    channelTitle: item.channelTitle,
  };
}
