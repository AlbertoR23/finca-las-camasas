export interface AnimalProps {
  id?: string;
  nombre: string;
  numeroArete: string;
  fechaNacimiento: Date;
  sexo: "Macho" | "Hembra";
  padreId?: string | null;
  madreId?: string | null;
}

// Tipo para el JSON que se envía a Supabase
export interface AnimalJSON {
  id?: string;
  nombre: string;
  numero_arete: string;
  fecha_nacimiento: string;
  sexo: "Macho" | "Hembra";
  padre_id?: string | null;
  madre_id?: string | null;
}

export class Animal {
  public readonly id?: string;
  public readonly nombre: string;
  public readonly numeroArete: string;
  public readonly fechaNacimiento: Date;
  public readonly sexo: "Macho" | "Hembra";
  public readonly padreId?: string | null;
  public readonly madreId?: string | null;

  constructor(props: AnimalProps) {
    this.id = props.id;
    this.nombre = props.nombre;
    this.numeroArete = props.numeroArete;
    // Asegurar que fechaNacimiento es un Date y forzar mediodía
    this.fechaNacimiento =
      props.fechaNacimiento instanceof Date
        ? new Date(
            props.fechaNacimiento.getFullYear(),
            props.fechaNacimiento.getMonth(),
            props.fechaNacimiento.getDate(),
            12,
            0,
            0,
          )
        : new Date(props.fechaNacimiento);
    this.sexo = props.sexo;
    this.padreId = props.padreId;
    this.madreId = props.madreId;

    this.validate();
  }

  private validate(): void {
    if (!this.nombre || this.nombre.length < 2) {
      throw new Error("El nombre debe tener al menos 2 caracteres");
    }
    if (!this.numeroArete || this.numeroArete.length < 3) {
      throw new Error("El número de arete es requerido");
    }
    if (!this.fechaNacimiento) {
      throw new Error("La fecha de nacimiento es requerida");
    }
  }

  public calcularFechaDestete(): Date {
    const fechaDestete = new Date(this.fechaNacimiento);
    fechaDestete.setDate(fechaDestete.getDate() + 270); // 9 meses
    return new Date(
      fechaDestete.getFullYear(),
      fechaDestete.getMonth(),
      fechaDestete.getDate(),
      12,
      0,
      0,
    );
  }

  public getEdad(): {
    años: number;
    meses: number;
    dias: number;
    texto: string;
  } {
    const hoy = new Date();
    const nacimiento = this.fechaNacimiento;

    let años = hoy.getFullYear() - nacimiento.getFullYear();
    let meses = hoy.getMonth() - nacimiento.getMonth();
    let dias = hoy.getDate() - nacimiento.getDate();

    if (dias < 0) {
      meses--;
      const ultimoMes = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      dias += ultimoMes.getDate();
    }

    if (meses < 0) {
      años--;
      meses += 12;
    }

    let texto = "";
    if (años > 0) {
      texto = `${años} ${años === 1 ? "año" : "años"}`;
      if (meses > 0) texto += ` ${meses} ${meses === 1 ? "mes" : "meses"}`;
    } else if (meses > 0) {
      texto = `${meses} ${meses === 1 ? "mes" : "meses"}`;
      if (dias > 0) texto += ` ${dias} ${dias === 1 ? "día" : "días"}`;
    } else {
      texto = `${dias} ${dias === 1 ? "día" : "días"}`;
    }

    return { años, meses, dias, texto };
  }

  // ✅ VERSIÓN CORREGIDA - SIN any
  public toJSON(): AnimalJSON {
    const año = this.fechaNacimiento.getFullYear();
    const mes = String(this.fechaNacimiento.getMonth() + 1).padStart(2, "0");
    const dia = String(this.fechaNacimiento.getDate()).padStart(2, "0");

    // Crear objeto base sin id
    const json: AnimalJSON = {
      nombre: this.nombre,
      numero_arete: this.numeroArete,
      fecha_nacimiento: `${año}-${mes}-${dia}`,
      sexo: this.sexo,
      padre_id: this.padreId,
      madre_id: this.madreId,
    };

    // Solo incluir id si existe (para updates)
    if (this.id) {
      json.id = this.id;
    }

    return json;
  }

  // Método estático para crear desde Supabase
  static fromSupabase(data: {
    id: string;
    nombre: string;
    numero_arete: string;
    fecha_nacimiento: string;
    sexo: "Macho" | "Hembra";
    padre_id?: string | null;
    madre_id?: string | null;
  }): Animal {
    // Forzar mediodía al crear la fecha
    const fechaStr = data.fecha_nacimiento;
    let fecha: Date;

    if (typeof fechaStr === "string") {
      // Si viene como string YYYY-MM-DD, agregar T12:00:00
      fecha = new Date(fechaStr + "T12:00:00");
    } else {
      // Si ya es Date, ajustar a mediodía
      fecha = new Date(fechaStr);
      fecha = new Date(
        fecha.getFullYear(),
        fecha.getMonth(),
        fecha.getDate(),
        12,
        0,
        0,
      );
    }

    return new Animal({
      id: data.id,
      nombre: data.nombre,
      numeroArete: data.numero_arete,
      fechaNacimiento: fecha,
      sexo: data.sexo,
      padreId: data.padre_id,
      madreId: data.madre_id,
    });
  }
}
