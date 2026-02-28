"use client";

import { useTheme } from "@/contexts/ThemeContext";

export type TrackId = "research" | "news" | "watch" | "reflect";

interface TileProps {
  id: TrackId;
  label: string;
  icon: string;
  isActive: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  /** Optional accent override per tile */
  accentHint?: string;
}

const tileVariants: Record<
  TrackId,
  {
    wrapperClass: string;
    headerClass: string;
    previewWrapperClass: string;
    iconClass?: string;
  }
> = {
  research: {
    wrapperClass: "border-black/[0.09]",
    headerClass: "font-semibold tracking-tight text-[13px]",
    previewWrapperClass: "rounded-lg",
    iconClass: "opacity-80",
  },
  news: {
    wrapperClass: "border-black/[0.07]",
    headerClass: "font-medium tracking-normal",
    previewWrapperClass: "rounded-xl",
    iconClass: "opacity-90",
  },
  watch: {
    wrapperClass: "border-black/[0.1]",
    headerClass: "font-medium",
    previewWrapperClass: "rounded-xl",
    iconClass: "opacity-85",
  },
  reflect: {
    wrapperClass: "border-black/[0.04]",
    headerClass: "font-medium tracking-wide",
    previewWrapperClass: "rounded-2xl",
    iconClass: "opacity-75",
  },
};

export function Tile({
  id,
  label,
  icon,
  isActive,
  onSelect,
  children,
  accentHint,
}: TileProps) {
  const { mood } = useTheme();
  const accent = accentHint ?? mood.accent;
  const variant = tileVariants[id];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all duration-[800ms] ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${!isActive ? "tile-hover-gentle" : ""}`}
      style={{
        backgroundColor: isActive ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.32)",
        borderColor: isActive ? accent : "rgba(0,0,0,0.07)",
        boxShadow: isActive
          ? "0 4px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.02)"
          : "0 2px 12px rgba(0,0,0,0.02)",
        opacity: isActive ? 1 : 0.88,
        transform: isActive ? "scale(1.02)" : "scale(1)",
        ["--tile-accent" as string]: accent,
        ["--theme-accent" as string]: accent,
      }}
      aria-pressed={isActive}
      aria-label={`Open ${label}`}
    >
      {/* Very slow glow when selected — breathing */}
      {isActive && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
          style={{
            animation: "tile-glow 5s ease-in-out infinite",
            boxShadow: `inset 0 0 60px -10px ${accent}`,
          }}
        />
      )}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ease-out group-hover:opacity-[0.08]`}
        style={{ backgroundColor: accent, opacity: isActive ? 0.06 : 0.04 }}
      />
      <div className={`relative flex items-center gap-2 p-3 ${variant.wrapperClass}`}>
        <span className={`text-xl ${variant.iconClass ?? ""}`} aria-hidden>
          {icon}
        </span>
        <span
          className={`text-sm ${variant.headerClass}`}
          style={{ color: "var(--theme-text-tone)" }}
        >
          {label}
        </span>
      </div>
      <div className="relative min-h-[64px] flex-1 px-3 pb-3">
        <div
          className={`overflow-hidden ${variant.previewWrapperClass} transition-transform duration-1000 ease-out`}
          style={{
            transform: `scale(${1 / (mood.motionScale || 1)})`,
            animation: "tile-preview 10s ease-in-out infinite",
          }}
        >
          {children}
        </div>
      </div>
    </button>
  );
}
