import React, { useState, useEffect, useRef } from "react";
import { Card } from "../../../common/Card/Card";
import { Button } from "../../../common/Button/Button";

export interface BalanceCardProps {
  balance: {
    ingresos: number;
    gastos: number;
    neto: number;
  };
  tasa: number;
  verEnDolares: boolean;
  onToggleMoneda: () => void;
  className?: string;
  // Opcional: datos del gráfico de producción
  datosProduccion?: { fecha: string; valor: number }[];
  tasaOnline?: boolean;
}

export function BalanceCard({
  balance,
  tasa,
  verEnDolares,
  onToggleMoneda,
  className = "",
  datosProduccion = [],
  tasaOnline = true,
}: BalanceCardProps) {
  // ── Estado para animación de cambio de moneda ─────────────────────────────
  const [fadeState, setFadeState] = useState<"visible" | "hidden">("visible");
  const prevVerEnDolares = useRef(verEnDolares);

  // ── Detectar cambio de moneda y disparar cross-fade ───────────────────────
  useEffect(() => {
    if (prevVerEnDolares.current !== verEnDolares) {
      setFadeState("hidden");
      const timer = setTimeout(() => {
        setFadeState("visible");
      }, 150); // mitad de 300ms para el cross-fade
      prevVerEnDolares.current = verEnDolares;
      return () => clearTimeout(timer);
    }
  }, [verEnDolares]);

  // ── Lógica de conversión (sin modificar) ──────────────────────────────────
  const calcularMontoMostrar = (monto: number) => {
    if (verEnDolares) {
      return monto / tasa;
    }
    return monto;
  };

  const formatoMonto = (monto: number) => {
    return monto.toLocaleString("es-VE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const simbolo = verEnDolares ? "$" : "Bs";
  const balanceMostrar = calcularMontoMostrar(balance.neto);
  const ingresosMostrar = calcularMontoMostrar(balance.ingresos);
  const gastosMostrar = calcularMontoMostrar(balance.gastos);

  // ── Color dinámico del balance ────────────────────────────────────────────
  const colorBalance =
    balance.neto > 0
      ? "text-emerald-500"
      : balance.neto < 0
        ? "text-rose-500"
        : "text-slate-400";

  const glowBalance =
    balance.neto > 0
      ? "drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]"
      : balance.neto < 0
        ? "drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]"
        : "";

  // ── Clases de animación de fade ───────────────────────────────────────────
  const fadeClass =
    fadeState === "visible"
      ? "opacity-100 translate-y-0"
      : "opacity-0 translate-y-1";

  // ── Mini gráfico SVG de producción ────────────────────────────────────────
  const MiniChart = () => {
    if (!datosProduccion || datosProduccion.length < 2) return null;

    const valores = datosProduccion.map((d) => d.valor);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const rango = max - min || 1;
    const W = 300;
    const H = 60;
    const pad = 4;

    const puntos = valores.map((v, i) => ({
      x: pad + (i / (valores.length - 1)) * (W - pad * 2),
      y: H - pad - ((v - min) / rango) * (H - pad * 2),
    }));

    const linePath = puntos
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const areaPath = `${linePath} L ${puntos[puntos.length - 1].x} ${H} L ${puntos[0].x} ${H} Z`;

    return (
      <div className="mt-4 rounded-2xl overflow-hidden bg-slate-900/5 px-2 pt-2 pb-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 px-1">
          Producción
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: 60 }}
        >
          <defs>
            {/* Degradado verde para el área */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
            {/* Grid sutil */}
          </defs>

          {/* Grid lines sutiles */}
          {[0.25, 0.5, 0.75].map((frac) => (
            <line
              key={frac}
              x1={pad}
              y1={H * frac}
              x2={W - pad}
              y2={H * frac}
              stroke="#94a3b8"
              strokeOpacity="0.15"
              strokeWidth="0.5"
            />
          ))}

          {/* Área degradada */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Línea principal más gruesa */}
          <path
            d={linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5" /* stroke-4 equivalente en SVG */
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Punto final resaltado */}
          <circle
            cx={puntos[puntos.length - 1].x}
            cy={puntos[puntos.length - 1].y}
            r="3.5"
            fill="#10b981"
          />
        </svg>
      </div>
    );
  };

  return (
    /*
     * ── TARJETA PRINCIPAL ─────────────────────────────────────────────────
     * Glassmorphism: fondo blanco semi-transparente + backdrop-blur + borde
     * sutil + sombra pronunciada (shadow-2xl).
     */
    <div
      className={`
        relative rounded-3xl
        bg-white/80 backdrop-blur-md
        border border-white/60
        shadow-2xl shadow-slate-200/80
        p-6
        ${className}
      `}
      style={{
        /* Asegura que el backdrop-blur funcione en todos los navegadores */
        WebkitBackdropFilter: "blur(16px)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* ── ENCABEZADO: Etiqueta + Toggle de moneda ── */}
      <div className="flex justify-between items-center mb-5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Balance Neto
        </p>

        {/*
         * ── TOGGLE MONEDA (diseño switch) ────────────────────────────────
         * BS izquierda / USD derecha con píldora deslizante animada.
         * Verde cuando activo, gris cuando inactivo.
         */}
        <button
          onClick={onToggleMoneda}
          className="relative flex items-center gap-0 bg-slate-100 rounded-full p-[3px] border border-slate-200 hover:border-emerald-300 transition-colors duration-200"
          aria-label="Cambiar moneda"
        >
          {/* Píldora deslizante animada */}
          <span
            className={`
              absolute top-[3px] h-[calc(100%-6px)] w-[calc(50%-3px)]
              rounded-full transition-all duration-300 ease-in-out
              ${
                verEnDolares
                  ? "left-[calc(50%+0px)] bg-emerald-500 shadow-sm"
                  : "left-[3px] bg-emerald-500 shadow-sm"
              }
            `}
          />
          <span
            className={`
              relative z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
              transition-colors duration-300
              ${!verEnDolares ? "text-white" : "text-slate-400"}
            `}
          >
            Bs
          </span>
          <span
            className={`
              relative z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full
              transition-colors duration-300
              ${verEnDolares ? "text-white" : "text-slate-400"}
            `}
          >
            USD
          </span>
        </button>
      </div>

      {/*
       * ── NÚMERO PRINCIPAL (XXL) ───────────────────────────────────────────
       * text-7xl + font-black + color dinámico + glow + animación cross-fade
       * 300ms ease-in-out al cambiar moneda.
       */}
      <div
        className={`
          transition-all duration-300 ease-in-out
          ${fadeClass}
          ${glowBalance}
        `}
      >
        <h3
          className={`
            text-7xl font-black tracking-tight leading-none mb-1
            ${colorBalance}
          `}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {simbolo}&thinsp;{formatoMonto(balanceMostrar)}
        </h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {balance.neto >= 0 ? "Superávit del período" : "Déficit del período"}
        </p>
      </div>

      {/*
       * ── TARJETAS SECUNDARIAS: Ingresos / Gastos ──────────────────────────
       * Fondo verde/rojo claro + iconos + hover scale 1.02 + números grandes
       */}
      <div
        className={`
          grid grid-cols-2 gap-3 mt-5
          transition-all duration-300 ease-in-out
          ${fadeClass}
        `}
      >
        {/* Ingresos */}
        <div
          className="
            bg-emerald-50 border border-emerald-100
            p-4 rounded-2xl
            transition-transform duration-200 ease-out
            hover:scale-[1.02] hover:shadow-md hover:shadow-emerald-100
            cursor-default
          "
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base leading-none">📈</span>
            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">
              Ingresos
            </p>
          </div>
          <p
            className="text-xl font-black text-emerald-700 leading-tight"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {simbolo} {formatoMonto(ingresosMostrar)}
          </p>
        </div>

        {/* Gastos */}
        <div
          className="
            bg-rose-50 border border-rose-100
            p-4 rounded-2xl
            transition-transform duration-200 ease-out
            hover:scale-[1.02] hover:shadow-md hover:shadow-rose-100
            cursor-default
          "
        >
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base leading-none">📉</span>
            <p className="text-[9px] font-black text-rose-600 uppercase tracking-wider">
              Gastos
            </p>
          </div>
          <p
            className="text-xl font-black text-rose-700 leading-tight"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {simbolo} {formatoMonto(gastosMostrar)}
          </p>
        </div>
      </div>

      {/* ── GRÁFICO DE PRODUCCIÓN (si hay datos) ── */}
      <MiniChart />

      {/*
       * ── TASA BCV ─────────────────────────────────────────────────────────
       * Texto pequeño pero legible + icono 💵 + indicador online/offline
       */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm leading-none">💵</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
            Tasa BCV: Bs {tasa.toFixed(2)} / USD
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className="text-[10px] leading-none"
            title={
              tasaOnline ? "Tasa en tiempo real" : "Sin conexión – tasa local"
            }
          >
            {tasaOnline ? "🟢" : "🟠"}
          </span>
          <span className="text-[9px] font-bold text-slate-400">
            {tasaOnline ? "En línea" : "Offline"}
          </span>
        </div>
      </div>
    </div>
  );
}
