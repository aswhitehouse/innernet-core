# My Innernet

A personal **digital habitat** — a calm, adaptive homepage that serves as the entry point to your online experience. Not a dashboard, not a feed reader, not a chatbot. A single-page space that adapts to time of day and a mock “weather” mood.

## What this is (V1 + V2 Watch)

- **Single-page app**: One view, no routes. Tracks open in-place in the central “Cognitive Canvas.”
- **Four tracks**: Research, News, **Watch (Gen UX)**, Reflect. Watch is the primary focus; others are placeholders.
- **Theme engine**: Time of day + mock weather; state is React + `localStorage`.
- **V2 Watch**: Intent-led video experience. Choose mode (Learn, Deep Dive, Stay Informed, Be Inspired, Wind Down, Light Browse). Layout morphs per intent. Videos show Emotional Intensity, Signal Score, Drift Risk. High-intensity clicks open a transparency prompt. Session trend after 2–3 clicks.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### YouTube search (Watch portal)

The Watch portal uses the YouTube Data API v3 for real search. To enable it locally:

1. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```
2. Get an API key from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (enable **YouTube Data API v3** for your project).
3. Put the key in `.env.local`:
   ```
   YOUTUBE_API_KEY=your_actual_key_here
   ```
4. Restart the dev server (`npm run dev`).

`.env.local` is gitignored; your key stays on your machine. On Vercel, add `YOUTUBE_API_KEY` in the project’s Environment Variables.

## Deploy to Vercel

1. Push the repo to GitHub (or connect your existing repo in Vercel).
2. In [Vercel](https://vercel.com): **Add New Project** → import the repo.
3. Leave build settings as default (Next.js is auto-detected):
   - **Build Command**: `next build`
   - **Output Directory**: (default)
   - **Install Command**: `npm install`
4. Deploy. The app is client-side and static-friendly; no env vars required.

Or from the CLI:

```bash
npm i -g vercel
vercel
```

Follow the prompts and deploy.

## Project structure

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── CentralPane.tsx       # Watch → WatchExperience
│   ├── Tile.tsx
│   ├── WeatherToggle.tsx
│   ├── tracks/
│   │   ├── ResearchTrack.tsx, NewsTrack.tsx, ReflectTrack.tsx, TilePreviews.tsx
│   └── watch/               # Gen UX Watch (V2)
│       ├── WatchExperience.tsx
│       ├── IntentSelector.tsx
│       ├── VideoCard.tsx
│       ├── ModeLayoutRenderer.tsx
│       └── DriftConfirmDialog.tsx
├── contexts/ThemeContext.tsx
├── data/mockVideos.ts
└── lib/
    ├── theme.ts
    ├── watchTypes.ts
    └── watchSession.ts
```

## Personalising your name

The welcome line is: **“Welcome, &lt;Name&gt;. Where should we go today?”**

To set your name for the session (no UI in V1), in the browser console:

```js
localStorage.setItem('innernet-name', 'Your Name');
location.reload();
```

## Tech stack

- **Next.js** (App Router), **TypeScript**, **Tailwind CSS**
- **Client-only** for V1; no server actions or API routes required for this prototype.

---

V1 is an experiential prototype: the goal is whether it *feels* like a digital home and whether time-of-day and weather toggles feel grounding. Iterate from here.
