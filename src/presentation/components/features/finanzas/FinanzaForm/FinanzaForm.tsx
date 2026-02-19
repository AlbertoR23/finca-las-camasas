import React, { useState } from 'react';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';

interface FinanzaFormProps {
  tasaBCV: number;
  onSubmit: (data: {
    tipo: 'ingreso' | 'gasto';
    categoria: string;
    monto: number;
    descripcion?: string;
    moneda: 'VES' | 'USD';
  }) => Promise<void>;
  onCancel?: () => void;
}

// Categorías con sus iconos representativos
const CATEGORIAS = {
  gasto: [
    { value: 'Nomina', label: 'Nómina', icon: '👥' },
    { value: 'Alimento', label: 'Alimento', icon: '🌾' },
    { value: 'Medicina', label: 'Medicina', icon: '💊' },
    { value: 'Otros', label: 'Otros', icon: '📋' }
  ],
  ingreso: [
    { value: 'Venta Queso', label: 'Venta Queso', icon: '🧀' },
    { value: 'Venta Leche', label: 'Venta Leche', icon: '🥛' },
    { value: 'Venta Animal', label: 'Venta Animal', icon: '🐄' }
  ]
} as const;

export function FinanzaForm({ tasaBCV, onSubmit, onCancel }: FinanzaFormProps) {
  const [formData, setFormData] = useState({
    tipo: 'gasto' as 'ingreso' | 'gasto',
    categoria: '',
    monto: '',
    descripcion: '',
    moneda: 'VES' as 'VES' | 'USD'
  });
  const [submitting, setSubmitting] = useState(false);
  const [montoError, setMontoError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación visual de monto
    const montoNum = parseFloat(formData.monto);
    if (!montoNum || montoNum <= 0) {
      setMontoError('Ingrese un monto válido mayor a 0');
      return;
    }
    
    setSubmitting(true);
    try {
      await onSubmit({
        tipo: formData.tipo,
        categoria: formData.categoria,
        monto: montoNum,
        descripcion: formData.descripcion,
        moneda: formData.moneda
      });
      
      // Reset del formulario después de envío exitoso
      setFormData({
        tipo: 'gasto',
        categoria: '',
        monto: '',
        descripcion: '',
        moneda: 'VES'
      });
      setMontoError('');
    } finally {
      setSubmitting(false);
    }
  };

  // Cálculo de conversión
  const montoNumerico = parseFloat(formData.monto) || 0;
  const montoConvertido = formData.moneda === 'USD' 
    ? montoNumerico * tasaBCV 
    : montoNumerico;

  const categoriasDisponibles = CATEGORIAS[formData.tipo];
  const montoValido = montoNumerico > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toggle de tipo mejorado con colores y animación */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 px-1">
          Tipo de transacción
        </label>
        <div className="flex gap-3 p-1.5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-inner">
          <button
            type="button"
            onClick={() => {
              setFormData({...formData, tipo: 'gasto', categoria: ''});
            }}
            className={`flex-1 p-4 rounded-xl font-bold text-sm transition-all duration-300 transform ${
              formData.tipo === 'gasto' 
                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg scale-105 -translate-y-0.5' 
                : 'bg-white/50 text-slate-500 hover:text-slate-700 hover:bg-white/80'
            }`}
          >
            <span className="block text-2xl mb-1">💸</span>
            GASTO
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({...formData, tipo: 'ingreso', categoria: ''});
            }}
            className={`flex-1 p-4 rounded-xl font-bold text-sm transition-all duration-300 transform ${
              formData.tipo === 'ingreso' 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg scale-105 -translate-y-0.5' 
                : 'bg-white/50 text-slate-500 hover:text-slate-700 hover:bg-white/80'
            }`}
          >
            <span className="block text-2xl mb-1">💰</span>
            INGRESO
          </button>
        </div>
      </div>

      {/* Selector de moneda con iconos y colores distintivos */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 px-1">
          Moneda
        </label>
        <div className="flex gap-3 p-1.5 bg-slate-50 rounded-2xl">
          <button
            type="button"
            onClick={() => setFormData({...formData, moneda: 'VES'})}
            className={`flex-1 p-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              formData.moneda === 'VES' 
                ? 'bg-gradient-to-br from-slate-700 to-slate-900 text-white shadow-md' 
                : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="block text-xl mb-1">💰</span>
            BOLÍVARES
          </button>
          <button
            type="button"
            onClick={() => setFormData({...formData, moneda: 'USD'})}
            className={`flex-1 p-4 rounded-xl font-bold text-sm transition-all duration-300 ${
              formData.moneda === 'USD' 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md' 
                : 'bg-white text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="block text-xl mb-1">💵</span>
            DÓLARES
          </button>
        </div>
      </div>

      {/* Selector de categoría con iconos */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 px-1">
          Categoría
        </label>
        <select
          className={`w-full p-4 rounded-2xl bg-white border-2 text-slate-800 font-semibold text-base
            focus:outline-none focus:ring-4 transition-all shadow-sm
            ${formData.tipo === 'gasto' 
              ? 'border-rose-200 focus:border-rose-500 focus:ring-rose-100' 
              : 'border-emerald-200 focus:border-emerald-500 focus:ring-emerald-100'
            }
            ${!formData.categoria ? 'text-slate-400' : 'text-slate-800'}
          `}
          value={formData.categoria}
          onChange={e => setFormData({...formData, categoria: e.target.value})}
          required
          disabled={submitting}
        >
          <option value="" className="text-slate-400">
            Seleccionar categoría...
          </option>
          {categoriasDisponibles.map(cat => (
            <option key={cat.value} value={cat.value} className="text-slate-800">
              {cat.icon} {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Monto con teclado numérico y validación visual */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 px-1">
          Monto en {formData.moneda === 'VES' ? 'Bolívares' : 'Dólares'}
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
            {formData.moneda === 'VES' ? 'Bs' : '$'}
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={formData.monto}
            onChange={e => {
              setFormData({...formData, monto: e.target.value});
              setMontoError('');
            }}
            className={`w-full pl-16 pr-4 py-5 rounded-2xl bg-white border-2 text-2xl font-bold
              focus:outline-none focus:ring-4 transition-all shadow-sm
              ${montoError 
                ? 'border-red-400 focus:border-red-500 focus:ring-red-100 text-red-600' 
                : montoValido
                  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-100 text-emerald-600'
                  : 'border-slate-200 focus:border-slate-400 focus:ring-slate-100 text-slate-800'
              }
            `}
            required
            disabled={submitting}
          />
          {/* Indicador visual de validación */}
          {formData.monto && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl">
              {montoValido ? '✓' : '⚠️'}
            </span>
          )}
        </div>
        {/* Mensaje de error claro */}
        {montoError && (
          <p className="text-sm font-semibold text-red-600 px-1 animate-pulse">
            {montoError}
          </p>
        )}
      </div>

      {/* Preview de conversión en tiempo real con estilo mejorado */}
      {formData.moneda === 'USD' && montoNumerico > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-emerald-700">
              💱 Conversión automática
            </span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-200/50 px-3 py-1 rounded-full">
              Tasa BCV: Bs {tasaBCV.toFixed(2)}
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-700 text-center">
            Bs {montoConvertido.toFixed(2)}
          </p>
        </div>
      )}

      {/* Descripción opcional con espaciado generoso */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 px-1">
          Descripción (opcional)
        </label>
        <textarea
          placeholder="Agregar nota o detalle adicional..."
          value={formData.descripcion}
          onChange={e => setFormData({...formData, descripcion: e.target.value})}
          disabled={submitting}
          rows={3}
          className="w-full p-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-800
            focus:border-slate-400 focus:ring-4 focus:ring-slate-100 outline-none transition-all shadow-sm
            resize-none"
        />
      </div>

      {/* Botones con color dinámico y espaciado */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant={formData.tipo === 'gasto' ? 'danger' : 'success'}
          fullWidth
          disabled={submitting || !montoValido}
          className="py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Guardando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              {formData.tipo === 'gasto' ? '💸' : '💰'}
              Registrar {formData.tipo === 'gasto' ? 'Gasto' : 'Ingreso'}
            </span>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
            className="px-6 py-4"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}