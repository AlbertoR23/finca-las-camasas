import { IVacunaRepository } from "../../repositories/IVacunaRepository";
import { Vacuna } from "../../entities/Vacuna";

export interface AlertaVacuna {
  vacuna: Vacuna;
  animalNombre: string;
  diasVencida: number;
  mensaje: string;
}

export class VerificarVacunasVencidasUseCase {
  constructor(private vacunaRepository: IVacunaRepository) {}

  async execute(): Promise<AlertaVacuna[]> {
    const vacunas = await this.vacunaRepository.findAll();
    const alertas: AlertaVacuna[] = [];

    vacunas.forEach((vacuna) => {
      if (vacuna.estaVencida()) {
        const dias = vacuna.diasParaVencimiento() || 0;
        alertas.push({
          vacuna,
          animalNombre: vacuna.animalNombre || "Desconocido",
          diasVencida: Math.abs(dias),
          mensaje: `🚨 Vacuna ${vacuna.nombreVacuna} vencida por ${Math.abs(dias)} días`,
        });
      }
    });

    return alertas;
  }
}

export class ObtenerVacunasProximasUseCase {
  constructor(private vacunaRepository: IVacunaRepository) {}

  async execute(dias: number = 7): Promise<Vacuna[]> {
    return await this.vacunaRepository.findProximasAVencer(dias);
  }
}
