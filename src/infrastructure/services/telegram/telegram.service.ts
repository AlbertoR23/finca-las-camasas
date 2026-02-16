export interface TelegramMessage {
  text: string;
  chatId?: string;
}

export interface AlertaVacuna {
  animalNombre: string;
  vacunaNombre: string;
  fechaVencimiento: Date;
  diasVencida?: number;
}

export class TelegramService {
  private static instance: TelegramService;
  private readonly TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private readonly TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  private constructor() {}

  static getInstance(): TelegramService {
    if (!TelegramService.instance) {
      TelegramService.instance = new TelegramService();
    }
    return TelegramService.instance;
  }

  async enviarMensaje(mensaje: TelegramMessage): Promise<boolean> {
    if (!this.TELEGRAM_BOT_TOKEN || !this.TELEGRAM_CHAT_ID) {
      console.warn("Telegram no configurado");
      return false;
    }

    try {
      const url = `https://api.telegram.org/bot${this.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: mensaje.chatId || this.TELEGRAM_CHAT_ID,
          text: mensaje.text,
          parse_mode: "HTML",
        }),
      });

      return response.ok;
    } catch (error) {
      console.error("Error enviando mensaje a Telegram:", error);
      return false;
    }
  }

  async enviarAlertaVacuna(alerta: AlertaVacuna): Promise<boolean> {
    const emoji = alerta.diasVencida ? "🚨" : "⚠️";
    const estado = alerta.diasVencida
      ? `VENCIDA hace ${alerta.diasVencida} días`
      : "PRÓXIMA A VENCER";

    const mensaje = `
  ${emoji} <b>ALERTA SANITARIA</b> ${emoji}
  
  <b>Animal:</b> ${alerta.animalNombre}
  <b>Vacuna:</b> ${alerta.vacunaNombre}
  <b>Estado:</b> ${estado}
  <b>Fecha:</b> ${alerta.fechaVencimiento.toLocaleDateString("es-VE")}
  
  Por favor, tome las medidas necesarias.
      `;

    return this.enviarMensaje({ text: mensaje });
  }

  generarLinkCompartir(texto: string): string {
    return `https://t.me/share/url?url=${encodeURIComponent(texto)}`;
  }
}
