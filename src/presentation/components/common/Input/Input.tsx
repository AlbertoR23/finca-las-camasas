import React from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type InputVariant = "default" | "small" | "large" | "underlined";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  /** Visual variant: "default" | "small" | "large" | "underlined" */
  variant?: InputVariant;
  /** Show a valid (green) state */
  valid?: boolean;
}

// ─────────────────────────────────────────────
// Keyframe styles injected once (no extra deps)
// ─────────────────────────────────────────────
const GLOBAL_STYLES = `
@keyframes input-shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-5px); }
  40%      { transform: translateX(5px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(4px); }
}
@keyframes error-fade-in {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
.input-shake { animation: input-shake 0.35s ease-out; }
.error-fade-in { animation: error-fade-in 0.2s ease-out forwards; }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.textContent = GLOBAL_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export function Input({
  label,
  error,
  icon,
  className = "",
  id,
  variant = "default",
  valid = false,
  disabled,
  required,
  ...props
}: InputProps) {
  injectStyles();

  const inputId = id || `input-${Math.random().toString(36).substring(2, 11)}`;

  // ── Variant: height + text size + padding ──────────────────────────────────
  const variantClasses: Record<InputVariant, string> = {
    default: "min-h-[56px] py-4 text-sm rounded-2xl border",
    small: "min-h-[40px] py-2 text-xs rounded-xl border",
    large: "min-h-[64px] py-5 text-base rounded-2xl border",
    underlined:
      "min-h-[56px] py-4 text-sm rounded-none border-0 border-b bg-transparent shadow-none",
  };

  // ── Base classes (invariant) ───────────────────────────────────────────────
  const baseClasses = [
    "w-full px-4",
    "bg-white",
    "text-slate-800 font-bold",
    "placeholder:text-slate-400",
    "outline-none",
    "transition-all duration-200 ease-in-out",
    "shadow-sm",
    variantClasses[variant],
  ].join(" ");

  // ── State: border + ring ───────────────────────────────────────────────────
  let stateClasses: string;
  if (disabled) {
    // Disabled: muted background, no interaction
    stateClasses =
      "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed shadow-none";
  } else if (error) {
    // Error: red border + red ring + shake animation
    stateClasses =
      "border-rose-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 input-shake";
  } else if (valid) {
    // Valid: green border
    stateClasses =
      "border-green-400 focus:border-green-500 focus:ring-4 focus:ring-green-100";
  } else {
    // Normal / Focus
    stateClasses =
      "border-slate-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:scale-[1.01]";
  }

  // ── Icon padding ───────────────────────────────────────────────────────────
  const iconPaddingClass = icon ? "pl-12" : "";

  // ── Label text size per variant ────────────────────────────────────────────
  const labelSizeClass = variant === "small" ? "text-[8px]" : "text-[9px]";

  // ── Icon size per variant ──────────────────────────────────────────────────
  const iconSizeClass = variant === "small" ? "w-4 h-4" : "w-5 h-5";

  return (
    <div className="space-y-1">
      {/* ── Label ─────────────────────────────────────────────────────────── */}
      {label && (
        <label
          htmlFor={inputId}
          className={`${labelSizeClass} font-black text-slate-500 ml-2 uppercase tracking-wide select-none`}
        >
          {label}
          {/* Required asterisk */}
          {required && (
            <span className="text-rose-400 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      {/* ── Input wrapper ─────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Left icon */}
        {icon && (
          <span
            className={`
              absolute left-4 top-1/2 -translate-y-1/2
              ${iconSizeClass}
              ${error ? "text-rose-400" : "text-slate-400"}
              transition-colors duration-200
              pointer-events-none
            `}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        <input
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            ${baseClasses}
            ${stateClasses}
            ${iconPaddingClass}
            ${className}
          `}
          {...props}
        />
      </div>

      {/* ── Error message ─────────────────────────────────────────────────── */}
      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="error-fade-in text-[10px] font-bold text-rose-500 ml-2 flex items-center gap-1"
        >
          {/* Warning icon */}
          <svg
            className="w-3 h-3 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
