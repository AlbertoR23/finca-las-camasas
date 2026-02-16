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

  const colorBalance = balance.neto >= 0 ? "text-emerald-600" : "text-rose-600";

  return (
    <Card className={className}>
      <div className="flex justify-between items-center mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Balance Neto
        </p>
        <Button
          variant={verEnDolares ? "success" : "secondary"}
          size="sm"
          onClick={onToggleMoneda}
        >
          {verEnDolares ? "VER EN BS ↺" : "VER EN USD ⇄"}
        </Button>
      </div>

      <h3
        className={`text-5xl font-black mb-2 tracking-tight transition-colors duration-300 ${colorBalance}`}
      >
        {simbolo} {formatoMonto(balanceMostrar)}
      </h3>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-emerald-50 p-4 rounded-2xl">
          <p className="text-[8px] font-black text-emerald-600 uppercase">
            Ingresos
          </p>
          <p className="text-lg font-black text-emerald-700">
            {simbolo} {formatoMonto(ingresosMostrar)}
          </p>
        </div>
        <div className="bg-rose-50 p-4 rounded-2xl">
          <p className="text-[8px] font-black text-rose-600 uppercase">
            Gastos
          </p>
          <p className="text-lg font-black text-rose-700">
            {simbolo} {formatoMonto(gastosMostrar)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
          Tasa BCV: Bs {tasa.toFixed(2)}
        </p>
      </div>
    </Card>
  );
}
