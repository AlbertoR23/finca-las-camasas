import React, { useState } from 'react';
import { Input } from '../../../common/Input/Input';
import { Button } from '../../../common/Button/Button';
import { Animal } from '@/src/core/entities/Animal';
import { crearFechaLocal, formatearFechaParaInput } from '@/utils/date-utils';

interface AnimalFormProps {
  animales: Animal[];
  onSubmit: (data: {
    nombre: string;
    numeroArete: string;
    fechaNacimiento: Date;
    sexo: 'Macho' | 'Hembra';
    padreId?: string | null;
    madreId?: string | null;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function AnimalForm({ animales, onSubmit, onCancel }: AnimalFormProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    arete: '',
    nacimiento: formatearFechaParaInput(),
    sexo: 'Hembra' as 'Macho' | 'Hembra',
    padre_id: '',
    madre_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: formData.nombre,
        numeroArete: formData.arete,
        fechaNacimiento: crearFechaLocal(formData.nacimiento),
        sexo: formData.sexo,
        padreId: formData.padre_id || null,
        madreId: formData.madre_id || null
      });
      
      setFormData({
        nombre: '',
        arete: '',
        nacimiento: formatearFechaParaInput(),
        sexo: 'Hembra',
        padre_id: '',
        madre_id: ''
      });
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = "w-full p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all shadow-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        placeholder="Nombre del Búfalo"
        className={inputStyle}
        value={formData.nombre}
        onChange={e => setFormData({...formData, nombre: e.target.value})}
        required
        disabled={submitting}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Arete / ID"
          className={inputStyle}
          value={formData.arete}
          onChange={e => setFormData({...formData, arete: e.target.value})}
          required
          disabled={submitting}
        />
        <input
          type="date"
          className={inputStyle}
          value={formData.nacimiento}
          onChange={e => setFormData({...formData, nacimiento: e.target.value})}
          required
          disabled={submitting}
        />
      </div>
      
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => setFormData({...formData, sexo: 'Hembra'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all shadow-sm ${
            formData.sexo === 'Hembra' 
              ? 'bg-pink-500 text-white' 
              : 'text-slate-400 hover:bg-white'
          }`}
          disabled={submitting}
        >
          HEMBRA
        </button>
        <button
          type="button"
          onClick={() => setFormData({...formData, sexo: 'Macho'})}
          className={`flex-1 p-3 rounded-xl font-bold text-[10px] transition-all shadow-sm ${
            formData.sexo === 'Macho' 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-400 hover:bg-white'
          }`}
          disabled={submitting}
        >
          MACHO
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <select
          className={inputStyle}
          value={formData.padre_id}
          onChange={e => setFormData({...formData, padre_id: e.target.value})}
          disabled={submitting}
        >
          <option value="">Padre?</option>
          {animales
            .filter(a => a.sexo === 'Macho')
            .map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))
          }
        </select>
        <select
          className={inputStyle}
          value={formData.madre_id}
          onChange={e => setFormData({...formData, madre_id: e.target.value})}
          disabled={submitting}
        >
          <option value="">Madre?</option>
          {animales
            .filter(a => a.sexo === 'Hembra')
            .map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))
          }
        </select>
      </div>
      
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting}
        >
          {submitting ? 'Guardando...' : 'Guardar Animal'}
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