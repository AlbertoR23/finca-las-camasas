import React from "react";
import { Vacuna } from "@/src/core/entities/Vacuna";
import { Button } from "../../../common/Button/Button";
import { Card } from "../../../common/Card/Card";

interface VacunaListProps {
  vacunas: Vacuna[];
  vacunasVencidas: Vacuna[];
  onEliminar: (id: string) => Promise<void>;
  onEnviarAlerta: (vacuna: Vacuna) => Promise<void>;
}

export function VacunaList({
  vacunas,
  vacunasVencidas,
  onEliminar,
  onEnviarAlerta,
}: VacunaListProps) {
  const formatearFecha = (fecha: Date) => {
    return fecha.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const VacunaItem = ({ vacuna }: { vacuna: Vacuna }) => {
    const estaVencida = vacuna.estaVencida();
    const dias = vacuna.diasParaVencimiento();
    const proximaAVencer = dias !== null && dias <= 7 && dias > 0;

    return (
      <Card
        key={vacuna.id}
        variant="default"
        className={`
          border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5
          ${
            estaVencida
              ? "border-rose-400 bg-rose-50 shadow-md shadow-rose-100"
              : proximaAVencer
              ? "border-amber-300 bg-amber-50 shadow-md shadow-amber-100"
              : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
          }
        `}
        padding="sm"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Encabezado con nombre del animal */}
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider truncate">
              {vacuna.animalNombre || "Animal desconocido"}
            </p>

            {/* Nombre de la vacuna con badge de estado */}
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {estaVencida && (
                <span className="animate-pulse text-base leading-none">
                  🚨
                </span>
              )}
              {proximaAVencer && !estaVencida && (
                <span className="text-base leading-none">⚠️</span>
              )}
              <h4
                className={`font-black text-sm ${
                  estaVencida
                    ? "text-rose-700"
                    : proximaAVencer
                    ? "text-amber-700"
                    : "text-slate-800"
                }`}
              >
                {vacuna.nombreVacuna}
              </h4>
            </div>

            {/* Información de fechas */}
            <div className="mt-2 space-y-1">
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span>💉</span>
                <span className="font-semibold">Aplicada:</span>
                <span className="font-bold">
                  {formatearFecha(vacuna.fechaAplicacion)}
                </span>
              </p>

              {vacuna.proximaDosis && (
                <div
                  className={`
                    text-[10px] font-bold flex items-center gap-1.5 rounded-md px-2 py-1.5
                    ${
                      estaVencida
                        ? "bg-rose-100 text-rose-700"
                        : proximaAVencer
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }
                  `}
                >
                  {estaVencida ? (
                    <>
                      <span className="text-sm">🚨</span>
                      <span className="font-black uppercase">VENCIDA:</span>
                      <span>{formatearFecha(vacuna.proximaDosis)}</span>
                      {dias && (
                        <span className="ml-1 px-1.5 py-0.5 bg-rose-200 rounded-full font-black text-[9px]">
                          HACE {Math.abs(dias)} DÍAS
                        </span>
                      )}
                    </>
                  ) : proximaAVencer ? (
                    <>
                      <span className="text-sm">⏰</span>
                      <span className="font-black uppercase">Urgente:</span>
                      <span>{formatearFecha(vacuna.proximaDosis)}</span>
                      <span className="ml-1 px-1.5 py-0.5 bg-amber-200 rounded-full font-black text-[9px]">
                        {dias} DÍAS
                      </span>
                    </>
                  ) : (
                    <>
                      <span>📅</span>
                      <span className="font-semibold">Próxima:</span>
                      <span>{formatearFecha(vacuna.proximaDosis)}</span>
                      {dias && dias <= 30 && (
                        <span className="ml-1 text-slate-500">
                          (en {dias} días)
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col gap-1.5 ml-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEnviarAlerta(vacuna)}
              className="
                hover:scale-105 active:scale-95 transition-transform
                bg-blue-50 hover:bg-blue-100 text-blue-600 border-blue-200
                font-bold text-xs px-2.5 py-1.5
              "
            >
              ✈️
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                if (confirm("¿Eliminar esta vacuna?")) {
                  onEliminar(vacuna.id!);
                }
              }}
              className="
                bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600
                border-slate-200 hover:border-rose-300 transition-colors
                font-bold text-xs px-2.5 py-1.5
              "
            >
              ✕
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  // Estado vacío
  if (vacunas.length === 0) {
    return (
      <Card className="text-center py-12 border-2 border-dashed border-slate-200">
        <div className="text-4xl mb-3">💉</div>
        <p className="text-slate-500 font-bold text-sm">
          No hay vacunas registradas
        </p>
        <p className="text-[11px] text-slate-400 mt-2">
          Registra la primera vacuna usando el formulario de arriba
        </p>
      </Card>
    );
  }

  // Separar vacunas por estado
  const vacunasProximas = vacunas.filter((v) => {
    const dias = v.diasParaVencimiento();
    return dias !== null && dias <= 7 && dias > 0 && !v.estaVencida();
  });

  const vacunasNormales = vacunas.filter((v) => {
    const dias = v.diasParaVencimiento();
    return (
      !v.estaVencida() &&
      (dias === null || dias > 7) &&
      !vacunasVencidas.some((vv) => vv.id === v.id)
    );
  });

  return (
    <div className="space-y-6">
      {/* SECCIÓN: Vacunas vencidas (máxima prioridad) */}
      {vacunasVencidas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-rose-200">
            <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-lg shadow-rose-300" />
            <p className="text-xs font-black text-rose-600 uppercase tracking-wider">
              🚨 Vacunas Vencidas
            </p>
            <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {vacunasVencidas.length}
            </span>
          </div>
          <div className="space-y-2">
            {vacunasVencidas.map((v) => (
              <VacunaItem key={v.id} vacuna={v} />
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN: Vacunas próximas a vencer (7 días o menos) */}
      {vacunasProximas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-amber-200">
            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-md shadow-amber-300" />
            <p className="text-xs font-black text-amber-600 uppercase tracking-wider">
              ⚠️ Próximas a Vencer
            </p>
            <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {vacunasProximas.length}
            </span>
          </div>
          <div className="space-y-2">
            {vacunasProximas.map((v) => (
              <VacunaItem key={v.id} vacuna={v} />
            ))}
          </div>
        </div>
      )}

      {/* SECCIÓN: Vacunas normales (al día) */}
      {vacunasNormales.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pb-2 border-b-2 border-slate-200">
            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">
              ✅ Al Día
            </p>
            <span className="ml-auto bg-slate-200 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded-full">
              {vacunasNormales.length}
            </span>
          </div>
          <div className="space-y-2">
            {vacunasNormales.map((v) => (
              <VacunaItem key={v.id} vacuna={v} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}