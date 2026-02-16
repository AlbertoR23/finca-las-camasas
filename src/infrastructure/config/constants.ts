export const APP_CONFIG = {
  name: "DataVE Búfalos",
  version: "1.0.0",
  defaultTasaBCV: 311.88,
  diasDestete: 270, // 9 meses
  alertaVacunasDias: 7,
  maxRegistrosGrafica: 30,
  monedaSimbolos: {
    VES: "Bs",
    USD: "$",
  },
} as const;

export const SUPABASE_TABLES = {
  ANIMALES: "animales",
  CONTABILIDAD: "contabilidad",
  REGISTROS_DIARIOS: "registros_diarios",
  VACUNAS: "vacunas",
} as const;

export const TELEGRAM_CONFIG = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  chatId: process.env.TELEGRAM_CHAT_ID,
} as const;

export const CATEGORIAS = {
  GASTOS: ["Nomina", "Alimento", "Medicina", "Otros"] as const,
  INGRESOS: ["Venta Queso", "Venta Leche", "Venta Animal"] as const,
} as const;

export const ERROR_MESSAGES = {
  ANIMAL: {
    REQUIRED: "El nombre es requerido",
    ARETE_REQUIRED: "El número de arete es requerido",
    FECHA_REQUIRED: "La fecha de nacimiento es requerida",
  },
  VACUNA: {
    ANIMAL_REQUIRED: "Debe seleccionar un animal",
    NOMBRE_REQUIRED: "El nombre de la vacuna es requerido",
    FECHA_REQUIRED: "La fecha de aplicación es requerida",
  },
  FINANZA: {
    MONTO_INVALIDO: "El monto debe ser mayor a cero",
    CATEGORIA_REQUIRED: "La categoría es requerida",
  },
} as const;
