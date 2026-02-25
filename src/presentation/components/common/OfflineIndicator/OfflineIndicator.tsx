"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useOfflineStatus } from "@/src/presentation/hooks/useOfflineStatus";

// ─── Types ───────────────────────────────────────────────────────────────────

type SyncState = "online" | "offline" | "syncing";

// ─── Keyframe animations injected once via a <style> tag ─────────────────────
// Using inline styles + CSS-in-JS approach to avoid Tailwind JIT limitations
// for custom keyframes while keeping Tailwind for spacing / colors.

const ANIMATION_STYLES = `
@keyframes oi-slide-up {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes oi-slide-down {
  from { transform: translateY(0);    opacity: 1; }
  to   { transform: translateY(24px); opacity: 0; }
}
@keyframes oi-fade-cross {
  0%   { opacity: 0; transform: scale(0.96); }
  100% { opacity: 1; transform: scale(1);    }
}
@keyframes oi-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-4px); }
}
@keyframes oi-bounce-badge {
  0%, 100% { transform: scale(1); }
  30%       { transform: scale(1.35); }
  60%       { transform: scale(0.9);  }
}
@keyframes oi-spin {
  to { transform: rotate(360deg); }
}
@keyframes oi-pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated status dot */
function StatusDot({ state }: { state: SyncState }) {
  const colorMap: Record<SyncState, string> = {
    online: "bg-emerald-500",
    offline: "bg-amber-400",
    syncing: "bg-blue-500",
  };

  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${colorMap[state]}`}
      style={{
        animation:
          state === "online"
            ? "oi-pulse-dot 2s ease-in-out infinite"
            : state === "offline"
              ? "oi-float 2.4s ease-in-out infinite"
              : "oi-pulse-dot 0.8s ease-in-out infinite",
      }}
    />
  );
}

/** Circular badge showing pending count */
function PendingBadge({
  count,
  prevCount,
}: {
  count: number;
  prevCount: number;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (count !== prevCount && count > 0) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(t);
    }
  }, [count, prevCount]);

  if (count === 0) return null;

  return (
    <span
      aria-label={`${count} operaciones pendientes`}
      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-[11px] font-bold flex-shrink-0 tabular-nums"
      style={{
        animation: animate ? "oi-bounce-badge 0.5s ease-in-out" : undefined,
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Loading spinner for sync button */
function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
      style={{ animation: "oi-spin 0.7s linear infinite" }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function OfflineIndicator() {
  // ── Stable hook (DO NOT modify) ──────────────────────────────────────────
  const { isOnline, wasOffline } = useOfflineStatus();

  // pendingCount: in a real app, inject from a sync-queue hook.
  // Here we keep it at 0 per the original code; the UI is fully wired.
  const pendingCount = 0;

  // ── Derived state ─────────────────────────────────────────────────────────
  const hasPending = pendingCount > 0;
  const syncState: SyncState =
    isOnline && hasPending ? "syncing" : isOnline ? "online" : "offline";

  // ── Visibility / animation ────────────────────────────────────────────────
  // Show indicator when: offline OR just came back online (wasOffline)
  const shouldShow = !isOnline || wasOffline;

  // After 3 s of being back online with nothing pending, slide out
  const [visible, setVisible] = useState(shouldShow);
  const [slidingOut, setSlidingOut] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shouldShow) {
      setVisible(true);
      setSlidingOut(false);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      if (isOnline && !hasPending) {
        hideTimerRef.current = setTimeout(() => {
          setSlidingOut(true);
          // remove from DOM after slide-down animation (300 ms)
          setTimeout(() => setVisible(false), 320);
        }, 3000);
      }
    } else {
      setVisible(false);
      setSlidingOut(false);
    }

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [shouldShow, isOnline, hasPending]);

  // ── Sync button ───────────────────────────────────────────────────────────
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      // 🔌 Wire your sync logic here, e.g. await syncQueue.flush()
      await new Promise((r) => setTimeout(r, 1500)); // placeholder
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // ── Previous pending count (for badge bounce) ────────────────────────────
  const prevCountRef = useRef(pendingCount);
  useEffect(() => {
    prevCountRef.current = pendingCount;
  });

  // ── Styling map ───────────────────────────────────────────────────────────
  const themeMap: Record<
    SyncState,
    {
      wrap: string;
      text: string;
      sub: string;
      icon: string;
      label: string;
      sublabel: string;
    }
  > = {
    online: {
      wrap: "bg-emerald-50 border border-emerald-200",
      text: "text-emerald-800",
      sub: "text-emerald-600",
      icon: "✅",
      label: "Conectado",
      sublabel: "Todo sincronizado",
    },
    offline: {
      wrap: "bg-amber-50 border border-amber-200",
      text: "text-amber-800",
      sub: "text-amber-600",
      icon: "📡",
      label: "Sin conexión",
      sublabel: "Los datos se guardarán localmente",
    },
    syncing: {
      wrap: "bg-blue-50 border border-blue-200",
      text: "text-blue-800",
      sub: "text-blue-600",
      icon: "⏳",
      label: `${pendingCount} operación${(pendingCount as number) !== 1 ? "es" : ""} pendiente${(pendingCount as number) !== 1 ? "s" : ""}`,
      sublabel: "Sincronizando con el servidor…",
    },
  };

  const theme = themeMap[syncState];

  if (!visible) return null;

  return (
    <>
      {/* Inject keyframes once */}
      <style>{ANIMATION_STYLES}</style>

      {/*
       * Screen-reader live region — announces state changes without interrupting.
       * Placed outside the visual element so it's always in the DOM.
       */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {syncState === "online" && "Conexión restablecida. Todo sincronizado."}
        {syncState === "offline" &&
          "Sin conexión. Los datos se guardarán localmente."}
        {syncState === "syncing" &&
          `${pendingCount} operaciones pendientes de sincronizar.`}
      </div>

      {/* ── Toast container ────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-20 left-4 right-4 z-50 max-w-sm mx-auto"
        style={{
          animation: slidingOut
            ? "oi-slide-down 300ms ease-in forwards"
            : "oi-slide-up 300ms ease-out forwards",
        }}
        role="region"
        aria-label="Estado de conectividad"
      >
        <div
          className={`
            rounded-2xl shadow-2xl p-4
            transition-colors duration-500
            ${theme.wrap}
          `}
          style={{ animation: "oi-fade-cross 350ms ease-out" }}
        >
          {/* ── Row: dot · text · badge · [button] ───────────────────── */}
          <div className="flex items-center gap-3">
            {/* Status dot */}
            <StatusDot state={syncState} />

            {/* Icon (offline floats, others static) */}
            <span
              className="text-xl select-none flex-shrink-0"
              aria-hidden="true"
              style={
                syncState === "offline"
                  ? { animation: "oi-float 2.4s ease-in-out infinite" }
                  : undefined
              }
            >
              {theme.icon}
            </span>

            {/* Text block */}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-semibold leading-tight truncate ${theme.text}`}
              >
                {theme.label}
              </p>
              <p className={`text-xs leading-snug truncate ${theme.sub}`}>
                {theme.sublabel}
              </p>
            </div>

            {/* Pending badge */}
            <PendingBadge
              count={pendingCount}
              prevCount={prevCountRef.current}
            />

            {/* Manual sync button — only when online + pending */}
            {isOnline && hasPending && (
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                aria-label={isSyncing ? "Sincronizando…" : "Sincronizar ahora"}
                className={`
                  flex items-center gap-1.5
                  px-3 py-1.5 rounded-xl
                  text-xs font-semibold text-white
                  bg-emerald-500
                  active:scale-95
                  transition-all duration-150
                  disabled:opacity-70 disabled:cursor-not-allowed
                  shadow-sm
                  min-w-[80px] justify-center
                  /* Ensure tap target ≥ 44px tall */
                  min-h-[36px]
                `}
              >
                {isSyncing ? (
                  <>
                    <Spinner />
                    <span>Sync…</span>
                  </>
                ) : (
                  <>
                    <span aria-hidden>↑</span>
                    <span>Sincronizar</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
