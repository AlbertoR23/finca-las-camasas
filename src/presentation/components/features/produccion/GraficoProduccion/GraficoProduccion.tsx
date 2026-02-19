import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";
import { Card } from "../../../common/Card/Card";
import { RegistroProduccion } from "@/src/core/entities/RegistroProduccion";

interface GraficoProduccionProps {
  registros: RegistroProduccion[];
  titulo?: string;
  height?: number;
}

// 🎨 Tooltip personalizado con diseño mejorado
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
        <p className="text-sm font-bold text-slate-900">{payload[0].payload.fecha}</p>
        <p className="text-lg font-black text-emerald-600">{payload[0].value} L</p>
      </div>
    );
  }
  return null;
};

export function GraficoProduccion({
  registros,
  titulo = "Curva de Producción",
  height = 180,
}: GraficoProduccionProps) {
  const datosGrafica = registros
    .slice()
    .reverse()
    .slice(0, 30) // Últimos 30 registros
    .map((r) => ({
      fecha: new Date(r.fecha).toLocaleDateString("es-VE", {
        day: "2-digit",
        month: "short",
      }),
      litros: r.litrosLeche,
      peso: r.pesoKg,
    }));

  if (datosGrafica.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-slate-400 font-bold text-sm">
          No hay datos de producción disponibles
        </p>
        <p className="text-[10px] text-slate-300 mt-2">
          Registra mediciones para ver el gráfico
        </p>
      </Card>
    );
  }

  // 📊 Cálculos de estadísticas
  const promedio =
    registros.reduce((acc, r) => acc + r.litrosLeche, 0) / registros.length;
  const total = registros.reduce((acc, r) => acc + r.litrosLeche, 0);

  return (
    <Card>
      {/* 🎯 Título prominente con icono */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🥛</span>
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide">
          {titulo}
        </h3>
      </div>

      {/* 📈 Gráfico con animación */}
      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={datosGrafica}
            margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
          >
            <defs>
              {/* 🎨 Degradado mejorado más atractivo */}
              <linearGradient id="colorLitro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="50%" stopColor="#10B981" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* 🔲 Grid más sutil */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E2E8F0"
              opacity={0.5}
            />

            {/* 📅 Eje X con mejor legibilidad - evita superposición */}
            <XAxis
              dataKey="fecha"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "#64748B", fontWeight: "600" }}
              interval={datosGrafica.length > 15 ? "preserveStartEnd" : 0}
              angle={datosGrafica.length > 15 ? -15 : 0}
              textAnchor={datosGrafica.length > 15 ? "end" : "middle"}
              height={datosGrafica.length > 15 ? 40 : 30}
            />

            {/* 💬 Tooltip personalizado */}
            <Tooltip content={<CustomTooltip />} cursor={{ strokeWidth: 2 }} />

            {/* 📊 Área con animación y línea gruesa */}
            <Area
              type="monotone"
              dataKey="litros"
              name="Litros"
              stroke="#10B981"
              strokeWidth={4}
              fill="url(#colorLitro)"
              dot={{
                fill: "#10B981",
                strokeWidth: 2,
                stroke: "#fff",
                r: 4,
              }}
              activeDot={{
                r: 6,
                strokeWidth: 3,
                stroke: "#fff",
                fill: "#10B981",
              }}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 📊 Estadísticas mejoradas debajo del gráfico */}
      {datosGrafica.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            {/* Promedio */}
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Promedio
              </p>
              <p className="text-emerald-600 font-black text-lg">
                {promedio.toFixed(1)}
                <span className="text-xs ml-1 font-semibold">L</span>
              </p>
            </div>

            {/* Total */}
            <div className="text-center">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="text-emerald-600 font-black text-lg">
                {total.toFixed(1)}
                <span className="text-xs ml-1 font-semibold">L</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}