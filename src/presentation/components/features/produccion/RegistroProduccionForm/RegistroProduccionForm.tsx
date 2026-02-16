import React, { useState } from 'react';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import { Animal } from '@/src/core/entities/Animal';
import { crearFechaLocal, formatearFechaParaInput } from '@/utils/date-utils';

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
  onCancel 
}: RegistroProduccionFormProps) {
  const [formData, setFormData] = useState({
    animalId: '',
    litros: '',
    peso: '',
    fecha: formatearFechaParaInput()
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        animalId: formData.animalId,
        litros: formData.litros ? parseFloat(formData.litros) : undefined,
        peso: formData.peso ? parseFloat(formData.peso) : undefined,
        fecha: crearFechaLocal(formData.fecha)
      });
      
      setFormData({
        animalId: '',
        litros: '',
        peso: '',
        fecha: formatearFechaParaInput()
      });
    } finally {
      setSubmitting(false);
    }
  };

  const animalesOrdenados = [...animales].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm"
        value={formData.animalId}
        onChange={e => setFormData({...formData, animalId: e.target.value})}
        required
        disabled={submitting}
      >
        <option value="">Seleccionar animal...</option>
        {animalesOrdenados.map(animal => (
          <option key={animal.id} value={animal.id}>
            {animal.nombre} ({animal.numeroArete})
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[9px] font-black text-blue-400 ml-2 uppercase">
            Litros de Leche
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={formData.litros}
            onChange={e => setFormData({...formData, litros: e.target.value})}
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-[9px] font-black text-slate-400 ml-2 uppercase">
            Peso (kg)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={formData.peso}
            onChange={e => setFormData({...formData, peso: e.target.value})}
            disabled={submitting}
          />
        </div>
      </div>

      <Input
        type="date"
        label="Fecha de medición"
        value={formData.fecha}
        onChange={e => setFormData({...formData, fecha: e.target.value})}
        required
        disabled={submitting}
      />

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting || (!formData.litros && !formData.peso)}
        >
          {submitting ? 'Guardando...' : 'Registrar Medición'}
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

      {!formData.litros && !formData.peso && (
        <p className="text-[10px] text-amber-600 text-center">
          ⚠️ Debes registrar al menos litros o peso
        </p>
      )}
    </form>
  );
}