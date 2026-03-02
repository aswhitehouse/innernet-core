"use client";

import { useEffect, useRef, useState } from "react";

const INTERLUDE_ENTER_MS = 300;
const INTERLUDE_HOLD_MS = 1000;
const INTERLUDE_EXIT_MS = 400;

interface DirectionalInterludeProps {
  primary: string;
  secondary: string;
  onComplete: () => void;
}

/**
 * Full-width overlay over main content. Declares direction before hero reveal.
 * Fade in 300ms, scale 0.98→1, hold ~1s, fade out 400ms. No spinner, no "thinking".
 */
export function DirectionalInterlude({ primary, secondary, onComplete }: DirectionalInterludeProps) {
  const [phase, setPhase] = useState<"entering" | "holding" | "exiting">("entering");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.push(
      setTimeout(() => setPhase("holding"), INTERLUDE_ENTER_MS),
      setTimeout(() => setPhase("exiting"), INTERLUDE_ENTER_MS + INTERLUDE_HOLD_MS),
      setTimeout(() => onComplete(), INTERLUDE_ENTER_MS + INTERLUDE_HOLD_MS + INTERLUDE_EXIT_MS)
    );
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [onComplete]);

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(3px)",
        WebkitBackdropFilter: "blur(3px)",
      }}
      aria-live="polite"
      aria-label={`Direction: ${primary}`}
    >
      <div
        className={
          phase === "entering"
            ? "interlude-enter"
            : phase === "exiting"
              ? "interlude-exit"
              : ""
        }
        style={{ color: "var(--theme-text-tone)" }}
      >
        <p className="interlude-primary">{primary}</p>
        <p className="interlude-secondary">{secondary}</p>
      </div>
    </div>
  );
}
