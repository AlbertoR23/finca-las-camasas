import React, { useState, useRef, useEffect } from "react";
import { Input } from "../../../common/Input/Input";
import { Button } from "../../../common/Button/Button";
import { Animal } from "@/src/core/entities/Animal";
import { crearFechaLocal, formatearFechaParaInput } from "@/utils/date-utils";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface VacunaFormProps {
  animales: Animal[];
  onSubmit: (data: {
    animalId: string;
    nombreVacuna: string;
    fechaAplicacion: Date;
    proximaDosis?: Date | null;
  }) => Promise<void>;
  onCancel?: () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const VACUNAS_COMUNES = [
  "Fiebre Aftosa",
  "Brucelosis",
  "Rabia Bovina",
  "Carbunco Sintomático",
  "Edema Maligno",
  "IBR / DVB",
  "Leptospirosis",
  "Clostridiosis",
  "Pasteurelosis",
  "Ántrax",
];

/** Devuelve fecha en formato YYYY-MM-DD sumando `dias` al día de hoy */
function fechaMasNDias(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().split("T")[0];
}

/** Calcula días entre dos strings YYYY-MM-DD */
function diasEntre(desde: string, hasta: string): number | null {
  if (!desde || !hasta) return null;
  const ms = new Date(hasta).getTime() - new Date(desde).getTime();
  return Math.round(ms / 86_400_000);
}

// ─── Estilos inline reutilizables ─────────────────────────────────────────────

const FIELD_BASE =
  "w-full rounded-2xl bg-white dark:bg-slate-800 border text-slate-800 dark:text-slate-200 font-medium outline-none transition-all shadow-sm focus:ring-4";
const FIELD_NORMAL = `${FIELD_BASE} border-slate-200 dark:border-slate-700 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-purple-100 dark:focus:ring-purple-900/30`;
const FIELD_ERROR = `${FIELD_BASE} border-rose-400 focus:border-rose-500 focus:ring-rose-100 animate-shake`;

// ─── Componente ───────────────────────────────────────────────────────────────

export function VacunaForm({ animales, onSubmit, onCancel }: VacunaFormProps) {
  // ── Estado (no modificar nombres) ──────────────────────────────────────────
  const [formData, setFormData] = useState({
    animalId: "",
    nombreVacuna: "",
    fechaAplicacion: formatearFechaParaInput(),
    proximaDosis: fechaMasNDias(30), // por defecto hoy + 30 días
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Estado UI adicional ────────────────────────────────────────────────────
  const [busquedaAnimal, setBusquedaAnimal] = useState("");
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [sugerenciasVacuna, setSugerenciasVacuna] = useState<string[]>([]);
  const [mostrarOpcionales, setMostrarOpcionales] = useState(false);
  const [opcionales, setOpcionales] = useState({
    lote: "",
    laboratorio: "",
    dosis: "",
    observaciones: "",
  });
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [fechasShake, setFechasShake] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Cierra dropdown al hacer clic fuera ────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownAbierto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Funciones (no modificar lógica core) ──────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFechas()) {
      setFechasShake(true);
      setTimeout(() => setFechasShake(false), 600);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        animalId: formData.animalId,
        nombreVacuna: formData.nombreVacuna,
        fechaAplicacion: crearFechaLocal(formData.fechaAplicacion),
        proximaDosis: formData.proximaDosis
          ? crearFechaLocal(formData.proximaDosis)
          : null,
      });

      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 2000);

      // Reset del formulario
      setFormData({
        animalId: "",
        nombreVacuna: "",
        fechaAplicacion: formatearFechaParaInput(),
        proximaDosis: fechaMasNDias(30),
      });
      setBusquedaAnimal("");
      setOpcionales({
        lote: "",
        laboratorio: "",
        dosis: "",
        observaciones: "",
      });
      setMostrarOpcionales(false);
    } finally {
      setSubmitting(false);
    }
  };

  const validarFechas = () => {
    if (!formData.proximaDosis) return true;
    const aplicacion = crearFechaLocal(formData.fechaAplicacion);
    const proxima = crearFechaLocal(formData.proximaDosis);
    return proxima > aplicacion;
  };

  // ── Derivados ─────────────────────────────────────────────────────────────
  const fechasValidas = validarFechas();
  const animalesOrdenados = [...animales].sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );
  const animalesFiltrados = animalesOrdenados.filter(
    (a) =>
      a.nombre.toLowerCase().includes(busquedaAnimal.toLowerCase()) ||
      a.numeroArete.toLowerCase().includes(busquedaAnimal.toLowerCase()),
  );
  const animalSeleccionado = animales.find((a) => a.id === formData.animalId);

  const diasHastaProxima = diasEntre(
    formData.fechaAplicacion,
    formData.proximaDosis,
  );
  const alertaLejanaDosis = diasHastaProxima !== null && diasHastaProxima > 365;
  const borderFechas =
    !fechasValidas || fechasShake ? FIELD_ERROR : FIELD_NORMAL;

  // ── Autocompletado de vacuna ───────────────────────────────────────────────
  const handleVacunaChange = (valor: string) => {
    setFormData({ ...formData, nombreVacuna: valor });
    setSugerenciasVacuna(
      valor.length > 0
        ? VACUNAS_COMUNES.filter((v) =>
            v.toLowerCase().includes(valor.toLowerCase()),
          )
        : [],
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Animación shake – se inyecta en <head> una sola vez */}
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        .animate-shake { animation: shake .5s ease; }
      `}</style>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ── 1. Selector de animal ─────────────────────────────────────── */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            style={{ minHeight: 56 }}
            className={`${FIELD_NORMAL} w-full flex items-center gap-3 px-4 py-3 text-left`}
            onClick={() => setDropdownAbierto((o) => !o)}
            disabled={submitting}
          >
            <span className="text-2xl">🐃</span>
            <span
              className={
                animalSeleccionado
                  ? "text-slate-800 dark:text-slate-200 font-bold"
                  : "text-slate-400 dark:text-slate-500"
              }
            >
              {animalSeleccionado
                ? `${animalSeleccionado.nombre} — #${animalSeleccionado.numeroArete}`
                : "Seleccionar animal..."}
            </span>
            <svg
              className="ml-auto w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {/* Campo hidden para validación nativa */}
          <input
            type="text"
            required
            value={formData.animalId}
            onChange={() => {}}
            className="sr-only"
            tabIndex={-1}
          />

          {dropdownAbierto && (
            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
              {/* Búsqueda */}
              <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nombre o arete..."
                  value={busquedaAnimal}
                  onChange={(e) => setBusquedaAnimal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:focus:ring-purple-900/30 text-slate-800 dark:text-slate-200"
                />
              </div>
              {/* Lista */}
              <ul className="max-h-48 overflow-y-auto">
                {animalesFiltrados.length === 0 && (
                  <li className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">
                    Sin resultados
                  </li>
                )}
                {animalesFiltrados.map((animal) => (
                  <li key={animal.id}>
                    <button
                      type="button"
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-left"
                      onClick={() => {
                        setFormData({ ...formData, animalId: animal.id ?? "" });
                        setBusquedaAnimal("");
                        setDropdownAbierto(false);
                      }}
                    >
                      <span className="text-xl">🐃</span>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {animal.nombre}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Arete #{animal.numeroArete}
                        </p>
                      </div>
                      {formData.animalId === animal.id && (
                        <svg
                          className="ml-auto w-4 h-4 text-purple-500 dark:text-purple-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── 2. Nombre de vacuna con autocompletado ────────────────────── */}
        <div className="relative">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
              💉
            </span>
            <input
              type="text"
              placeholder="Ej: Fiebre Aftosa"
              value={formData.nombreVacuna}
              onChange={(e) => handleVacunaChange(e.target.value)}
              required
              disabled={submitting}
              className={`${FIELD_NORMAL} pl-12 pr-4 py-3`}
              style={{ minHeight: 48 }}
            />
          </div>
          {sugerenciasVacuna.length > 0 && (
            <ul className="absolute z-40 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
              {sugerenciasVacuna.map((v) => (
                <li key={v}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors flex items-center gap-2 text-slate-700 dark:text-slate-200"
                    onClick={() => {
                      setFormData({ ...formData, nombreVacuna: v });
                      setSugerenciasVacuna([]);
                    }}
                  >
                    <span>💉</span> {v}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── 3 & 4. Fechas en grid con validación ─────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Fecha de aplicación */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
              📅 Aplicación
            </label>
            <input
              type="date"
              value={formData.fechaAplicacion}
              onChange={(e) =>
                setFormData({ ...formData, fechaAplicacion: e.target.value })
              }
              required
              disabled={submitting}
              className={`${fechasShake ? borderFechas : FIELD_NORMAL} w-full px-3 py-2.5 text-sm`}
            />
          </div>
          {/* Próxima dosis */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 pl-1">
              ⏰ Próxima dosis
            </label>
            <input
              type="date"
              value={formData.proximaDosis}
              onChange={(e) =>
                setFormData({ ...formData, proximaDosis: e.target.value })
              }
              disabled={submitting}
              className={`${!fechasValidas || fechasShake ? borderFechas : FIELD_NORMAL} w-full px-3 py-2.5 text-sm`}
            />
          </div>
        </div>

        {/* Error de fechas */}
        {!fechasValidas && (
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-2.5 animate-shake">
            <span className="text-lg">⚠️</span>
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
              La próxima dosis debe ser <strong>posterior</strong> a la fecha de
              aplicación
            </p>
          </div>
        )}

        {/* ── 5. Información de días hasta próxima dosis ───────────────── */}
        {fechasValidas &&
          formData.proximaDosis &&
          diasHastaProxima !== null && (
            <div
              className={`rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium ${alertaLejanaDosis ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400" : "bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800 text-purple-700 dark:text-purple-400"}`}
            >
              <span>{alertaLejanaDosis ? "⚠️" : "📆"}</span>
              <span>
                {alertaLejanaDosis
                  ? `Próxima dosis en ${diasHastaProxima} días — ¿Es correcto? Parece muy lejano.`
                  : `Próxima dosis en ${diasHastaProxima} días · Recuerde aplicar refuerzo si aplica`}
              </span>
            </div>
          )}

        {/* ── 7. Campos opcionales ──────────────────────────────────────── */}
        <div>
          <button
            type="button"
            onClick={() => setMostrarOpcionales((o) => !o)}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors flex items-center gap-1"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${mostrarOpcionales ? "rotate-90" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            {mostrarOpcionales ? "Ocultar" : "Agregar"} información adicional
            (opcional)
          </button>

          {mostrarOpcionales && (
            <div className="mt-3 space-y-3 animate-in">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 pl-1">
                    Lote
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: LT-2024-01"
                    value={opcionales.lote}
                    onChange={(e) =>
                      setOpcionales({ ...opcionales, lote: e.target.value })
                    }
                    disabled={submitting}
                    className={`${FIELD_NORMAL} w-full px-3 py-2.5 text-sm`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 pl-1">
                    Dosis (ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="Ej: 5"
                    value={opcionales.dosis}
                    onChange={(e) =>
                      setOpcionales({ ...opcionales, dosis: e.target.value })
                    }
                    disabled={submitting}
                    className={`${FIELD_NORMAL} w-full px-3 py-2.5 text-sm`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 pl-1">
                  Laboratorio
                </label>
                <input
                  type="text"
                  placeholder="Ej: MSD Salud Animal"
                  value={opcionales.laboratorio}
                  onChange={(e) =>
                    setOpcionales({
                      ...opcionales,
                      laboratorio: e.target.value,
                    })
                  }
                  disabled={submitting}
                  className={`${FIELD_NORMAL} w-full px-3 py-2.5 text-sm`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 pl-1">
                  Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Notas adicionales..."
                  value={opcionales.observaciones}
                  onChange={(e) =>
                    setOpcionales({
                      ...opcionales,
                      observaciones: e.target.value,
                    })
                  }
                  disabled={submitting}
                  className={`${FIELD_NORMAL} w-full px-3 py-2.5 text-sm resize-none`}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── 6. Botones ────────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !fechasValidas || !formData.animalId}
            style={{
              minHeight: 56,
              background:
                submitting || !fechasValidas || !formData.animalId
                  ? "#c4b5fd"
                  : "#9333EA",
            }}
            className="flex-1 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed shadow-md shadow-purple-200 dark:shadow-purple-900/50"
          >
            {submitSuccess ? (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                ¡Vacuna registrada!
              </>
            ) : submitting ? (
              <>
                {/* Spinner */}
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Guardando...
              </>
            ) : (
              <>💉 Registrar Vacuna</>
            )}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{ minHeight: 56 }}
              className="px-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
