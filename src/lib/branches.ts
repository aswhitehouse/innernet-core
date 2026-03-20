/**
 * Branch generation for Generative Journey (Phase 1, no LLM).
 * From 10 search results: pick 3 representative videos, build 3 branch cards.
 * Each branch: short title (2–4 words), one-sentence description, one thumbnail.
 */

import type { PortalVideo } from "./portalVideo";

export interface JourneyBranch {
  title: string;
  description: string;
  video: PortalVideo;
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "how", "why", "what", "when", "where", "best", "top", "vs", "versus", "official", "video", "channel", "full", "new", "2024", "2023",
]);

/** Take first 2–4 meaningful words from a title for branch label. */
function titleToShortLabel(title: string): string {
  const words = title
    .replace(/[^\w\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w.toLowerCase()));
  const take = Math.min(4, Math.max(2, words.length));
  const label = words.slice(0, take).join(" ");
  return label || "This direction";
}

/** Curated branch description: theme + core topic. No YouTube title copy. */
function curatedDescription(theme: string, coreTopic: string): string {
  const topic = coreTopic.trim().toLowerCase();
  const t = theme.trim();
  if (!t) return "In this direction, we explore how it relates to the current thread.";
  if (!topic) return `In this direction, we explore ${t}.`;
  return `In this direction, we explore ${t} and how it relates to ${topic}.`;
}

/**
 * From up to 10 videos, produce 3 branch cards.
 * coreTopic: current intent/theme for curated descriptions (no YouTube title).
 */
export function generateBranches(videos: PortalVideo[], coreTopic: string): JourneyBranch[] {
  if (videos.length === 0) return [];

  // Pick representative branch cards that best match the user's current thread.
  // This avoids “random” unrelated videos (e.g. gaming) being chosen just because of fixed indices.
  const coreKeywords = coreTopic
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const negativeKeywords = ["minecraft", "roblox", "fortnite", "twitch", "gaming"];

  const scored = videos.map((v, idx) => {
    const t = (v.title || "").toLowerCase();
    let score = 0;

    if (negativeKeywords.some((k) => t.includes(k))) {
      score -= 1000;
    }

    for (const k of coreKeywords) {
      if (k && t.includes(k)) score += 1;
    }

    // Slightly prefer earlier results to keep a stable “feel” when scores tie.
    score -= idx * 0.01;
    return { v, idx, score };
  });

  const topCount = Math.min(3, scored.length);
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, topCount).map((s) => s.v);

  // If the thread keywords are empty (rare), just avoid obvious “off-topic” matches.
  if (coreKeywords.length === 0) {
    const filtered = videos.filter((v) => {
      const t = (v.title || "").toLowerCase();
      return !negativeKeywords.some((k) => t.includes(k));
    });
    const picked = filtered.slice(0, topCount);
    if (picked.length > 0) {
      return picked.map((video) => {
        const title = titleToShortLabel(video.title);
        return {
          title,
          description: curatedDescription(title, coreTopic),
          video,
        };
      });
    }
  }

  // Build branch cards from the “best match” videos.
  return top.map((video) => {
    const title = titleToShortLabel(video.title);
    return {
      title,
      description: curatedDescription(title, coreTopic),
      video,
    };
  });
}
