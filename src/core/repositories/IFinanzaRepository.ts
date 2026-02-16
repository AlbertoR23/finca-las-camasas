import { Transaccion } from "../entities/Transaccion";

export interface IFinanzaRepository {
  findAll(): Promise<Transaccion[]>;
  findById(id: string): Promise<Transaccion | null>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaccion[]>;
  findByTipo(tipo: "ingreso" | "gasto"): Promise<Transaccion[]>;
  create(transaccion: Transaccion): Promise<Transaccion>;
  update(id: string, transaccion: Partial<Transaccion>): Promise<Transaccion>;
  delete(id: string): Promise<void>;
  getBalance(): Promise<{ ingresos: number; gastos: number; neto: number }>;
}
