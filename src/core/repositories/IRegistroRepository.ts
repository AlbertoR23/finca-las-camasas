import { RegistroProduccion } from "../entities/RegistroProduccion";

export interface IRegistroRepository {
  findAll(): Promise<RegistroProduccion[]>;
  findById(id: string): Promise<RegistroProduccion | null>;
  findByAnimalId(animalId: string): Promise<RegistroProduccion[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<RegistroProduccion[]>;
  create(registro: RegistroProduccion): Promise<RegistroProduccion>;
  update(
    id: string,
    registro: Partial<RegistroProduccion>,
  ): Promise<RegistroProduccion>;
  delete(id: string): Promise<void>;
  getProduccionPromedio(animalId: string, days?: number): Promise<number>;
}
