import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Card } from "../../../common/Card/Card";
import { RegistroProduccion } from "@/src/core/entities/RegistroProduccion";

interface GraficoProduccionProps {
  registros: RegistroProduccion[];
  titulo?: string;
  height?: number;
}

// ─── Tooltip personalizado ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const litros = payload[0]?.value as number;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        padding: "10px 14px",
        boxShadow:
          "0 8px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(16,185,129,0.15)",
        border: "1px solid #E2F5EF",
        animation: "fadeIn 0.15s ease",
        minWidth: "110px",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 700,
          color: "#94A3B8",
          margin: "0 0 4px 0",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: "18px",
          fontWeight: 800,
          color: "#10B981",
          margin: 0,
          lineHeight: 1,
        }}
      >
        {litros?.toFixed(1)}
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#64748B",
            marginLeft: "3px",
          }}
        >
          L
        </span>
      </p>
    </div>
  );
};

// ─── Punto personalizado (dot) ────────────────────────────────────────────────
const CustomDot = (props: any) => {
  const { cx, cy, value } = props;
  if (cx == null || cy == null) return null;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill="#10B981"
      stroke="white"
      strokeWidth={2}
      style={{ transition: "r 0.2s ease" }}
    />
  );
};

// ─── Dot activo (hover) ───────────────────────────────────────────────────────
const ActiveDot = (props: any) => {
  const { cx, cy } = props;
  if (cx == null || cy == null) return null;
  return (
    <g>
      {/* Halo externo */}
      <circle cx={cx} cy={cy} r={10} fill="#10B981" opacity={0.15} />
      {/* Halo medio */}
      <circle cx={cx} cy={cy} r={6} fill="#10B981" opacity={0.25} />
      {/* Punto central */}
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#10B981"
        stroke="white"
        strokeWidth={2}
      />
    </g>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────
export function GraficoProduccion({
  registros,
  titulo = "Curva de Producción",
  height = 180,
}: GraficoProduccionProps) {
  // ── Procesamiento de datos (sin modificar) ──────────────────────────────────
  const datosGrafica = registros
    .slice()
    .reverse()
    .slice(0, 30)
    .map((r) => ({
      fecha: new Date(r.fecha).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      }),
      litros: r.litrosLeche,
      peso: r.pesoKg,
    }));

  // ── Estadísticas ────────────────────────────────────────────────────────────
  const totalLitros = registros.reduce((acc, r) => acc + r.litrosLeche, 0);
  const promedioLitros = registros.length ? totalLitros / registros.length : 0;

  // ── Máximo para resaltar récord ─────────────────────────────────────────────
  const maxLitros = Math.max(...datosGrafica.map((d) => d.litros));
  const puntoRecord = datosGrafica.find((d) => d.litros === maxLitros);

  // ── Estado vacío ────────────────────────────────────────────────────────────
  if (datosGrafica.length === 0) {
    return (
      <Card className="text-center py-10">
        {/* Ícono ilustrativo */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px",
            fontSize: 24,
          }}
        >
          🥛
        </div>
        <p className="text-slate-500 font-bold text-sm">
          No hay datos de producción
        </p>
        <p className="text-[11px] text-slate-300 mt-1">
          Registra mediciones para ver el gráfico
        </p>
      </Card>
    );
  }

  // ── Reducir etiquetas del eje X en pantallas pequeñas (cada N puntos) ───────
  const tickInterval =
    datosGrafica.length > 15 ? Math.floor(datosGrafica.length / 6) : 0;

  return (
    <Card>
      {/* ── Encabezado ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 mb-3">
        <span style={{ fontSize: 16 }}>🥛</span>
        <p
          style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: 0,
          }}
        >
          {titulo}
        </p>
      </div>

      {/* ── Área del gráfico ─────────────────────────────────────────────── */}
      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={datosGrafica}
            margin={{ top: 8, right: 4, left: -18, bottom: 0 }}
          >
            {/* Degradado verde suave */}
            <defs>
              <linearGradient id="colorLitroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.28} />
                <stop offset="60%" stopColor="#10B981" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              {/* Sombra para la línea */}
              <filter
                id="lineShadow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodColor="#10B981"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            {/* Grid: solo líneas horizontales tenues */}
            <CartesianGrid
              strokeDasharray="2 4"
              vertical={false}
              stroke="#F1F5F9"
              strokeOpacity={0.9}
            />

            {/* Eje X: fechas abreviadas */}
            <XAxis
              dataKey="fecha"
              axisLine={false}
              tickLine={false}
              interval={tickInterval}
              tick={{
                fontSize: 9,
                fill: "#94A3B8",
                fontWeight: 700,
              }}
            />

            {/* Eje Y: valores con "L" */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#CBD5E1", fontWeight: 600 }}
              tickFormatter={(v) => `${v}L`}
              width={38}
            />

            {/* Línea de referencia: promedio diario */}
            <ReferenceLine
              y={promedioLitros}
              stroke="#10B981"
              strokeDasharray="4 3"
              strokeOpacity={0.4}
              strokeWidth={1.5}
              label={{
                value: `Prom`,
                position: "insideTopRight",
                fontSize: 8,
                fill: "#10B981",
                fontWeight: 700,
                opacity: 0.7,
              }}
            />

            {/* Tooltip */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: "#10B981",
                strokeWidth: 1.5,
                strokeDasharray: "4 3",
                strokeOpacity: 0.5,
              }}
            />

            {/* Área principal */}
            <Area
              type="monotone"
              dataKey="litros"
              name="Litros"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorLitroGrad)"
              dot={<CustomDot />}
              activeDot={<ActiveDot />}
              isAnimationActive={true}
              animationDuration={900}
              animationEasing="ease-out"
              filter="url(#lineShadow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Estadísticas ─────────────────────────────────────────────────── */}
      <div
        className="flex justify-between mt-3"
        style={{
          borderTop: "1px solid #F1F5F9",
          paddingTop: "10px",
        }}
      >
        {/* Promedio */}
        <div>
          <p
            style={{
              fontSize: "9px",
              color: "#94A3B8",
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Promedio diario
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#475569",
              margin: "1px 0 0 0",
            }}
          >
            {promedioLitros.toFixed(1)}
            <span
              style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "2px" }}
            >
              L
            </span>
          </p>
        </div>

        {/* Separador */}
        <div style={{ width: 1, background: "#F1F5F9", margin: "0 12px" }} />

        {/* Récord */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: "9px",
              color: "#94A3B8",
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Récord
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#10B981",
              margin: "1px 0 0 0",
            }}
          >
            {maxLitros.toFixed(1)}
            <span
              style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "2px" }}
            >
              L
            </span>
          </p>
        </div>

        {/* Separador */}
        <div style={{ width: 1, background: "#F1F5F9", margin: "0 12px" }} />

        {/* Total */}
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: "9px",
              color: "#94A3B8",
              fontWeight: 700,
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Total período
          </p>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 800,
              color: "#475569",
              margin: "1px 0 0 0",
            }}
          >
            {totalLitros.toFixed(1)}
            <span
              style={{ fontSize: "10px", color: "#94A3B8", marginLeft: "2px" }}
            >
              L
            </span>
          </p>
        </div>
      </div>

      {/* ── CSS inline para animación del tooltip ────────────────────────── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  );
}
