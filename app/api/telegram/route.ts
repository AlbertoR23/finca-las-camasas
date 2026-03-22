import { NextResponse } from "next/server";
import { TelegramService } from "@/src/infrastructure/services/telegram/telegram.service";
export const dynamic = "force-static";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, chatId } = body;

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          error: "El mensaje es requerido",
        },
        { status: 400 },
      );
    }

    const telegramService = TelegramService.getInstance();
    const enviado = await telegramService.enviarMensaje({
      text: message,
      chatId,
    });

    if (enviado) {
      return NextResponse.json({
        success: true,
        message: "Mensaje enviado correctamente",
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Error al enviar el mensaje",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error en API Telegram:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const texto = searchParams.get("texto");

  if (!texto) {
    return NextResponse.json(
      {
        success: false,
        error: "El texto es requerido",
      },
      { status: 400 },
    );
  }

  const telegramService = TelegramService.getInstance();
  const link = telegramService.generarLinkCompartir(texto);

  return NextResponse.json({
    success: true,
    data: {
      link,
      texto,
    },
  });
}

// Webhook para recibir mensajes de Telegram (opcional)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log("Mensaje recibido de Telegram:", body);

    // Aquí puedes procesar los mensajes entrantes
    // Por ejemplo, responder a comandos como /stats, /alertas, etc.

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error en webhook de Telegram:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
