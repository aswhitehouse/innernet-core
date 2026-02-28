"use client";

interface IntentInputProps {
  variant: "idle" | "anchored";
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  interpreting?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  /** Default: "What do you want to explore on YouTube?" */
  placeholder?: string;
}

const DEFAULT_PLACEHOLDER = "What do you want to explore on YouTube?";

export function IntentInput({
  variant,
  value,
  onChange,
  onSubmit,
  disabled = false,
  interpreting = false,
  onFocus,
  onBlur,
  placeholder = DEFAULT_PLACEHOLDER,
}: IntentInputProps) {
  const isIdle = variant === "idle";

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4">
      <div className="relative w-full">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border border-white/15 bg-white/5 text-center font-light placeholder:opacity-60 focus:border-white/25 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-white/20 disabled:opacity-50 transition-all duration-300 ${
            isIdle
              ? "px-6 py-5 text-lg"
              : "px-4 py-3 text-base"
          } ${interpreting ? "intent-interpreting" : ""}`}
          style={{
            color: "var(--theme-text-tone)",
            transition: "border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease",
          }}
        />
        {interpreting && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl intent-shimmer-overlay"
            aria-hidden
          />
        )}
      </div>
      {isIdle && (
        <p className="text-center text-xs opacity-50" style={{ color: "var(--theme-text-tone)" }}>
          Describe your mood or curiosity in a sentence. The surface will reshape around it.
        </p>
      )}
    </div>
  );
}
