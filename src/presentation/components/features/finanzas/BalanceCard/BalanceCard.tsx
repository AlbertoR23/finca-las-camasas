import React from "react";
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
}

export function BalanceCard({
  balance,
  tasa,
  verEnDolares,
  onToggleMoneda,
  className = "",
}: BalanceCardProps) {
  // ✅ Lógica de cálculos mantenida sin cambios
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

  // 🎨 Colores dinámicos más vibrantes para balance
  const colorBalance = balance.neto >= 0 
    ? "text-emerald-500" 
    : "text-rose-500";
  
  const bgGradient = balance.neto >= 0
    ? "from-emerald-500/10 via-emerald-400/5 to-transparent"
    : "from-rose-500/10 via-rose-400/5 to-transparent";

  // 📊 Cálculo para gráfico de producción (visual)
  const totalFlujo = balance.ingresos + Math.abs(balance.gastos);
  const porcentajeIngresos = totalFlujo > 0 ? (balance.ingresos / totalFlujo) * 100 : 50;

  return (
    <Card 
      className={`
        ${className}
        relative overflow-hidden
        bg-gradient-to-br from-white via-slate-50/50 to-white
        backdrop-blur-sm
        border-2 border-slate-100/50
        shadow-xl shadow-slate-200/50
        hover:shadow-2xl hover:shadow-slate-300/50
        transition-all duration-500 ease-out
      `}
    >
      {/* 🌟 Fondo decorativo con gradiente animado */}
      <div 
        className={`
          absolute inset-0 bg-gradient-to-br ${bgGradient}
          opacity-50 transition-opacity duration-700
        `}
      />
      
      {/* 📦 Contenido principal */}
      <div className="relative z-10">
        {/* 🎯 Header con botón toggle mejorado */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">
              Balance Neto
            </p>
            <div className="h-1 w-12 bg-gradient-to-r from-slate-300 to-transparent rounded-full" />
          </div>
          
          {/* 🔄 Botón switch mejorado con micro-interacción */}
          <button
            onClick={onToggleMoneda}
            className={`
              relative px-5 py-2.5 rounded-full font-bold text-xs
              transition-all duration-300 ease-out
              transform active:scale-95
              shadow-lg hover:shadow-xl
              ${verEnDolares 
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-200' 
                : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-slate-200'
              }
            `}
          >
            <span className="flex items-center gap-2">
              <span className="text-[10px] tracking-wider">
                {verEnDolares ? "VER EN BS" : "VER EN USD"}
              </span>
              <span className={`
                inline-block transition-transform duration-300
                ${verEnDolares ? 'rotate-180' : 'rotate-0'}
              `}>
                ⇄
              </span>
            </span>
          </button>
        </div>

        {/* 💰 Balance principal - GRANDE Y DESTACADO */}
        <div className="mb-6">
          <h3
            className={`
              text-6xl lg:text-7xl font-black mb-3
              tracking-tighter leading-none
              transition-all duration-500 ease-out
              ${colorBalance}
              drop-shadow-sm
            `}
            style={{
              textShadow: balance.neto >= 0 
                ? '0 2px 20px rgba(16, 185, 129, 0.15)' 
                : '0 2px 20px rgba(244, 63, 94, 0.15)'
            }}
          >
            {simbolo} {formatoMonto(balanceMostrar)}
          </h3>
          
          {/* 📈 Barra de progreso visual animada */}
          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`
                absolute top-0 left-0 h-full rounded-full
                transition-all duration-700 ease-out
                ${balance.neto >= 0 
                  ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600'
                }
              `}
              style={{ width: `${Math.min(Math.abs(balance.neto / balance.ingresos * 100), 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/30 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 💎 Separador visual elegante */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-slate-200/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white text-xs font-black text-slate-300 uppercase tracking-widest">
              Detalle
            </span>
          </div>
        </div>

        {/* 💹 Grid de ingresos y gastos con glassmorphism */}
        <div className="grid grid-cols-2 gap-5">
          {/* ✅ Ingresos */}
          <div 
            className="
              relative p-5 rounded-2xl overflow-hidden
              bg-gradient-to-br from-emerald-50 via-emerald-50/80 to-emerald-100/50
              border border-emerald-200/50
              shadow-lg shadow-emerald-100/50
              hover:shadow-xl hover:shadow-emerald-200/50
              transition-all duration-300
              backdrop-blur-sm
            "
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-300/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">
                  Ingresos
                </p>
              </div>
              <p className="text-2xl font-black text-emerald-700 tracking-tight">
                {simbolo} {formatoMonto(ingresosMostrar)}
              </p>
            </div>
          </div>

          {/* ❌ Gastos */}
          <div 
            className="
              relative p-5 rounded-2xl overflow-hidden
              bg-gradient-to-br from-rose-50 via-rose-50/80 to-rose-100/50
              border border-rose-200/50
              shadow-lg shadow-rose-100/50
              hover:shadow-xl hover:shadow-rose-200/50
              transition-all duration-300
              backdrop-blur-sm
            "
          >
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-300/20 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                <p className="text-[9px] font-black text-rose-600 uppercase tracking-wider">
                  Gastos
                </p>
              </div>
              <p className="text-2xl font-black text-rose-700 tracking-tight">
                {simbolo} {formatoMonto(gastosMostrar)}
              </p>
            </div>
          </div>
        </div>

        {/* 📊 Gráfico visual de distribución (área degradada) */}
        <div className="mt-6 p-4 bg-slate-50/50 rounded-xl border border-slate-200/30">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-3">
            Distribución de Flujo
          </p>
          <div className="relative h-16 flex items-end gap-1">
            {/* Barra de ingresos */}
            <div 
              className="flex-1 bg-gradient-to-t from-emerald-500 via-emerald-400 to-emerald-300 rounded-t-lg transition-all duration-700 shadow-lg"
              style={{ height: `${porcentajeIngresos}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse" />
            </div>
            {/* Barra de gastos */}
            <div 
              className="flex-1 bg-gradient-to-t from-rose-500 via-rose-400 to-rose-300 rounded-t-lg transition-all duration-700 shadow-lg"
              style={{ height: `${100 - porcentajeIngresos}%` }}
            >
              <div className="h-full bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* 💱 Tasa BCV - Discreta pero visible */}
        <div className="mt-6 pt-4 border-t-2 border-slate-100">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em]">
              Tasa BCV
            </p>
            <p className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              Bs {tasa.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}