import React, { useState, useCallback, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// TYPES (unchanged per restriction)
// ─────────────────────────────────────────────
interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface DockNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  items?: NavItem[];
}

// ─────────────────────────────────────────────
// DEFAULT ITEMS (unchanged per restriction)
// ─────────────────────────────────────────────
const defaultItems: NavItem[] = [
  { id: "inicio", icon: "📊", label: "Inicio" },
  { id: "animales", icon: "🐃", label: "Animales" },
  { id: "produccion", icon: "🥛", label: "Producción" },
  { id: "salud", icon: "💉", label: "Salud" },
  { id: "finanzas", icon: "💰", label: "Finanzas" },
];

// ─────────────────────────────────────────────
// RIPPLE HOOK — touch / click ripple effect
// ─────────────────────────────────────────────
function useRipple() {
  const [ripples, setRipples] = useState<
    { id: number; x: number; y: number }[]
  >([]);

  const addRipple = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const x = clientX - target.left;
    const y = clientY - target.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(
      () => setRipples((prev) => prev.filter((r) => r.id !== id)),
      600,
    );
  }, []);

  return { ripples, addRipple };
}

// ─────────────────────────────────────────────
// NAV BUTTON — internal component (kept per restriction)
// ─────────────────────────────────────────────
function NavButton({
  item,
  active,
  onClick,
  index,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
  index: number;
}) {
  const [pressed, setPressed] = useState(false);
  const { ripples, addRipple } = useRipple();

  // Press animation handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setPressed(true);
    addRipple(e as unknown as React.MouseEvent);
  };
  const handlePointerUp = () => setPressed(false);
  const handlePointerLeave = () => setPressed(false);

  return (
    <button
      /* ── Accessibility ── */
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
      role="tab"
      /* ── Pointer events ── */
      onClick={onClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      style={{
        // IMPROVEMENT 1 — entrance animation staggered per index
        animationDelay: `${index * 60}ms`,
        // IMPROVEMENT 4 — press scale with bounce
        transform: pressed
          ? "scale(0.93)"
          : active
            ? "translateY(-4px) scale(1.08)"
            : "scale(1)",
        opacity: pressed ? 0.75 : active ? 1 : 0.55,
        transition: pressed
          ? "transform 80ms ease-out, opacity 80ms ease-out"
          : "transform 300ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease",
      }}
      className={`
        /* IMPROVEMENT 1 — expanded tap target (min 56×56px, well above WCAG 44px) */
        relative flex flex-col items-center justify-center gap-1
        min-w-[56px] min-h-[56px] px-3 py-2
        rounded-2xl overflow-hidden
        /* IMPROVEMENT 7 — desktop hover */
        group
        /* IMPROVEMENT 5 — remove default button styles */
        border-0 bg-transparent cursor-pointer
        /* entrance slide-up */
        animate-[dock-in_400ms_ease_both]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-400
      `}
    >
      {/* IMPROVEMENT 3 — active background pill (Option C: semi-transparent) */}
      {active && (
        <span
          className="absolute inset-0 rounded-2xl bg-green-400/15"
          style={{
            animation:
              "fade-scale-in 250ms cubic-bezier(0.34,1.56,0.64,1) both",
          }}
          aria-hidden="true"
        />
      )}

      {/* IMPROVEMENT 6 — ripple effect */}
      {ripples.map((r) => (
        <span
          key={r.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            transform: "translate(-50%,-50%) scale(0)",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(74,222,128,0.25)",
            animation: "ripple 600ms ease-out forwards",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* IMPROVEMENT 3 — icon, 28×28px minimum */}
      <span
        className="text-[28px] leading-none select-none"
        style={{
          filter: active
            ? "drop-shadow(0 0 8px rgba(74,222,128,0.7))" // IMPROVEMENT 2 — glow on active
            : "none",
          transition: "filter 300ms ease",
        }}
        aria-hidden="true"
      >
        {item.icon}
      </span>

      {/* IMPROVEMENT 2 — top indicator bar (Option A) */}
      {active && (
        <span
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-green-400"
          style={{
            boxShadow: "0 0 10px 1px #4ade80",
            animation: "fade-scale-in 300ms ease both",
          }}
          aria-hidden="true"
        />
      )}

      {/* Label — visible on desktop, sr-only on mobile */}
      <span
        className={`
          text-[10px] font-semibold tracking-wide leading-none
          transition-colors duration-200 select-none
          ${active ? "text-green-300" : "text-white/40"}
          hidden sm:block
        `}
      >
        {item.label}
      </span>

      {/* IMPROVEMENT 8 — sr-only fallback for mobile */}
      <span className="sr-only sm:hidden">{item.label}</span>

      {/* IMPROVEMENT 6 — tooltip on desktop hover */}
      <span
        aria-hidden="true"
        className={`
          absolute -top-9 left-1/2 -translate-x-1/2
          px-2 py-1 rounded-lg text-[11px] font-semibold
          bg-[#0d2b1e]/90 text-green-300 whitespace-nowrap
          border border-white/10 backdrop-blur-sm
          pointer-events-none select-none
          opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0
          transition-all duration-200
          hidden lg:block
        `}
      >
        {item.label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────
// DOCK NAVIGATION — main export (props unchanged)
// ─────────────────────────────────────────────
export function DockNavigation({
  activeTab,
  onTabChange,
  items = defaultItems,
}: DockNavigationProps) {
  return (
    <>
      {/* ── Keyframe definitions injected once ── */}
      <style>{`
        @keyframes dock-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fade-scale-in {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1);   }
        }
        @keyframes ripple {
          to { transform: translate(-50%,-50%) scale(1); opacity: 0; }
        }
      `}</style>

      {/*
        IMPROVEMENT 5 — dock background:
          • backdrop-blur-xl (glass effect)
          • bg-[#1B4332]/95 (dark green, high opacity)
          • border-t border-white/20 (subtle top edge)
          • shadow-[0_-4px_20px_rgba(0,0,0,0.25)] (lifted shadow upward)
        IMPROVEMENT 7 — responsive width:
          • mobile: full width (fixed l-0 r-0)
          • tablet: max-w-md centered
          • desktop: max-w-sm centered, slightly smaller
      */}
      <nav
        role="tablist"
        aria-label="Navegación principal"
        className={`
          fixed bottom-0 left-0 right-0 z-30
          flex justify-center
          /* IMPROVEMENT 5 */
          bg-[#1B4332]/95 backdrop-blur-xl
          border-t border-white/20
          shadow-[0_-4px_20px_rgba(0,0,0,0.25)]
          /* safe area for notched phones */
          pb-[env(safe-area-inset-bottom,0px)]
        `}
      >
        {/* Inner pill — responsive width */}
        <div
          className={`
            w-full max-w-md lg:max-w-sm
            flex justify-around items-center
            /* IMPROVEMENT 1 — dock height ≥ 70px */
            min-h-[70px] px-2 py-1
          `}
        >
          {items.map((item, index) => (
            <NavButton
              key={item.id}
              item={item}
              active={activeTab === item.id}
              onClick={() => onTabChange(item.id)}
              index={index}
            />
          ))}
        </div>
      </nav>
    </>
  );
}

export default DockNavigation;
