"use client";

/**
 * Slow-drifting, puffy clouds for cloudy weather.
 * Each cloud is built from overlapping circles (box-shadow) for a cumulus look.
 */
export function CloudLayer({ blurred = false }: { blurred?: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-[8] overflow-hidden ${blurred ? "cloud-layer-blurred" : "opacity-90"}`}
      aria-hidden
    >
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
      <div className="cloud cloud-5" />
    </div>
  );
}
