"use client";

interface IntentInputProps {
  variant: "idle" | "anchored";
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  interpreting?: boolean;
  /** When true, render as compact pill (e.g. mobile when hero is up) */
  compactPill?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Default: "What do you want to explore on YouTube?" */
  placeholder?: string;
  /** When idle, replaces default mood/surface subtitle (e.g. video-specific hint) */
  idleSubtitle?: string;
  /** High-contrast search bar layout (label + left-aligned input) */
  searchBox?: boolean;
}

const DEFAULT_PLACEHOLDER = "What do you want to explore on YouTube?";

export function IntentInput({
  variant,
  value,
  onChange,
  onSubmit,
  disabled = false,
  interpreting = false,
  compactPill = false,
  onFocus,
  onBlur,
  placeholder = DEFAULT_PLACEHOLDER,
  idleSubtitle,
  searchBox = false,
}: IntentInputProps) {
  const isIdle = variant === "idle";
  const isSearchBox = searchBox && isIdle && !compactPill;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" && e.key !== "NumpadEnter") return;
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !interpreting) onSubmit();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !interpreting) onSubmit();
  };

  const inputClassName = isSearchBox
    ? `w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-left text-base font-normal text-black shadow-sm placeholder:text-black/40 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 disabled:opacity-50 dark:border-white/10 dark:bg-white/95 dark:text-black dark:placeholder:text-black/45 ${interpreting ? "intent-interpreting" : ""}`
    : `w-full rounded-2xl border border-white/15 bg-white/5 text-center font-light placeholder:opacity-60 focus:border-white/25 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 transition-all duration-300 ${
        compactPill
              ? "rounded-full px-4 py-2 text-base sm:text-sm"
          : isIdle
            ? "px-6 py-5 text-lg"
            : "px-4 py-3 text-base"
      } ${interpreting ? "intent-interpreting" : ""}`;

  const inputStyle = isSearchBox
    ? undefined
    : {
        color: "var(--theme-text-tone)",
        transition: "border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
      };

  return (
    <div
      className={`flex w-full flex-col gap-4 ${compactPill ? "max-w-xs" : isSearchBox ? "max-w-xl" : "max-w-2xl"}`}
    >
      {isSearchBox && (
        <label
          htmlFor="intent-search-input"
          className="text-sm font-semibold tracking-tight text-black/80 dark:text-white/90"
        >
          Search Videos
        </label>
      )}
      <form className="relative w-full" onSubmit={handleFormSubmit}>
        <input
          id={isSearchBox ? "intent-search-input" : undefined}
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={isSearchBox ? "Type keywords…" : placeholder}
          disabled={disabled}
          aria-label={isSearchBox ? "Search Videos" : undefined}
          className={inputClassName}
          style={inputStyle}
        />
        {interpreting && (
          <div
            className={`pointer-events-none absolute inset-0 intent-shimmer-overlay ${compactPill ? "rounded-full" : "rounded-2xl"}`}
            aria-hidden
          />
        )}
        {/* Hidden submit so Enter triggers form submit reliably (avoids browser default swallowing) */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden>
          Search
        </button>
      </form>
      {isIdle && !compactPill && !isSearchBox && (
        <p className="text-center text-xs opacity-50" style={{ color: "var(--theme-text-tone)" }}>
          {idleSubtitle ??
            "Describe your mood or curiosity in a sentence. The surface will reshape around it."}
        </p>
      )}
      {isSearchBox && (
        <p className="text-xs text-black/50 dark:text-white/50">
          {idleSubtitle ?? "Press Enter or use the button below to search."}
        </p>
      )}
    </div>
  );
}
