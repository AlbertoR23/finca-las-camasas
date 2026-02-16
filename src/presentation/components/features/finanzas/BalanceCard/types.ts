export interface BalanceData {
  ingresos: number;
  gastos: number;
  neto: number;
  ingresosPorCategoria?: Record<string, number>;
  gastosPorCategoria?: Record<string, number>;
}

export interface BalanceCardProps {
  balance: BalanceData;
  tasa: number;
  verEnDolares: boolean;
  onToggleMoneda: () => void;
  onVerDetalle?: () => void;
}
