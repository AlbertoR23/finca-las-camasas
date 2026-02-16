import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Card } from "../../../common/Card/Card";
import { RegistroProduccion } from "@/src/core/entities/RegistroProduccion";

interface GraficoProduccionProps {
  registros: RegistroProduccion[];
  titulo?: string;
  height?: number;
}

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

  return (
    <Card>
      <p className="text-[10px] font-black text-slate-300 uppercase mb-2">
        {titulo}
      </p>
      <div style={{ height: `${height}px` }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datosGrafica}>
            <defs>
              <linearGradient id="colorLitro" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#F1F5F9"
            />
            <XAxis
              dataKey="fecha"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94A3B8", fontWeight: "bold" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Area
              type="monotone"
              dataKey="litros"
              name="Litros"
              stroke="#10B981"
              strokeWidth={4}
              fill="url(#colorLitro)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {datosGrafica.length > 0 && (
        <div className="flex justify-between mt-4 text-[8px] text-slate-400 font-bold">
          <span>
            Promedio:{" "}
            {(
              registros.reduce((acc, r) => acc + r.litrosLeche, 0) /
              registros.length
            ).toFixed(1)}{" "}
            L
          </span>
          <span>
            Total:{" "}
            {registros.reduce((acc, r) => acc + r.litrosLeche, 0).toFixed(1)} L
          </span>
        </div>
      )}
    </Card>
  );
}
