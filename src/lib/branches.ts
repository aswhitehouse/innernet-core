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
  const indices = [1, 4, 7].filter((i) => i < videos.length);
  if (indices.length === 0) {
    const v = videos[0];
    const title = titleToShortLabel(v.title);
    return [{ title, description: curatedDescription(title, coreTopic), video: v }];
  }
  return indices.map((i) => {
    const video = videos[i];
    const title = titleToShortLabel(video.title);
    return {
      title,
      description: curatedDescription(title, coreTopic),
      video,
    };
  });
}
