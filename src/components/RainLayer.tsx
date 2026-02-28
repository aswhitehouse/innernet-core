"use client";

/**
 * Gentle rain streaks for rainy weather. Calm, window-view feel.
 */
export function RainLayer({ blurred = false }: { blurred?: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-[8] overflow-hidden ${blurred ? "rain-layer-blurred" : "opacity-70"}`}
      aria-hidden
    >
      <div className="rain-container">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="rain-streak"
            style={{
              left: `${(i * 7) % 100}%`,
              animationDelay: `${(i * 0.02) % 1.2}s`,
              animationDuration: `${0.8 + (i % 5) * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
