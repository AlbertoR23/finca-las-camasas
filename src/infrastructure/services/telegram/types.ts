export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

export interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

export interface AlertaVacunaTelegram {
  animalId: string;
  animalNombre: string;
  vacunaId: string;
  vacunaNombre: string;
  fechaProxima: Date;
  tipo: "vencida" | "proxima";
  dias?: number;
}
