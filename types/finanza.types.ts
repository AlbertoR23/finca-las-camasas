import { Transaccion } from "@/src/core/entities/Transaccion";

export type Moneda = "VES" | "USD";
export type TipoTransaccion = "ingreso" | "gasto";

export interface BalancePorCategoria {
  categoria: string;
  monto: number;
  tipo: TipoTransaccion;
}

export interface BalanceMensual {
  mes: string;
  año: number;
  ingresos: number;
  gastos: number;
  neto: number;
}

export interface ResumenFinanciero {
  balanceTotal: {
    ingresos: number;
    gastos: number;
    neto: number;
  };
  balanceMensual: BalanceMensual[];
  topIngresos: Transaccion[];
  topGastos: Transaccion[];
}

export interface FiltrosFinanzas {
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoTransaccion;
  categoria?: string;
  minMonto?: number;
  maxMonto?: number;
}

export interface ConversionRequest {
  monto: number;
  desde: Moneda;
  hasta: Moneda;
}

export interface ConversionResponse {
  montoOriginal: number;
  monedaOriginal: Moneda;
  montoConvertido: number;
  monedaDestino: Moneda;
  tasa: number;
  fecha: Date;
}
