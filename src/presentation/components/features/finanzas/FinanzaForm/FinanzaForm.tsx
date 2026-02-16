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

const CATEGORIAS = {
  gasto: ['Nomina', 'Alimento', 'Medicina', 'Otros'],
  ingreso: ['Venta Queso', 'Venta Leche', 'Venta Animal']
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        tipo: formData.tipo,
        categoria: formData.categoria,
        monto: parseFloat(formData.monto) || 0,
        descripcion: formData.descripcion,
        moneda: formData.moneda
      });
      
      setFormData({
        tipo: 'gasto',
        categoria: '',
        monto: '',
        descripcion: '',
        moneda: 'VES'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const montoNumerico = parseFloat(formData.monto) || 0;
  const montoConvertido = formData.moneda === 'USD' 
    ? montoNumerico * tasaBCV 
    : montoNumerico;

  const categoriasDisponibles = CATEGORIAS[formData.tipo];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de tipo */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setFormData({...formData, tipo: 'gasto'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all shadow-sm ${
            formData.tipo === 'gasto' 
              ? 'bg-white text-rose-600' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          GASTO
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, tipo: 'ingreso'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all shadow-sm ${
            formData.tipo === 'ingreso' 
              ? 'bg-white text-emerald-600' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          INGRESO
        </button>
      </div>

      {/* Selector de moneda */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setFormData({...formData, moneda: 'VES'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all ${
            formData.moneda === 'VES' 
              ? 'bg-slate-800 text-white shadow-md' 
              : 'text-slate-400'
          }`}
        >
          BS
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, moneda: 'USD'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all ${
            formData.moneda === 'USD' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-400'
          }`}
        >
          USD
        </button>
      </div>

      {/* Selector de categoría */}
      <select
        className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all shadow-sm"
        value={formData.categoria}
        onChange={e => setFormData({...formData, categoria: e.target.value})}
        required
        disabled={submitting}
      >
        <option value="">Seleccionar categoría...</option>
        {categoriasDisponibles.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {/* Monto y descripción */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`Monto (${formData.moneda})`}
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.monto}
          onChange={e => setFormData({...formData, monto: e.target.value})}
          required
          disabled={submitting}
        />
        <Input
          label="Descripción"
          placeholder="Nota..."
          value={formData.descripcion}
          onChange={e => setFormData({...formData, descripcion: e.target.value})}
          disabled={submitting}
        />
      </div>

      {/* Conversión USD a VES */}
      {formData.moneda === 'USD' && montoNumerico > 0 && (
        <div className="bg-emerald-50 p-3 rounded-xl">
          <p className="text-center text-[10px] font-black text-emerald-600">
            Conversión: Bs {montoConvertido.toFixed(2)}
          </p>
          <p className="text-center text-[8px] text-emerald-400">
            Tasa: Bs {tasaBCV.toFixed(2)} por USD
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant={formData.tipo === 'gasto' ? 'danger' : 'success'}
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : `Registrar ${formData.tipo === 'gasto' ? 'Gasto' : 'Ingreso'}`}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}