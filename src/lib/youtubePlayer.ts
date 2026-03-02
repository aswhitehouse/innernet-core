/**
 * YouTube embed via plain iframe + postMessage. No www-widgetapi.js (avoids localhost postMessage errors).
 * Builds embed URL and sends commands to the iframe; listen for message events for state.
 */

const YOUTUBE_ORIGIN = "https://www.youtube.com";

export function buildEmbedUrl(videoId: string, autoplay = false): string {
  const params = new URLSearchParams();
  params.set("enablejsapi", "1");
  params.set("autoplay", autoplay ? "1" : "0");
  params.set("controls", "0");
  params.set("disablekb", "1");
  params.set("fs", "0");
  params.set("modestbranding", "1");
  params.set("rel", "0");
  params.set("iv_load_policy", "3");
  params.set("playsinline", "1");
  params.set("color", "white");
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** Send a command to the YouTube embed iframe. Target origin must be https://www.youtube.com. */
export function sendCommand(
  iframe: HTMLIFrameElement | null,
  func: string,
  args: unknown[] = []
): void {
  if (!iframe?.contentWindow) return;
  const payload = JSON.stringify({
    event: "command",
    func,
    args: args.length ? args : "",
  });
  iframe.contentWindow.postMessage(payload, YOUTUBE_ORIGIN);
}

/** Tell the embed we're listening so it sends us events (infoDelivery etc.). */
export function sendListening(iframe: HTMLIFrameElement | null): void {
  if (!iframe?.contentWindow) return;
  const payload = JSON.stringify({
    event: "listening",
    id: 1,
    channel: "widget",
  });
  iframe.contentWindow.postMessage(payload, YOUTUBE_ORIGIN);
}

export const YOUTUBE_ORIGIN_FOR_LISTENER = YOUTUBE_ORIGIN;

/** Parse message event from YouTube embed; returns null if not from YouTube or not a known shape. */
export function parseYouTubeMessage(
  event: MessageEvent
): { currentTime?: number; duration?: number; playerState?: number } | null {
  if (event.origin !== YOUTUBE_ORIGIN || typeof event.data !== "string") return null;
  try {
    const data = JSON.parse(event.data);
    if (data.event === "infoDelivery" && data.info) {
      const info = data.info;
      return {
        currentTime: typeof info.currentTime === "number" ? info.currentTime : undefined,
        duration: typeof info.duration === "number" ? info.duration : undefined,
        playerState: typeof info.playerState === "number" ? info.playerState : undefined,
      };
    }
    if (data.event === "onStateChange" && typeof data.info === "number") {
      return { playerState: data.info };
    }
    return null;
  } catch {
    return null;
  }
}

/** YouTube player state constants (for postMessage events) */
export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;
