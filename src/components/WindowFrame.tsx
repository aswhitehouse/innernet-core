"use client";

/**
 * Subtle vignette + reflection so the background feels like looking through glass.
 */
export function WindowFrame() {
  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-[7] opacity-40"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 100% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.12) 100%),
            linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.06) 100%)
          `,
        }}
      />
    </>
  );
}
