import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LayoutVariant = "default" | "auth" | "modal" | "fullscreen";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Optional variant to control header/footer visibility and layout mode */
  variant?: LayoutVariant;
}

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  LayoutVariant,
  { showHeader: boolean; showFooter: boolean; fullscreen: boolean }
> = {
  default:    { showHeader: true,  showFooter: true,  fullscreen: false },
  auth:       { showHeader: false, showFooter: false, fullscreen: false },
  modal:      { showHeader: true,  showFooter: false, fullscreen: false },
  fullscreen: { showHeader: false, showFooter: false, fullscreen: true  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function MainLayout({
  children,
  header,
  footer,
  variant = "default",
}: MainLayoutProps) {
  const config = variantConfig[variant];

  const shouldShowHeader = config.showHeader && !!header;
  const shouldShowFooter = config.showFooter && !!footer;

  return (
    <main
      className={[
        "min-h-screen bg-[#F8F9FA] text-slate-900 font-sans selection:bg-green-200",
        // Dock spacing — pb-32 keeps content above the fixed footer dock
        shouldShowFooter ? "pb-32" : "pb-6",
        // Fullscreen strips all chrome
        config.fullscreen ? "overflow-hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* ── Header slot ─────────────────────────────────────────────────── */}
      {shouldShowHeader && (
        <header
          className={[
            // Positioning & layering
            "sticky top-0 z-30",
            // Spacing
            "pt-10 pb-16 px-6",
            // Green gradient background
            "bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332]",
            // Text
            "text-white",
            // Shape
            "rounded-b-[3rem]",
            // Depth — shadow to separate from content beneath
            "shadow-[0_8px_32px_rgba(27,67,50,0.35)]",
            // Subtle backdrop blur when scrolled (works without JS via CSS)
            "backdrop-blur-sm",
            // Smooth transitions for future scroll-based effects
            "transition-all duration-300 ease-in-out",
          ].join(" ")}
        >
          {/* Decorative gradient shimmer overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-b-[3rem] overflow-hidden"
          >
            <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Constrain header content to mobile-optimised width */}
          <div className="relative max-w-md mx-auto">{header}</div>
        </header>
      )}

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div
        className={[
          // Mobile-optimised width, centred on larger screens
          "max-w-[400px] mx-auto",
          // Horizontal padding
          "px-4",
          // Pull content up to overlap header's bottom curve — creates depth
          shouldShowHeader ? "-mt-12" : "pt-6",
          // Vertical rhythm between child cards/sections
          "space-y-6",
          // Sit above decorative layers but below header/footer
          "relative z-10",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </div>

      {/* ── Footer / Dock slot ──────────────────────────────────────────── */}
      {shouldShowFooter && (
        <div
          className={[
            // Fixed dock at the bottom of the viewport
            "fixed bottom-0 left-0 right-0 z-40",
            // Glassmorphism base — semi-transparent + blur
            "bg-white/70 backdrop-blur-xl",
            // Soft top shadow to lift from content
            "shadow-[0_-4px_24px_rgba(0,0,0,0.08)]",
            // Subtle top border for definition
            "border-t border-white/60",
            // Fade-in entrance animation
            "animate-fadeInUp",
            // Smooth transitions
            "transition-all duration-300 ease-in-out",
          ].join(" ")}
        >
          {footer}
        </div>
      )}

      {/* ── Global animation keyframes (injected once) ──────────────────── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.35s ease-out both;
        }

        /* Skeleton loading shimmer utility — apply to placeholder divs */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton {
          background: linear-gradient(
            90deg,
            #e2e8f0 25%,
            #f0f4f8 50%,
            #e2e8f0 75%
          );
          background-size: 800px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 0.5rem;
        }
      `}</style>
    </main>
  );
}
