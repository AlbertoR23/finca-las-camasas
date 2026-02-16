import { IFinanzaRepository } from "../../repositories/IFinanzaRepository";

export interface Balance {
  ingresos: number;
  gastos: number;
  neto: number;
  ingresosPorCategoria: Record<string, number>;
  gastosPorCategoria: Record<string, number>;
}

export class ObtenerBalanceUseCase {
  constructor(private finanzaRepository: IFinanzaRepository) {}

  async execute(): Promise<Balance> {
    const transacciones = await this.finanzaRepository.findAll();

    const balance: Balance = {
      ingresos: 0,
      gastos: 0,
      neto: 0,
      ingresosPorCategoria: {},
      gastosPorCategoria: {},
    };

    transacciones.forEach((t) => {
      if (t.esIngreso()) {
        balance.ingresos += t.monto;
        balance.ingresosPorCategoria[t.categoria] =
          (balance.ingresosPorCategoria[t.categoria] || 0) + t.monto;
      } else {
        balance.gastos += t.monto;
        balance.gastosPorCategoria[t.categoria] =
          (balance.gastosPorCategoria[t.categoria] || 0) + t.monto;
      }
    });

    balance.neto = balance.ingresos - balance.gastos;
    return balance;
  }
}
