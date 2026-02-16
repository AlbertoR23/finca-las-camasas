export interface DolarAPIResponse {
  moneda: string;
  nombre: string;
  promedio: number;
  fecha: string;
}

export interface TasaBCV {
  value: number;
  fecha: Date;
  origen: "api" | "local" | "default";
}

export interface ConversionRequest {
  monto: number;
  desde: "VES" | "USD";
  hasta: "VES" | "USD";
  tasa?: number;
}
