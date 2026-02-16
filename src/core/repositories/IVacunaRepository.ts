import { Vacuna } from "../entities/Vacuna";

export interface IVacunaRepository {
  findAll(): Promise<Vacuna[]>;
  findById(id: string): Promise<Vacuna | null>;
  findByAnimalId(animalId: string): Promise<Vacuna[]>;
  findVencidas(): Promise<Vacuna[]>;
  findProximasAVencer(dias: number): Promise<Vacuna[]>;
  create(vacuna: Vacuna): Promise<Vacuna>;
  update(id: string, vacuna: Partial<Vacuna>): Promise<Vacuna>;
  delete(id: string): Promise<void>;
}
