import { NextResponse } from "next/server";
import { BCVService } from "@/src/infrastructure/services/bcv/bcv.service";
export const dynamic = "force-static";
export async function GET() {
  try {
    const bcvService = BCVService.getInstance();
    const tasa = await bcvService.obtenerTasa();

    return NextResponse.json({
      success: true,
      data: {
        value: tasa.value,
        fecha: tasa.fecha,
        origen: tasa.origen,
      },
    });
  } catch (error) {
    console.error("Error en API BCV:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al obtener la tasa del BCV",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { monto, desde, hasta } = body;

    if (!monto || !desde || !hasta) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan parámetros requeridos",
        },
        { status: 400 },
      );
    }

    const bcvService = BCVService.getInstance();
    const tasa = await bcvService.obtenerTasa();

    let resultado: number;
    if (desde === "VES" && hasta === "USD") {
      resultado = bcvService.convertirADolares(monto, tasa.value);
    } else if (desde === "USD" && hasta === "VES") {
      resultado = bcvService.convertirABolivares(monto, tasa.value);
    } else {
      resultado = monto;
    }

    return NextResponse.json({
      success: true,
      data: {
        montoOriginal: monto,
        monedaOriginal: desde,
        montoConvertido: resultado,
        monedaDestino: hasta,
        tasaUsada: tasa.value,
        fechaTasa: tasa.fecha,
      },
    });
  } catch (error) {
    console.error("Error en conversión:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Error al realizar la conversión",
      },
      { status: 500 },
    );
  }
}
