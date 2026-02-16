import React, { useState } from 'react';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import { Animal } from '@/src/core/entities/Animal';
import { crearFechaLocal, formatearFechaParaInput } from '@/utils/date-utils';

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

export function VacunaForm({ animales, onSubmit, onCancel }: VacunaFormProps) {
  const [formData, setFormData] = useState({
    animalId: '',
    nombreVacuna: '',
    fechaAplicacion: formatearFechaParaInput(),
    proximaDosis: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        animalId: formData.animalId,
        nombreVacuna: formData.nombreVacuna,
        fechaAplicacion: crearFechaLocal(formData.fechaAplicacion),
        proximaDosis: formData.proximaDosis ? crearFechaLocal(formData.proximaDosis) : null
      });
      
      setFormData({
        animalId: '',
        nombreVacuna: '',
        fechaAplicacion: formatearFechaParaInput(),
        proximaDosis: ''
      });
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

  const fechasValidas = validarFechas();
  const animalesOrdenados = [...animales].sort((a, b) => a.nombre.localeCompare(b.nombre));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <select
        className="w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm"
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

      <Input
        placeholder="Nombre de la vacuna / medicina"
        value={formData.nombreVacuna}
        onChange={e => setFormData({...formData, nombreVacuna: e.target.value})}
        required
        disabled={submitting}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          label="Fecha de aplicación"
          value={formData.fechaAplicacion}
          onChange={e => setFormData({...formData, fechaAplicacion: e.target.value})}
          required
          disabled={submitting}
        />
        <Input
          type="date"
          label="Próxima dosis"
          value={formData.proximaDosis}
          onChange={e => setFormData({...formData, proximaDosis: e.target.value})}
          disabled={submitting}
        />
      </div>

      {!fechasValidas && (
        <p className="text-[10px] text-rose-500 text-center">
          ⚠️ La próxima dosis debe ser posterior a la fecha de aplicación
        </p>
      )}

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting || !fechasValidas}
        >
          {submitting ? 'Guardando...' : 'Registrar Vacuna'}
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