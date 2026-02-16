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

    return (
      <Card
        key={vacuna.id}
        variant={estaVencida ? "outlined" : "default"}
        className={`border ${estaVencida ? "border-rose-200 bg-rose-50" : "border-slate-100"}`}
        padding="sm"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
              {vacuna.animalNombre || "Animal desconocido"} • Aplicada:{" "}
              {formatearFecha(vacuna.fechaAplicacion)}
            </p>
            <h4
              className={`font-black text-sm mt-0.5 ${
                estaVencida ? "text-rose-600" : "text-slate-800"
              }`}
            >
              {vacuna.nombreVacuna}
            </h4>
            {vacuna.proximaDosis && (
              <p
                className={`text-[10px] font-bold mt-1 flex items-center gap-1 ${
                  estaVencida ? "text-rose-600 animate-pulse" : "text-slate-500"
                }`}
              >
                {estaVencida ? (
                  <>
                    <span>⚠️</span>
                    VENCIDA: {formatearFecha(vacuna.proximaDosis)}
                    {dias && ` (hace ${Math.abs(dias)} días)`}
                  </>
                ) : (
                  <>
                    <span>📅</span>
                    Próxima: {formatearFecha(vacuna.proximaDosis)}
                    {dias && dias <= 7 && (
                      <span className="text-amber-600 ml-1">
                        (en {dias} días)
                      </span>
                    )}
                  </>
                )}
              </p>
            )}
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEnviarAlerta(vacuna)}
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
            >
              ✕
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (vacunas.length === 0) {
    return (
      <Card className="text-center py-8">
        <p className="text-slate-400 font-bold">No hay vacunas registradas</p>
        <p className="text-[10px] text-slate-300 mt-2">
          Registra la primera vacuna en el formulario
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vacunas vencidas (destacadas) */}
      {vacunasVencidas.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-600 rounded-full animate-pulse" />
            VACUNAS VENCIDAS ({vacunasVencidas.length})
          </p>
          {vacunasVencidas.map((v) => (
            <VacunaItem key={v.id} vacuna={v} />
          ))}
        </div>
      )}

      {/* Todas las vacunas */}
      <div className="space-y-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
          HISTORIAL COMPLETO ({vacunas.length})
        </p>
        {vacunas
          .filter((v) => !vacunasVencidas.some((vv) => vv.id === v.id))
          .map((v) => (
            <VacunaItem key={v.id} vacuna={v} />
          ))}
      </div>
    </div>
  );
}
