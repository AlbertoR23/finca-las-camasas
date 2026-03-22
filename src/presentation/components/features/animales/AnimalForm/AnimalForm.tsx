import React, { useState } from "react";
import { Input } from "../../../common/Input/Input";
import { Button } from "../../../common/Button/Button";
import { Animal } from "@/src/core/entities/Animal";
import { crearFechaLocal, formatearFechaParaInput } from "@/utils/date-utils";

interface AnimalFormProps {
  animales: Animal[];
  onSubmit: (data: {
    nombre: string;
    numeroArete: string;
    fechaNacimiento: Date;
    sexo: "Macho" | "Hembra";
    padreId?: string | null;
    madreId?: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function AnimalForm({ animales, onSubmit, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    arete: "",
    nacimiento: formatearFechaParaInput(),
    sexo: "Hembra" as "Macho" | "Hembra",
    padre_id: "",
    madre_id: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Validación en tiempo real ──────────────────────────────────────────────
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // Búsqueda typeahead para selectores de padres
  const [padreSearch, setPadreSearch] = useState("");
  const [madreSearch, setMadreSearch] = useState("");
  const [showPadreList, setShowPadreList] = useState(false);
  const [showMadreList, setShowMadreList] = useState(false);

  const mark = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  /** Valida si una fecha en formato YYYY-MM-DD es válida y no futura */
  const fechaValida = (val: string): boolean => {
    if (!val) return false;
    const d = new Date(val);
    return !isNaN(d.getTime()) && d <= new Date();
  };

  /** ✅ NUEVO: Validación de caracteres especiales (opcional, previene problemas) */
  const validarCaracteres = (texto: string, campo: string): boolean => {
    // Permitir letras, números, espacios, guiones, acentos y ñ
    const regex = /^[a-zA-ZáéíóúñÑüÜ\s0-9-]+$/;
    if (!regex.test(texto)) {
      setSubmitError(`El ${campo} solo puede contener letras, números, espacios y guiones`);
      return false;
    }
    return true;
  };

  const errors = {
    nombre:
      touched.nombre && !formData.nombre.trim() ? "El nombre es requerido" : "",
    arete:
      touched.arete && !formData.arete.trim() ? "El arete es requerido" : "",
    nacimiento:
      touched.nacimiento && !fechaValida(formData.nacimiento)
        ? "Fecha inválida o futura"
        : "",
  };

  const isValid = (field: string, val: string) => {
    if (field === "nombre") return val.trim().length > 0;
    if (field === "arete") return val.trim().length > 0;
    if (field === "nacimiento") return fechaValida(val);
    return true;
  };

  // ── Submit con protección anti-múltiples clics ─────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚫 PREVENIR MÚLTIPLES ENVÍOS MIENTRAS YA HAY UNO EN PROCESO
    if (submitting) {
      console.log("⏳ Ya hay un envío en progreso, espera...");
      return;
    }

    // Marcar todos como tocados para mostrar errores
    setTouched({ nombre: true, arete: true, nacimiento: true });
    setSubmitError(null);

    // Validar caracteres especiales (opcional pero recomendado)
    if (!validarCaracteres(formData.nombre, "nombre")) return;
    if (!validarCaracteres(formData.arete, "arete")) return;

    if (
      !formData.nombre.trim() ||
      !formData.arete.trim() ||
      !fechaValida(formData.nacimiento)
    ) {
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        nombre: formData.nombre,
        numeroArete: formData.arete,
        fechaNacimiento: crearFechaLocal(formData.nacimiento),
        sexo: formData.sexo,
        padreId: formData.padre_id || null,
        madreId: formData.madre_id || null,
      });

      // ── Éxito: mostrar checkmark verde y resetear ──────────────────────────
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);

      setFormData({
        nombre: "",
        arete: "",
        nacimiento: formatearFechaParaInput(),
        sexo: "Hembra",
        padre_id: "",
        madre_id: "",
      });
      setTouched({});
      setPadreSearch("");
      setMadreSearch("");
      setSubmitError(null);
    } catch (error) {
      console.error("❌ Error guardando animal:", error);
      setSubmitError("Error al guardar. Intenta de nuevo.");
    } finally {
      // ✅ Esperar 1 segundo antes de habilitar el botón de nuevo
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
    }
  };

  // ── Helpers de estilo ──────────────────────────────────────────────────────
  /** Devuelve clases del input según estado de validación */
  const fieldClass = (field: string, val: string) => {
    const base =
      "w-full p-4 rounded-2xl bg-white text-slate-800 font-semibold text-base " +
      "placeholder:text-slate-400 placeholder:font-normal outline-none " +
      "transition-all duration-200 shadow-sm " +
      "focus:ring-4 focus:scale-[1.02] ";

    if (!touched[field])
      return (
        base +
        "border border-slate-200 focus:border-green-500 focus:ring-green-100"
      );
    if (isValid(field, val))
      return (
        base +
        "border-2 border-green-500 focus:border-green-500 focus:ring-green-100"
      );
    return (
      base +
      "border-2 border-rose-500 focus:border-rose-500 focus:ring-rose-100"
    );
  };

  /** Icono de validación inline */
  const ValidationIcon = ({ field, val }: { field: string; val: string }) => {
    if (!touched[field]) return null;
    return isValid(field, val) ? (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-lg animate-[fadeIn_0.2s_ease]">
        ✓
      </span>
    ) : (
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500 text-lg animate-[fadeIn_0.2s_ease]">
        ✗
      </span>
    );
  };

  // ── Padres filtrados (typeahead) ───────────────────────────────────────────
  const machos = animales.filter((a) => a.sexo === "Macho");
  const hembras = animales.filter((a) => a.sexo === "Hembra");

  const filteredPadres = machos.filter((a) =>
    a.nombre.toLowerCase().includes(padreSearch.toLowerCase()),
  );
  const filteredMadres = hembras.filter((a) =>
    a.nombre.toLowerCase().includes(madreSearch.toLowerCase()),
  );

  const padreSeleccionado = machos.find((a) => a.id === formData.padre_id);
  const madreSeleccionada = hembras.find((a) => a.id === formData.madre_id);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Animación keyframes inyectada como style */}
      <style>{`
        @keyframes fadeIn   { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
        .animate-spin-custom { animation: spin 0.8s linear infinite; }
        .animate-check       { animation: checkPop 0.4s ease forwards; }
        .field-error         { animation: fadeIn 0.2s ease; }
      `}</style>

      {/* ── Overlay de éxito ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl animate-check">
            <span className="text-6xl">✅</span>
            <p className="mt-3 text-green-700 font-bold text-lg">
              ¡Animal guardado!
            </p>
          </div>
        </div>
      )}

      {/* ── Mensaje de error global ── */}
      {submitError && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium text-center">
          ⚠️ {submitError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-5 bg-slate-50 rounded-3xl shadow-lg"
        noValidate
      >
        {/* ── 1. Nombre ─────────────────────────────────────────────────────── */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl pointer-events-none select-none">
            📝
          </span>
          <input
            placeholder="Nombre del Búfalo (solo letras, números, guiones)"
            className={fieldClass("nombre", formData.nombre) + " pl-11 pr-10"}
            style={{ minHeight: 56 }}
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            onBlur={() => mark("nombre")}
            required
            disabled={submitting}
          />
          <ValidationIcon field="nombre" val={formData.nombre} />
          {errors.nombre && (
            <p className="field-error mt-1 ml-1 text-rose-500 text-sm font-medium">
              ⚠ {errors.nombre}
            </p>
          )}
        </div>

        {/* ── 2. Arete + Fecha en grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Arete */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
              🔖 Arete / ID (solo letras, números, guiones)
            </label>
            <div className="relative">
              <input
                placeholder="Ej: BUF-0042"
                className={fieldClass("arete", formData.arete) + " pr-10"}
                style={{ minHeight: 56 }}
                value={formData.arete}
                onChange={(e) =>
                  setFormData({ ...formData, arete: e.target.value })
                }
                onBlur={() => mark("arete")}
                required
                disabled={submitting}
              />
              <ValidationIcon field="arete" val={formData.arete} />
            </div>
            {errors.arete && (
              <p className="field-error mt-1 text-rose-500 text-xs font-medium">
                ⚠ {errors.arete}
              </p>
            )}
          </div>

          {/* Fecha */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
              📅 Nacimiento
            </label>
            <div className="relative">
              <input
                type="date"
                className={
                  fieldClass("nacimiento", formData.nacimiento) + " pr-10"
                }
                style={{ minHeight: 56 }}
                value={formData.nacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, nacimiento: e.target.value })
                }
                onBlur={() => mark("nacimiento")}
                required
                disabled={submitting}
              />
              <ValidationIcon field="nacimiento" val={formData.nacimiento} />
            </div>
            {errors.nacimiento && (
              <p className="field-error mt-1 text-rose-500 text-xs font-medium">
                ⚠ {errors.nacimiento}
              </p>
            )}
          </div>
        </div>

        {/* ── 3. Toggle de sexo ─────────────────────────────────────────────── */}
        <div
          className="flex gap-2 p-1.5 rounded-2xl"
          style={{ background: "#e2e8f0" }}
          role="group"
          aria-label="Sexo del animal"
        >
          {/* HEMBRA */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, sexo: "Hembra" })}
            disabled={submitting}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              font-bold text-sm transition-all duration-300 select-none
              ${
                formData.sexo === "Hembra"
                  ? "bg-pink-500 text-white shadow-md scale-[1.03]"
                  : "text-slate-400 hover:bg-white/60"
              }
            `}
            style={{ minHeight: 56 }}
          >
            <span className="text-2xl">🐄</span>
            <span>HEMBRA</span>
          </button>

          {/* MACHO */}
          <button
            type="button"
            onClick={() => setFormData({ ...formData, sexo: "Macho" })}
            disabled={submitting}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
              font-bold text-sm transition-all duration-300 select-none
              ${
                formData.sexo === "Macho"
                  ? "bg-blue-600 text-white shadow-md scale-[1.03]"
                  : "text-slate-400 hover:bg-white/60"
              }
            `}
            style={{ minHeight: 56 }}
          >
            <span className="text-2xl">🐂</span>
            <span>MACHO</span>
          </button>
        </div>

        {/* ── 4. Selectores de padres con typeahead ─────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Padre */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
              👨‍👩‍👧 Padre (opcional)
            </label>
            <div className="relative">
              <input
                placeholder={
                  padreSeleccionado
                    ? padreSeleccionado.nombre
                    : "🐂 Buscar padre..."
                }
                className={
                  "w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 " +
                  "font-semibold text-sm placeholder:text-slate-400 outline-none " +
                  "transition-all duration-200 shadow-sm " +
                  "focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:scale-[1.02]"
                }
                style={{ minHeight: 56 }}
                value={padreSearch}
                onChange={(e) => {
                  setPadreSearch(e.target.value);
                  setShowPadreList(true);
                }}
                onFocus={() => setShowPadreList(true)}
                onBlur={() => setTimeout(() => setShowPadreList(false), 180)}
                disabled={submitting}
              />

              {/* Indicador de selección */}
              {padreSeleccionado && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-base">
                  🐂
                </span>
              )}

              {/* Lista desplegable */}
              {showPadreList && filteredPadres.length > 0 && (
                <ul className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-40 overflow-y-auto animate-[fadeIn_0.15s_ease]">
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-50"
                      onMouseDown={() => {
                        setFormData({ ...formData, padre_id: "" });
                        setPadreSearch("");
                        setShowPadreList(false);
                      }}
                    >
                      — Sin padre —
                    </button>
                  </li>
                  {filteredPadres.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                        onMouseDown={() => {
                          setFormData({ ...formData, padre_id: a.id ?? "" });
                          setPadreSearch("");
                          setShowPadreList(false);
                        }}
                      >
                        <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-base">
                          🐂
                        </span>
                        {a.nombre}
                        {a.numeroArete && (
                          <span className="ml-auto text-xs text-slate-400 font-normal">
                            #{a.numeroArete}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Badge del animal seleccionado */}
            {padreSeleccionado && (
              <div className="mt-1.5 ml-1 flex items-center gap-1.5 text-xs text-blue-600 font-semibold animate-[fadeIn_0.2s_ease]">
                <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                  🐂
                </span>
                {padreSeleccionado.nombre}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, padre_id: "" });
                    setPadreSearch("");
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Madre */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">
              👨‍👩‍👧 Madre (opcional)
            </label>
            <div className="relative">
              <input
                placeholder={
                  madreSeleccionada
                    ? madreSeleccionada.nombre
                    : "🐄 Buscar madre..."
                }
                className={
                  "w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 " +
                  "font-semibold text-sm placeholder:text-slate-400 outline-none " +
                  "transition-all duration-200 shadow-sm " +
                  "focus:border-pink-400 focus:ring-4 focus:ring-pink-100 focus:scale-[1.02]"
                }
                style={{ minHeight: 56 }}
                value={madreSearch}
                onChange={(e) => {
                  setMadreSearch(e.target.value);
                  setShowMadreList(true);
                }}
                onFocus={() => setShowMadreList(true)}
                onBlur={() => setTimeout(() => setShowMadreList(false), 180)}
                disabled={submitting}
              />

              {madreSeleccionada && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 text-base">
                  🐄
                </span>
              )}

              {showMadreList && filteredMadres.length > 0 && (
                <ul className="absolute z-20 top-full mt-1 w-full bg-white rounded-xl shadow-xl border border-slate-100 max-h-40 overflow-y-auto animate-[fadeIn_0.15s_ease]">
                  <li>
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-50"
                      onMouseDown={() => {
                        setFormData({ ...formData, madre_id: "" });
                        setMadreSearch("");
                        setShowMadreList(false);
                      }}
                    >
                      — Sin madre —
                    </button>
                  </li>
                  {filteredMadres.map((a) => (
                    <li key={a.id}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-pink-50 flex items-center gap-2"
                        onMouseDown={() => {
                          setFormData({ ...formData, madre_id: a.id ?? "" });
                          setMadreSearch("");
                          setShowMadreList(false);
                        }}
                      >
                        <span className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-base">
                          🐄
                        </span>
                        {a.nombre}
                        {a.numeroArete && (
                          <span className="ml-auto text-xs text-slate-400 font-normal">
                            #{a.numeroArete}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {madreSeleccionada && (
              <div className="mt-1.5 ml-1 flex items-center gap-1.5 text-xs text-pink-600 font-semibold animate-[fadeIn_0.2s_ease]">
                <span className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center text-sm">
                  🐄
                </span>
                {madreSeleccionada.nombre}
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, madre_id: "" });
                    setMadreSearch("");
                  }}
                  className="ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. Botones de acción ──────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          {/* Botón principal con protección visual */}
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl text-white font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed`}
            style={{
              minHeight: 56,
              background: submitting ? "#2d6a4f" : "#1B4332",
              boxShadow: "0 4px 14px rgba(27,67,50,0.35)",
            }}
          >
            {submitting ? (
              <>
                <span className="animate-spin-custom inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white" />
                Guardando...
              </>
            ) : (
              <>🐃 Guardar Animal</>
            )}
          </button>

          {/* Cancelar (opcional) */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold text-sm transition-all hover:border-rose-300 hover:text-rose-500 active:scale-95 disabled:opacity-50"
              style={{ minHeight: 56 }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
