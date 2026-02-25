import React, { useState } from "react";
import { Input } from "../../../common/Input/Input";
import { Button } from "../../../common/Button/Button";

// ─────────────────────────────────────────────
//  Tipos & Constantes
// ─────────────────────────────────────────────

interface FinanzaFormProps {
  tasaBCV: number;
  onSubmit: (data: {
    tipo: "ingreso" | "gasto";
    categoria: string;
    monto: number;
    descripcion?: string;
    moneda: "VES" | "USD";
  }) => Promise<void>;
  onCancel?: () => void;
}

const CATEGORIAS = {
  gasto: ["Nomina", "Alimento", "Medicina", "Otros"],
  ingreso: ["Venta Queso", "Venta Leche", "Venta Animal"],
} as const;

/** Iconos por categoría */
const CATEGORIA_ICONOS: Record<string, string> = {
  Nomina: "👥",
  Alimento: "🍚",
  Medicina: "💊",
  Otros: "📦",
  "Venta Queso": "🧀",
  "Venta Leche": "🥛",
  "Venta Animal": "🐃",
};

// ─────────────────────────────────────────────
//  Helpers de validación
// ─────────────────────────────────────────────

function getMontoError(monto: string): string | null {
  if (!monto) return null; // Mostrar error solo al intentar enviar
  const num = parseFloat(monto);
  if (isNaN(num)) return "Ingresa un número válido";
  if (num < 0) return "⚠️ El monto no puede ser negativo";
  if (num === 0) return "El monto debe ser mayor a 0";
  return null;
}

// ─────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────

export function FinanzaForm({ tasaBCV, onSubmit, onCancel }: FinanzaFormProps) {
  // ── Estado local (RESTRICCIÓN: no modificar nombres) ──
  const [formData, setFormData] = useState({
    tipo: "gasto" as "ingreso" | "gasto",
    categoria: "",
    monto: "",
    descripcion: "",
    moneda: "VES" as "VES" | "USD",
  });
  const [submitting, setSubmitting] = useState(false);

  // Estado de UI adicional (ayudas visuales)
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(false);

  // ── Cálculos derivados (RESTRICCIÓN: mantener lógica) ──
  const montoNumerico = parseFloat(formData.monto) || 0;
  const montoConvertido =
    formData.moneda === "USD" ? montoNumerico * tasaBCV : montoNumerico;
  const categoriasDisponibles = CATEGORIAS[formData.tipo];

  // ── Validaciones ──
  const montoError = touched.monto ? getMontoError(formData.monto) : null;
  const categoriaError =
    touched.categoria && !formData.categoria
      ? "Selecciona una categoría"
      : null;
  const isGasto = formData.tipo === "gasto";

  // ── handleSubmit (RESTRICCIÓN: mantener estructura) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos como tocados para mostrar errores
    setTouched({ monto: true, categoria: true });

    // Validar antes de enviar
    if (
      !formData.categoria ||
      !formData.monto ||
      parseFloat(formData.monto) <= 0
    ) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        tipo: formData.tipo,
        categoria: formData.categoria,
        monto: parseFloat(formData.monto) || 0,
        descripcion: formData.descripcion,
        moneda: formData.moneda,
      });

      // Reset del formulario (RESTRICCIÓN)
      setFormData({
        tipo: "gasto",
        categoria: "",
        monto: "",
        descripcion: "",
        moneda: "VES",
      });
      setTouched({});
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers de clases ──
  const inputBorderClass = (field: string, value: string) => {
    if (!touched[field])
      return "border-slate-200 focus:border-emerald-400 focus:ring-emerald-100";
    if (!value)
      return "border-rose-400 focus:border-rose-500 focus:ring-rose-100";
    return "border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100";
  };

  // ─────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────
  return (
    <>
      {/* ── Estilos de animación inline (evita dependencia de CSS externo) ── */}
      <style>{`
        @keyframes slideLeft  { from { transform: translateX(6px);  opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideRight { from { transform: translateX(-6px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn     { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake      { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes spin       { to { transform: rotate(360deg); } }
        .anim-slide-left   { animation: slideLeft  0.25s ease; }
        .anim-slide-right  { animation: slideRight 0.25s ease; }
        .anim-fade         { animation: fadeIn     0.2s ease; }
        .anim-shake        { animation: shake      0.4s ease; }
        .anim-spin         { animation: spin       0.8s linear infinite; }
      `}</style>

      <form
        onSubmit={handleSubmit}
        noValidate
        className={`space-y-5 bg-white rounded-3xl p-5 shadow-xl shadow-slate-200/60 ${shake ? "anim-shake" : ""}`}
      >
        {/* ══════════════════════════════════════
            1. SELECTOR DE TIPO  💸 / 💰
        ══════════════════════════════════════ */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
            Tipo de movimiento <span className="text-rose-400">*</span>
          </p>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            {/* GASTO */}
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, tipo: "gasto", categoria: "" })
              }
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[11px] tracking-wider transition-all duration-200 ${
                isGasto
                  ? "bg-rose-500 text-white shadow-md shadow-rose-200 scale-[1.02] anim-slide-right"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              <span className="text-base">💸</span> GASTO
            </button>

            {/* INGRESO */}
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, tipo: "ingreso", categoria: "" })
              }
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[11px] tracking-wider transition-all duration-200 ${
                !isGasto
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 scale-[1.02] anim-slide-left"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              <span className="text-base">💰</span> INGRESO
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            2. SELECTOR DE MONEDA  🇻🇪 / 🇺🇸
        ══════════════════════════════════════ */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">
            Moneda <span className="text-rose-400">*</span>
          </p>
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, moneda: "VES" })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[11px] tracking-wider transition-all duration-200 ${
                formData.moneda === "VES"
                  ? "bg-slate-700 text-white shadow-md anim-fade"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              <span>🇻🇪</span> BS
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, moneda: "USD" })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black text-[11px] tracking-wider transition-all duration-200 ${
                formData.moneda === "USD"
                  ? "bg-emerald-600 text-white shadow-md anim-fade"
                  : "text-slate-400 hover:text-slate-600 hover:bg-white/60"
              }`}
            >
              <span>🇺🇸</span> USD
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════
            3. CATEGORÍA  (select estilizado)
        ══════════════════════════════════════ */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1 block">
            Categoría <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <select
              className={`w-full py-4 pl-4 pr-10 rounded-2xl bg-white border-2 text-slate-800 font-bold text-sm
                focus:ring-4 outline-none transition-all shadow-sm appearance-none cursor-pointer
                ${inputBorderClass("categoria", formData.categoria)}`}
              value={formData.categoria}
              onChange={(e) => {
                setTouched({ ...touched, categoria: true });
                setFormData({ ...formData, categoria: e.target.value });
              }}
              onBlur={() => setTouched({ ...touched, categoria: true })}
              required
              disabled={submitting}
            >
              <option value="">Seleccionar categoría…</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORIA_ICONOS[cat] ?? "📌"} {cat}
                </option>
              ))}
            </select>
            {/* Flecha custom */}
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </span>
          </div>
          {categoriaError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1 anim-fade">
              {categoriaError}
            </p>
          )}
          {/* Chips de vista previa de las categorías disponibles */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categoriasDisponibles.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setTouched({ ...touched, categoria: true });
                  setFormData({ ...formData, categoria: cat });
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                  formData.categoria === cat
                    ? isGasto
                      ? "bg-rose-100 border-rose-300 text-rose-700"
                      : "bg-emerald-100 border-emerald-300 text-emerald-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                {CATEGORIA_ICONOS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════
            4. MONTO  (input grande)
        ══════════════════════════════════════ */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1 block">
            Monto ({formData.moneda === "USD" ? "USD $" : "Bs"}){" "}
            <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 select-none">
              {formData.moneda === "USD" ? "$" : "Bs"}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.monto}
              onChange={(e) => {
                setTouched({ ...touched, monto: true });
                setFormData({ ...formData, monto: e.target.value });
              }}
              onBlur={() => setTouched({ ...touched, monto: true })}
              required
              disabled={submitting}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 text-2xl font-black text-slate-800
                focus:ring-4 outline-none transition-all shadow-sm
                ${inputBorderClass("monto", formData.monto)}
                ${montoNumerico < 0 ? "bg-rose-50" : ""}`}
            />
            {/* Indicador de válido */}
            {touched.monto && !montoError && formData.monto && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-lg anim-fade">
                ✓
              </span>
            )}
          </div>
          {montoError && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1 anim-fade">
              {montoError}
            </p>
          )}
        </div>

        {/* ══════════════════════════════════════
            4b. PREVIEW DE CONVERSIÓN  🔄
        ══════════════════════════════════════ */}
        {formData.moneda === "USD" && montoNumerico > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 anim-fade">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🔄</span>
              <div className="text-center">
                <p className="text-base font-black text-emerald-700">
                  Bs{" "}
                  {montoConvertido.toLocaleString("es-VE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-[10px] text-emerald-500 font-semibold">
                  Tasa BCV: Bs {tasaBCV.toFixed(2)} por USD
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            5. DESCRIPCIÓN
        ══════════════════════════════════════ */}
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1 block">
            Descripción{" "}
            <span className="text-slate-300 font-normal normal-case">
              (opcional)
            </span>
          </label>
          <input
            type="text"
            placeholder={
              isGasto ? "Ej: Compra de concentrado…" : "Ej: Venta de queso…"
            }
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            disabled={submitting}
            className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200
              focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none
              transition-all shadow-sm text-sm text-slate-700 font-medium placeholder:text-slate-300"
          />
        </div>

        {/* ══════════════════════════════════════
            6. BOTONES DE ACCIÓN
        ══════════════════════════════════════ */}
        <div className="flex gap-3 pt-1">
          {/* Submit dinámico */}
          <button
            type="submit"
            disabled={submitting}
            style={{ height: "56px" }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl font-black text-sm text-white
              tracking-wider transition-all duration-200 shadow-lg active:scale-[0.98]
              disabled:opacity-60 disabled:cursor-not-allowed
              ${
                isGasto
                  ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                  : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
              }`}
          >
            {submitting ? (
              <>
                <span
                  className="anim-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  style={{ display: "inline-block" }}
                />
                Guardando…
              </>
            ) : (
              <>
                <span>{isGasto ? "💸" : "💰"}</span>
                Registrar {isGasto ? "Gasto" : "Ingreso"}
              </>
            )}
          </button>

          {/* Cancelar */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              style={{ height: "56px" }}
              className="px-5 rounded-2xl font-black text-sm text-slate-500 bg-slate-100
                hover:bg-slate-200 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </>
  );
}
