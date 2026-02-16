import { Transaccion, TransaccionProps } from "../../entities/Transaccion";
import { IFinanzaRepository } from "../../repositories/IFinanzaRepository";
import { BCVService } from "@/src/infrastructure/services/bcv/bcv.service";

interface CrearTransaccionRequest {
  tipo: "ingreso" | "gasto";
  categoria: string;
  monto: number;
  descripcion?: string;
  moneda: "VES" | "USD";
  fecha?: Date;
}

export class CrearTransaccionUseCase {
  private bcvService = BCVService.getInstance();

  constructor(private finanzaRepository: IFinanzaRepository) {}

  async execute(request: CrearTransaccionRequest): Promise<Transaccion> {
    const { tipo, categoria, monto, descripcion, moneda, fecha } = request;

    let montoFinal = monto;
    let descripcionFinal = descripcion || "";

    // Si es USD, convertir a VES
    if (moneda === "USD") {
      const tasa = await this.bcvService.obtenerTasa();
      montoFinal = this.bcvService.convertirABolivares(monto, tasa.value);
      descripcionFinal = `${descripcion} [Orig: USD ${monto} @ ${tasa.value}]`;
    }

    const transaccion = new Transaccion({
      tipo,
      categoria,
      monto: montoFinal,
      descripcion: descripcionFinal,
      fecha: fecha || new Date(),
      monedaOriginal: moneda === "USD" ? "USD" : undefined,
      montoOriginal: moneda === "USD" ? monto : undefined,
    });

    return await this.finanzaRepository.create(transaccion);
  }
}
