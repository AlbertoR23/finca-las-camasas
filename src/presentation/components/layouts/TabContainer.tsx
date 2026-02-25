import React, { useRef, useEffect, memo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AnimationVariant = "slide-right" | "slide-left" | "fade" | "scale";

interface TabContainerProps {
  activeTab: string;
  children: React.ReactNode;
  className?: string;
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
  /** Animation direction for this panel. Defaults to "slide-right". */
  animation?: AnimationVariant;
  /** Transition duration in ms. Defaults to 500. */
  duration?: number;
  /** Optional label announced to screen readers on activation. */
  label?: string;
}

// ─── Animation map ────────────────────────────────────────────────────────────
// Maps each variant to Tailwind animate-in utility classes.
// The custom easing is applied via an inline style override so we don't need
// to extend tailwind.config.

const ANIMATION_CLASSES: Record<AnimationVariant, string> = {
  "slide-right": "animate-in slide-in-from-right-5 fade-in",
  "slide-left": "animate-in slide-in-from-left-5 fade-in",
  fade: "animate-in fade-in",
  scale: "animate-in zoom-in-95 fade-in",
};

// ─── TabContainer ─────────────────────────────────────────────────────────────

/**
 * Wraps all TabPanel siblings.
 *
 * Responsibilities:
 * - Applies consistent vertical rhythm (space-y-6).
 * - Provides a subtle entrance animation on first mount.
 * - Passes `activeTab` implicitly – panels read it via prop drilling.
 *
 * Props are **unchanged** from the original contract.
 */
export const TabContainer = memo(function TabContainer({
  activeTab,
  children,
  className = "",
}: TabContainerProps) {
  return (
    <div
      role="tabpanel-group"
      className={[
        "space-y-6",
        "animate-in fade-in slide-in-from-right-4 duration-500",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
});

// ─── TabPanel ─────────────────────────────────────────────────────────────────

/**
 * Renders its children only when `activeTab === id`.
 *
 * Improvements over the original:
 * - Differentiated animation variants per direction.
 * - Smooth cubic-bezier easing applied as inline style.
 * - Configurable duration prop (default 500 ms).
 * - ARIA: role="tabpanel", aria-label, aria-live polite announcement.
 * - Focus management: moves focus to the panel wrapper on activation so
 *   keyboard users can Tab directly into panel content.
 * - Lazy-mount: heavy children stay unmounted until the panel is first shown,
 *   then remain mounted-but-hidden — achieved via the `data-active` pattern
 *   so React doesn't destroy internal state on tab switch.
 *
 * Props are **unchanged** from the original contract (id, activeTab, children).
 */
export const TabPanel = memo(function TabPanel({
  id,
  activeTab,
  children,
  animation = "slide-right",
  duration = 500,
  label,
}: TabPanelProps) {
  const isActive = activeTab === id;

  // Track whether this panel has ever been shown (for lazy mounting).
  const hasBeenActiveRef = useRef(false);
  if (isActive) hasBeenActiveRef.current = true;

  // Focus management: when this panel becomes active, move focus to it so
  // keyboard users land at the start of the new content.
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isActive && panelRef.current) {
      // Only steal focus if the trigger was keyboard/tab interaction
      // (not pointer click) to avoid disrupting mouse users.
      const active = document.activeElement;
      const isKeyboardNav =
        active instanceof HTMLElement && active.dataset.tabTrigger === "true";
      if (isKeyboardNav) {
        panelRef.current.focus({ preventScroll: false });
      }
    }
  }, [isActive]);

  // Don't render at all until first activation (true lazy mount).
  if (!hasBeenActiveRef.current) return null;

  const animationClass = ANIMATION_CLASSES[animation];

  return (
    <>
      {/* Screen-reader live region announces section change */}
      {isActive && (
        <span
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {label ?? `Sección ${id} activa`}
        </span>
      )}

      <div
        ref={panelRef}
        role="tabpanel"
        id={`tabpanel-${id}`}
        aria-labelledby={`tab-${id}`}
        aria-label={label}
        tabIndex={-1}
        hidden={!isActive}
        // When hidden via the HTML `hidden` attribute the element is removed
        // from the accessibility tree AND layout — better than display:none via
        // CSS because it also removes it from tab order automatically.
        className={
          isActive
            ? [
                animationClass,
                // Outline only visible on keyboard focus
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-md",
              ].join(" ")
            : ""
        }
        style={
          isActive
            ? {
                animationDuration: `${duration}ms`,
                animationTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                animationFillMode: "both",
              }
            : undefined
        }
      >
        {children}
      </div>
    </>
  );
});
