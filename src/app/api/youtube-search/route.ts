import { NextRequest, NextResponse } from "next/server";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export interface YouTubeSearchItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
}

interface YouTubeApiSnippet {
  title?: string;
  channelTitle?: string;
  thumbnails?: {
    high?: { url: string };
    medium?: { url: string };
    default?: { url: string };
  };
}

interface YouTubeApiSearchItem {
  id?: { videoId?: string };
  snippet?: YouTubeApiSnippet;
}

/** Parse ISO 8601 duration (e.g. PT1M30S, PT15S) to seconds */
function parseDurationToSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return 0;
  const h = parseInt(match[1] || "0", 10);
  const m = parseInt(match[2] || "0", 10);
  const s = parseInt(match[3] || "0", 10);
  return h * 3600 + m * 60 + s;
}

const SHORTS_MAX_SECONDS = 60; // Filter out Shorts (≤60s)

/** GET /api/youtube-search?q=... — server-only, API key never exposed. Excludes Shorts. */
export async function GET(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YouTube API key not configured" },
      { status: 503 }
    );
  }

  const q = request.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json(
      { error: "Missing or empty query parameter q" },
      { status: 400 }
    );
  }

  try {
    const searchRes = await fetch(
      `${YOUTUBE_API_BASE}/search?part=snippet&type=video&maxResults=15&q=${encodeURIComponent(q.trim())}&key=${apiKey}`
    );
    if (!searchRes.ok) {
      const err = await searchRes.text();
      return NextResponse.json(
        { error: "YouTube API error", details: err },
        { status: searchRes.status }
      );
    }
    const searchData = await searchRes.json();
    const rawItems: YouTubeApiSearchItem[] = searchData.items || [];
    const withIds = rawItems.filter((i) => i.id?.videoId);
    if (withIds.length === 0) return NextResponse.json([]);

    const videoIds = withIds.map((i) => i.id!.videoId!);
    const listRes = await fetch(
      `${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoIds.join(",")}&key=${apiKey}`
    );
    if (!listRes.ok) {
      const err = await listRes.text();
      return NextResponse.json(
        { error: "YouTube API error", details: err },
        { status: listRes.status }
      );
    }
    const listData = await listRes.json();
    const durationById: Record<string, number> = {};
    const definitionById: Record<string, boolean> = {};
    for (const v of listData.items || []) {
      const id = v.id;
      const dur = v.contentDetails?.duration;
      if (id && dur) durationById[id] = parseDurationToSeconds(dur);
      if (id) definitionById[id] = v.contentDetails?.definition === "hd";
    }

    const nonShorts = withIds.filter((i) => {
      const sec = durationById[i.id!.videoId!];
      return sec > SHORTS_MAX_SECONDS;
    });

    // Prefer HD for hero and branches; don't hard-filter, just sort HD first
    nonShorts.sort((a, b) => {
      const aHd = definitionById[a.id!.videoId!] ?? false;
      const bHd = definitionById[b.id!.videoId!] ?? false;
      if (aHd && !bHd) return -1;
      if (!aHd && bHd) return 1;
      return 0;
    });

    const items: YouTubeSearchItem[] = nonShorts.slice(0, 10).map((i) => {
      const vid = i.id!.videoId!;
      const thumb = i.snippet?.thumbnails;
      const thumbnailUrl =
        thumb?.high?.url ||
        thumb?.medium?.url ||
        thumb?.default?.url ||
        `https://img.youtube.com/vi/${vid}/default.jpg`;
      return {
        videoId: vid,
        title: i.snippet?.title || "",
        thumbnailUrl,
        channelTitle: i.snippet?.channelTitle || "",
      };
    });

    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json(
      { error: "Search failed", details: String(e) },
      { status: 500 }
    );
  }
}
