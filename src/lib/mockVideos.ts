/**
 * Mock videos for Watch surface.
 * Real YouTube thumbnail URLs (static). No backend.
 */

import type { MockVideo } from "@/lib/watchTypes";

const THUMB = (id: string) =>
  `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

export const MOCK_VIDEOS: MockVideo[] = [
  {
    id: "v1",
    title: "Designing for calm technology",
    summary: "Principles for interfaces that inform without overwhelming.",
    topic: "Design",
    emotionalIntensity: 18,
    signalScore: 88,
    driftRisk: "Low",
    duration: "14 min",
    youtubeId: "M7lc1UVf-VE",
  },
  {
    id: "v2",
    title: "The future of local-first software",
    summary: "Offline-first, sync, and ownership of data.",
    topic: "Technology",
    emotionalIntensity: 22,
    signalScore: 92,
    driftRisk: "Low",
    duration: "22 min",
    youtubeId: "jNQXAC9IVRw",
  },
  {
    id: "v3",
    title: "Policy shifts and what they mean",
    summary: "A structured look at recent regulatory changes.",
    topic: "Politics",
    emotionalIntensity: 72,
    signalScore: 55,
    driftRisk: "High",
    duration: "18 min",
    youtubeId: "9bZkp7q19f0",
  },
  {
    id: "v4",
    title: "Climate data without the panic",
    summary: "Key metrics and trends, presented clearly.",
    topic: "Climate",
    emotionalIntensity: 35,
    signalScore: 78,
    driftRisk: "Low",
    duration: "11 min",
    youtubeId: "2Vv-BfVoq4g",
  },
  {
    id: "v5",
    title: "Deep work and ambient context",
    summary: "Balancing focus with awareness. Short, practical patterns.",
    topic: "Productivity",
    emotionalIntensity: 28,
    signalScore: 85,
    driftRisk: "Low",
    duration: "9 min",
    youtubeId: "OPf0YbXqDm0",
  },
  {
    id: "v6",
    title: "Why this design went viral",
    summary: "A calm walkthrough of a product launch and its design decisions.",
    topic: "Design",
    emotionalIntensity: 42,
    signalScore: 70,
    driftRisk: "Medium",
    duration: "16 min",
    youtubeId: "RgKAFK5djSk",
  },
  {
    id: "v7",
    title: "Cultural moments that stick",
    summary: "How certain ideas spread and why. Analytical, not sensational.",
    topic: "Culture",
    emotionalIntensity: 48,
    signalScore: 65,
    driftRisk: "Medium",
    duration: "20 min",
    youtubeId: "kJQP7kiw5Fk",
  },
  {
    id: "v8",
    title: "Breaking: commentary and reaction",
    summary: "Opinion and reaction to recent events.",
    topic: "Politics",
    emotionalIntensity: 85,
    signalScore: 38,
    driftRisk: "High",
    duration: "25 min",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: "v9",
    title: "Minimal systems for creative work",
    summary: "Tools and habits that support creativity without clutter.",
    topic: "Productivity",
    emotionalIntensity: 15,
    signalScore: 90,
    driftRisk: "Low",
    duration: "12 min",
    youtubeId: "y8Kyi0WNg40",
  },
];

/** First video is hero; rest are for rails */
export const HERO_VIDEO = MOCK_VIDEOS[0];
export const RAIL_VIDEOS = MOCK_VIDEOS.slice(1);
