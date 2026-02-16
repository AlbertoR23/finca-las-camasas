export type TipoTransaccion = "ingreso" | "gasto";
export type CategoriaGasto = "Nomina" | "Alimento" | "Medicina" | "Otros";
export type CategoriaIngreso = "Venta Queso" | "Venta Leche" | "Venta Animal";

export interface TransaccionProps {
  id?: string;
  tipo: TipoTransaccion;
  categoria: string;
  monto: number;
  descripcion?: string;
  fecha: Date;
  monedaOriginal?: "VES" | "USD";
  montoOriginal?: number;
}

export class Transaccion {
  public readonly id?: string;
  public readonly tipo: TipoTransaccion;
  public readonly categoria: string;
  public readonly monto: number;
  public readonly descripcion: string;
  public readonly fecha: Date;
  public readonly monedaOriginal?: "VES" | "USD";
  public readonly montoOriginal?: number;

  constructor(props: TransaccionProps) {
    this.id = props.id;
    this.tipo = props.tipo;
    this.categoria = props.categoria;
    this.monto = props.monto;
    this.descripcion = props.descripcion || "";
    this.fecha = props.fecha || new Date();
    this.monedaOriginal = props.monedaOriginal;
    this.montoOriginal = props.montoOriginal;

    this.validate();
  }

  private validate(): void {
    if (!this.tipo || !["ingreso", "gasto"].includes(this.tipo)) {
      throw new Error("Tipo de transacción inválido");
    }
    if (!this.categoria) {
      throw new Error("La categoría es requerida");
    }
    if (this.monto <= 0) {
      throw new Error("El monto debe ser mayor a cero");
    }
  }

  public esIngreso(): boolean {
    return this.tipo === "ingreso";
  }

  public esGasto(): boolean {
    return this.tipo === "gasto";
  }

  public toJSON() {
    return {
      id: this.id,
      tipo: this.tipo,
      categoria: this.categoria,
      monto: this.monto,
      descripcion: this.descripcion,
      fecha: this.fecha.toISOString(),
      monedaOriginal: this.monedaOriginal,
      montoOriginal: this.montoOriginal,
    };
  }
}
