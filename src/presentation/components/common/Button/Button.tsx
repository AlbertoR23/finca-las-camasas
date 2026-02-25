import React, { useState, useRef } from "react";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
  /** Show loading spinner and disable interaction */
  loading?: boolean;
  /** Icon rendered to the left of the label */
  leftIcon?: React.ReactNode;
  /** Icon rendered to the right of the label */
  rightIcon?: React.ReactNode;
  /** Accessible label when there is no visible text */
  ariaLabel?: string;
}

// ─────────────────────────────────────────────
// Ripple helper
// ─────────────────────────────────────────────
interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const counter = useRef(0);

  function addRipple(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget.getBoundingClientRect();
    const size = Math.max(btn.width, btn.height) * 2;
    const x = e.clientX - btn.left - size / 2;
    const y = e.clientY - btn.top - size / 2;
    const id = counter.current++;
    setRipples((prev) => [...prev, { id, x, y, size }]);
    setTimeout(
      () => setRipples((prev) => prev.filter((r) => r.id !== id)),
      600,
    );
  }

  return { ripples, addRipple };
}

// ─────────────────────────────────────────────
// Spinner
// ─────────────────────────────────────────────
function Spinner({ size }: { size: "sm" | "md" | "lg" }) {
  const dim = size === "sm" ? 14 : size === "lg" ? 20 : 16;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ animation: "btn-spin 0.7s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ─────────────────────────────────────────────
// Variant config
// ─────────────────────────────────────────────
const VARIANT_STYLES: Record<
  string,
  React.CSSProperties & { [key: string]: string }
> = {};

// We use inline styles for the colour-dependent shadow values
// and Tailwind for everything else — best of both worlds.

const variantTailwind: Record<string, string> = {
  primary:
    "bg-[#1B4332] text-white hover:bg-[#2D6A4F] focus-visible:ring-green-800/40 [--shadow-color:theme(colors.green.900/30%)]",
  secondary:
    "bg-slate-100 text-slate-700 hover:bg-slate-200 focus-visible:ring-slate-400/40 [--shadow-color:theme(colors.slate.400/20%)]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600/40 [--shadow-color:theme(colors.rose.900/30%)]",
  success:
    "bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500/40 [--shadow-color:theme(colors.emerald.900/25%)]",
};

const shadowMap: Record<string, string> = {
  primary: "rgba(27,67,50,0.32)",
  secondary: "rgba(100,116,139,0.18)",
  danger: "rgba(190,18,60,0.30)",
  success: "rgba(5,150,105,0.28)",
};

const sizeTailwind: Record<string, string> = {
  sm: "h-10 px-4 text-xs gap-1.5",
  md: "h-12 px-6 text-sm gap-2",
  lg: "h-14 px-8 text-base gap-2.5",
};

const iconSize: Record<string, number> = { sm: 14, md: 16, lg: 18 };

// ─────────────────────────────────────────────
// Button component
// ─────────────────────────────────────────────
export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  loading = false,
  leftIcon,
  rightIcon,
  ariaLabel,
  onClick,
  ...props
}: ButtonProps) {
  const { ripples, addRipple } = useRipple();
  const isDisabled = disabled || loading;

  const shadow = shadowMap[variant];

  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    addRipple(e);
    onClick?.(e);
  }

  const baseClasses = [
    // layout
    "relative inline-flex items-center justify-center overflow-hidden select-none",
    // typography
    "font-bold tracking-wide",
    // shape
    "rounded-2xl",
    // transitions
    "transition-all duration-200 ease-out",
    // hover elevation (applied via group)
    "hover:-translate-y-px",
    // active
    "active:scale-95 active:translate-y-0",
    // focus
    "focus-visible:outline-none focus-visible:ring-4",
    // disabled
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
    // width
    fullWidth ? "w-full" : "",
    // variant
    variantTailwind[variant],
    // size
    sizeTailwind[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes btn-spin { to { transform: rotate(360deg); } }
        @keyframes btn-ripple {
          from { transform: scale(0); opacity: 0.45; }
          to   { transform: scale(1); opacity: 0; }
        }
      `}</style>

      <button
        className={baseClasses}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-label={ariaLabel}
        aria-busy={loading}
        style={{
          boxShadow: isDisabled
            ? "none"
            : `0 4px 14px 0 ${shadow}, 0 1px 3px 0 ${shadow}`,
        }}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple layer */}
        {ripples.map(({ id, x, y, size: s }) => (
          <span
            key={id}
            aria-hidden="true"
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.35)",
              pointerEvents: "none",
              animation: "btn-ripple 0.6s ease-out forwards",
            }}
          />
        ))}

        {/* Content */}
        {loading ? (
          <>
            <Spinner size={size} />
            <span>Cargando…</span>
          </>
        ) : (
          <>
            {leftIcon && (
              <span
                aria-hidden="true"
                style={{
                  width: iconSize[size],
                  height: iconSize[size],
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {leftIcon}
              </span>
            )}
            <span>{children}</span>
            {rightIcon && (
              <span
                aria-hidden="true"
                style={{
                  width: iconSize[size],
                  height: iconSize[size],
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    </>
  );
}

// ─────────────────────────────────────────────
// Usage examples (remove in production)
// ─────────────────────────────────────────────
export default function ButtonShowcase() {
  const [loading, setLoading] = useState(false);

  function simulateLoad() {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  }

  const CheckIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" width="100%" height="100%">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const TrashIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" width="100%" height="100%">
      <path
        fillRule="evenodd"
        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
        clipRule="evenodd"
      />
    </svg>
  );

  const ArrowIcon = (
    <svg viewBox="0 0 20 20" fill="currentColor" width="100%" height="100%">
      <path
        fillRule="evenodd"
        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );

  const row = "flex flex-wrap items-center gap-3";

  return (
    <div className="min-h-screen bg-gray-50 p-10 font-sans">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">Button System</h1>

      {/* Variants */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Variants
        </h2>
        <div className={row}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="success">Success</Button>
        </div>
      </section>

      {/* Sizes */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Sizes
        </h2>
        <div className={row + " items-end"}>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Icons */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          With Icons
        </h2>
        <div className={row}>
          <Button variant="primary" leftIcon={CheckIcon}>
            Confirm
          </Button>
          <Button variant="danger" leftIcon={TrashIcon}>
            Delete
          </Button>
          <Button variant="secondary" rightIcon={ArrowIcon}>
            Continue
          </Button>
          <Button variant="success" leftIcon={CheckIcon} rightIcon={ArrowIcon}>
            Save &amp; Next
          </Button>
        </div>
      </section>

      {/* States */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          States
        </h2>
        <div className={row}>
          <Button variant="primary" loading={loading} onClick={simulateLoad}>
            {loading ? "" : "Click to Load"}
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="danger" disabled leftIcon={TrashIcon}>
            Disabled w/ Icon
          </Button>
        </div>
      </section>

      {/* Full width */}
      <section className="mb-8 max-w-sm">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
          Full Width
        </h2>
        <Button variant="primary" fullWidth size="lg" rightIcon={ArrowIcon}>
          Submit Form
        </Button>
      </section>
    </div>
  );
}
