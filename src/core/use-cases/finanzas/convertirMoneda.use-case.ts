import { BCVService } from "@/src/infrastructure/services/bcv/bcv.service";

export type Moneda = "VES" | "USD";

export class ConvertirMonedaUseCase {
  private bcvService = BCVService.getInstance();

  async execute(monto: number, desde: Moneda, hasta: Moneda): Promise<number> {
    if (desde === hasta) return monto;

    const tasa = await this.bcvService.obtenerTasa();

    if (desde === "VES" && hasta === "USD") {
      return this.bcvService.convertirADolares(monto, tasa.value);
    } else {
      return this.bcvService.convertirABolivares(monto, tasa.value);
    }
  }
}
