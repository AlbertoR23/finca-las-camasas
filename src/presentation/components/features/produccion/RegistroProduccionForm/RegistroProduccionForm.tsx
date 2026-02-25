import React, { useState } from "react";
import { Input } from "../../../common/Input/Input";
import { Button } from "../../../common/Button/Button";
import { Animal } from "@/src/core/entities/Animal";
import { crearFechaLocal, formatearFechaParaInput } from "@/utils/date-utils";

interface RegistroProduccionFormProps {
  animales: Animal[];
  onSubmit: (data: {
    animalId: string;
    litros?: number;
    peso?: number;
    fecha?: Date;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function RegistroProduccionForm({
  animales,
  onSubmit,
  onCancel,
}: RegistroProduccionFormProps) {
  const [formData, setFormData] = useState({
    animalId: "",
    litros: "",
    peso: "",
    fecha: formatearFechaParaInput(),
  });
  const [submitting, setSubmitting] = useState(false);

  // ── Estado de UI ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [litrosFocused, setLitrosFocused] = useState(false);
  const [pesoFocused, setPesoFocused] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // ── Lógica existente (sin modificar) ─────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    try {
      await onSubmit({
        animalId: formData.animalId,
        litros: formData.litros ? parseFloat(formData.litros) : undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        fecha: crearFechaLocal(formData.fecha),
      });

      // Feedback de éxito
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 1500);

      // Reset del formulario
      setFormData({
        animalId: "",
        litros: "",
        peso: "",
        fecha: formatearFechaParaInput(),
      });
      setSearchQuery("");
    } catch {
      // Animación de error (shake)
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 600);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers de fecha ──────────────────────────────────────────────────────
  const hoy = formatearFechaParaInput();
  const ayer = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();

  // ── Selector de animal con búsqueda ───────────────────────────────────────
  const animalesFiltrados = [...animales]
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
    .filter((a) => {
      const q = searchQuery.toLowerCase();
      return (
        a.nombre.toLowerCase().includes(q) ||
        (a.numeroArete ?? "").toLowerCase().includes(q)
      );
    });

  const animalSeleccionado = animales.find((a) => a.id === formData.animalId);

  // Agrupar por sexo / categoría para el dropdown
  const grupos: Record<string, Animal[]> = {};
  animalesFiltrados.forEach((a) => {
    const grupo = (a as any).sexo ?? (a as any).categoria ?? "Otros";
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(a);
  });

  // ── Helpers de campo numérico ─────────────────────────────────────────────
  const incrementar = (campo: "litros" | "peso", delta: number) => {
    setFormData((prev) => {
      const actual = parseFloat(prev[campo] || "0");
      const nuevo = Math.max(0, parseFloat((actual + delta).toFixed(1)));
      return { ...prev, [campo]: String(nuevo) };
    });
  };

  // ── Clases de estado de campo ─────────────────────────────────────────────
  const claseCampoNumerico = (valor: string, focused: boolean): string => {
    const base =
      "relative flex flex-col gap-1 rounded-2xl p-3 border-2 transition-all duration-200 bg-white shadow-sm";
    if (focused)
      return `${base} border-blue-500 ring-4 ring-blue-100 scale-[1.02]`;
    if (valor) return `${base} border-emerald-400`;
    return `${base} border-slate-200`;
  };

  // Validación
  const sinDatos = !formData.litros && !formData.peso;
  const sinAnimal = !formData.animalId;
  const deshabilitado = submitting || sinDatos || sinAnimal;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Estilos inline para animaciones ── */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes successPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .form-shake { animation: shake 0.5s ease; }
        .form-success { animation: successPop 0.4s ease; }
        .spinner {
          width: 18px; height: 18px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .quick-btn {
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 999px;
          border: 1.5px solid #CBD5E1;
          color: #475569;
          background: white;
          cursor: pointer;
          transition: all 0.15s;
        }
        .quick-btn:hover { background: #F1F5F9; border-color: #94A3B8; }
        .quick-btn:active { transform: scale(0.95); }
        .dropdown-item {
          display: flex; align-items: center; gap-10px;
          padding: 10px 14px; cursor: pointer;
          font-size: 14px; color: #1E293B;
          transition: background 0.1s;
        }
        .dropdown-item:hover { background: #EFF6FF; }
        .dropdown-item.selected { background: #DBEAFE; font-weight: 700; }
      `}</style>

      <form
        onSubmit={handleSubmit}
        className={`space-y-4 ${submitError ? "form-shake" : ""} ${submitSuccess ? "form-success" : ""}`}
      >
        {/* ── 1. Selector de animal con búsqueda (typeahead) ── */}
        <div className="relative">
          {/* Trigger del dropdown */}
          <button
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            disabled={submitting}
            className={`
              w-full flex items-center gap-3 p-4 rounded-2xl border-2 bg-white shadow-sm
              text-left transition-all duration-200 min-h-[56px]
              ${dropdownOpen ? "border-blue-500 ring-4 ring-blue-100" : animalSeleccionado ? "border-emerald-400" : "border-slate-200"}
            `}
          >
            {/* Avatar del animal */}
            {animalSeleccionado ? (
              <>
                {(animalSeleccionado as any).foto ? (
                  <img
                    src={(animalSeleccionado as any).foto}
                    alt={animalSeleccionado.nombre}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center flex-shrink-0 text-lg">
                    🐄
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {animalSeleccionado.nombre}
                  </p>
                  <p className="text-xs text-slate-400">
                    #{animalSeleccionado.numeroArete}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-lg">
                  🐄
                </div>
                <span className="text-slate-400 text-sm font-medium">
                  Seleccionar animal…
                </span>
              </>
            )}
            {/* Chevron */}
            <svg
              className={`w-4 h-4 text-slate-400 ml-auto flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Panel desplegable con búsqueda */}
          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Campo de búsqueda */}
              <div className="p-2 border-b border-slate-100">
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar por nombre o arete…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Lista agrupada */}
              <div className="max-h-56 overflow-y-auto">
                {Object.keys(grupos).length === 0 ? (
                  <p className="text-center text-slate-400 text-sm py-4">
                    Sin resultados
                  </p>
                ) : (
                  Object.entries(grupos).map(([grupo, lista]) => (
                    <div key={grupo}>
                      <p className="px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 sticky top-0">
                        {grupo}
                      </p>
                      {lista.map((animal) => (
                        <button
                          key={animal.id}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              animalId: animal.id ?? "",
                            });
                            setDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`dropdown-item w-full text-left ${formData.animalId === animal.id ? "selected" : ""}`}
                        >
                          {(animal as any).foto ? (
                            <img
                              src={(animal as any).foto}
                              alt={animal.nombre}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 mr-2 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center mr-2 text-sm flex-shrink-0">
                              🐄
                            </div>
                          )}
                          <span className="flex-1 font-semibold">
                            {animal.nombre}
                          </span>
                          <span className="text-xs text-slate-400">
                            #{animal.numeroArete}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Litros y Peso en grid cols-2 ── */}
        <div className="grid grid-cols-2 gap-4">
          {/* Litros */}
          <div className={claseCampoNumerico(formData.litros, litrosFocused)}>
            <label className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
              🥛 Litros de leche
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={formData.litros}
              onChange={(e) =>
                setFormData({ ...formData, litros: e.target.value })
              }
              onFocus={() => setLitrosFocused(true)}
              onBlur={() => setLitrosFocused(false)}
              disabled={submitting}
              className="w-full text-2xl font-bold text-slate-800 bg-transparent outline-none placeholder-slate-300"
            />
            {/* Botones rápidos +0.5 / +1 */}
            <div className="flex gap-1 mt-1">
              {[0.5, 1, 2].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="quick-btn"
                  onClick={() => incrementar("litros", v)}
                  disabled={submitting}
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>

          {/* Peso */}
          <div className={claseCampoNumerico(formData.peso, pesoFocused)}>
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              ⚖️ Peso (kg)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              placeholder="0.0"
              value={formData.peso}
              onChange={(e) =>
                setFormData({ ...formData, peso: e.target.value })
              }
              onFocus={() => setPesoFocused(true)}
              onBlur={() => setPesoFocused(false)}
              disabled={submitting}
              className="w-full text-2xl font-bold text-slate-800 bg-transparent outline-none placeholder-slate-300"
            />
            {/* Botones rápidos */}
            <div className="flex gap-1 mt-1">
              {[5, 10, 25].map((v) => (
                <button
                  key={v}
                  type="button"
                  className="quick-btn"
                  onClick={() => incrementar("peso", v)}
                  disabled={submitting}
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Advertencia si ambos vacíos ── */}
        {sinDatos && (
          <p className="text-[11px] text-amber-600 text-center font-semibold bg-amber-50 rounded-xl py-2 border border-amber-200">
            ⚠️ Registra al menos litros o peso para continuar
          </p>
        )}

        {/* ── 3. Fecha con selector rápido ── */}
        <div>
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
            📅 Fecha de medición
          </label>
          <div className="flex items-center gap-2 mt-1">
            {/* Atajo "Hoy" */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fecha: hoy })}
              disabled={submitting}
              className={`text-xs font-bold px-3 py-2 rounded-xl border-2 transition-all ${
                formData.fecha === hoy
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              Hoy
            </button>
            {/* Atajo "Ayer" */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fecha: ayer })}
              disabled={submitting}
              className={`text-xs font-bold px-3 py-2 rounded-xl border-2 transition-all ${
                formData.fecha === ayer
                  ? "bg-slate-700 text-white border-slate-700"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
              }`}
            >
              Ayer
            </button>
            {/* Input de fecha */}
            <input
              type="date"
              value={formData.fecha}
              onChange={(e) =>
                setFormData({ ...formData, fecha: e.target.value })
              }
              required
              disabled={submitting}
              className={`flex-1 px-3 py-2 rounded-xl border-2 text-sm font-semibold text-slate-700 bg-white outline-none transition-all
                ${!formData.fecha ? "border-red-300" : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
            />
          </div>
        </div>

        {/* ── 4. Botones de acción ── */}
        <div className="flex gap-3 pt-2">
          {/* Botón principal */}
          <button
            type="submit"
            disabled={deshabilitado}
            className={`
              flex-1 flex items-center justify-center gap-2 font-bold text-white rounded-2xl
              min-h-[56px] text-sm tracking-wide transition-all duration-200 shadow-md
              ${
                deshabilitado
                  ? "bg-slate-300 shadow-none cursor-not-allowed"
                  : submitSuccess
                    ? "bg-emerald-500 shadow-emerald-200"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-200 hover:shadow-lg"
              }
            `}
          >
            {submitting ? (
              <>
                <span className="spinner" />
                Guardando…
              </>
            ) : submitSuccess ? (
              <>✅ ¡Registrado!</>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Registrar Medición
              </>
            )}
          </button>

          {/* Cancelar */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 font-bold text-slate-500 bg-white border-2 border-slate-200 rounded-2xl min-h-[56px] hover:border-slate-400 hover:text-slate-700 active:scale-95 transition-all"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
