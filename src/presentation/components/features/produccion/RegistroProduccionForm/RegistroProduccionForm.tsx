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
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      
      // Animación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      
      setFormData({
        animalId: '',
        litros: '',
        peso: '',
        fecha: formatearFechaParaInput()
      });
      setSearchTerm('');
    } finally {
      setSubmitting(false);
    }
  };

  // Agrupar animales por sexo
  const animalesPorSexo = animales.reduce((acc, animal) => {
    const sexo = animal.sexo || 'Otros';
    if (!acc[sexo]) acc[sexo] = [];
    acc[sexo].push(animal);
    return acc;
  }, {} as Record<string, Animal[]>);

  // Ordenar cada grupo
  Object.keys(animalesPorSexo).forEach(sexo => {
    animalesPorSexo[sexo].sort((a, b) => a.nombre.localeCompare(b.nombre));
  });

  // Filtrar por búsqueda
  const animalesFiltrados = animales.filter(animal => 
    animal.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.numeroArete?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Atajos rápidos para incrementar
  const incrementarLitros = (valor: number) => {
    const actual = parseFloat(formData.litros) || 0;
    setFormData({...formData, litros: (actual + valor).toFixed(1)});
  };

  const incrementarPeso = (valor: number) => {
    const actual = parseFloat(formData.peso) || 0;
    setFormData({...formData, peso: (actual + valor).toFixed(1)});
  };

  // Validación visual
  const litrosValido = formData.litros && parseFloat(formData.litros) > 0;
  const pesoValido = formData.peso && parseFloat(formData.peso) > 0;
  const hayDatos = litrosValido || pesoValido;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {/* Animación de éxito */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-50 rounded-2xl flex items-center justify-center z-50 animate-pulse">
          <div className="text-6xl">✓</div>
        </div>
      )}

      {/* 1. SELECTOR DE ANIMAL CON BÚSQUEDA */}
      <div className="relative">
        <label className="text-xs font-bold text-slate-700 ml-2 mb-1 block">
          🐄 Seleccionar Animal
        </label>
        
        {/* Input de búsqueda */}
        <input
          type="text"
          placeholder="Buscar por nombre o arete..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full h-14 px-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm mb-2"
          disabled={submitting}
        />

        {/* Selector mejorado */}
        <select
          className="w-full h-14 px-4 rounded-xl bg-white border-2 border-slate-200 text-slate-800 font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all shadow-sm hover:border-slate-300 focus:scale-[1.02] transform"
          value={formData.animalId}
          onChange={e => {
            setFormData({...formData, animalId: e.target.value});
            setSearchTerm('');
          }}
          required
          disabled={submitting}
        >
          <option value="">-- Seleccionar animal --</option>
          
          {searchTerm ? (
            // Resultados de búsqueda
            animalesFiltrados.map(animal => (
              <option key={animal.id} value={animal.id}>
                {animal.nombre} ({animal.numeroArete}) - {animal.sexo}
              </option>
            ))
          ) : (
            // Agrupados por sexo
            Object.entries(animalesPorSexo).map(([sexo, animalesGrupo]) => (
              <optgroup key={sexo} label={`${sexo === 'H' ? '🐂 Machos' : sexo === 'M' ? '🐄 Hembras' : '🐮 Otros'}`}>
                {animalesGrupo.map(animal => (
                  <option key={animal.id} value={animal.id}>
                    {animal.nombre} ({animal.numeroArete})
                  </option>
                ))}
              </optgroup>
            ))
          )}
        </select>
      </div>

      {/* 2. CAMPOS DE MEDICIÓN EN GRID */}
      <div className="grid grid-cols-2 gap-4">
        {/* LITROS */}
        <div>
          <label className="text-xs font-bold text-blue-600 ml-2 mb-1 block flex items-center gap-1">
            🥛 Litros de Leche
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={formData.litros}
            onChange={e => setFormData({...formData, litros: e.target.value})}
            disabled={submitting}
            className={`h-14 text-lg font-semibold text-center transition-all ${
              litrosValido 
                ? 'border-green-400 ring-2 ring-green-100' 
                : 'border-slate-200'
            } focus:scale-[1.02] transform`}
          />
          
          {/* Atajos rápidos litros */}
          <div className="flex gap-1 mt-2">
            <button
              type="button"
              onClick={() => incrementarLitros(0.5)}
              className="flex-1 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={submitting}
            >
              +0.5
            </button>
            <button
              type="button"
              onClick={() => incrementarLitros(1)}
              className="flex-1 py-1 text-xs font-bold bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              disabled={submitting}
            >
              +1.0
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, litros: ''})}
              className="flex-1 py-1 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              disabled={submitting}
            >
              ✕
            </button>
          </div>
        </div>

        {/* PESO */}
        <div>
          <label className="text-xs font-bold text-slate-600 ml-2 mb-1 block flex items-center gap-1">
            ⚖️ Peso (kg)
          </label>
          <Input
            type="number"
            step="0.1"
            min="0"
            placeholder="0.0"
            value={formData.peso}
            onChange={e => setFormData({...formData, peso: e.target.value})}
            disabled={submitting}
            className={`h-14 text-lg font-semibold text-center transition-all ${
              pesoValido 
                ? 'border-green-400 ring-2 ring-green-100' 
                : 'border-slate-200'
            } focus:scale-[1.02] transform`}
          />
          
          {/* Atajos rápidos peso */}
          <div className="flex gap-1 mt-2">
            <button
              type="button"
              onClick={() => incrementarPeso(5)}
              className="flex-1 py-1 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              disabled={submitting}
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => incrementarPeso(10)}
              className="flex-1 py-1 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              disabled={submitting}
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => setFormData({...formData, peso: ''})}
              className="flex-1 py-1 text-xs font-bold bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              disabled={submitting}
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {/* 3. FECHA CON OPCIONES RÁPIDAS */}
      <div>
        <label className="text-xs font-bold text-slate-700 ml-2 mb-1 block flex items-center gap-1">
          📅 Fecha de Medición
        </label>
        
        <div className="flex gap-2">
          <Input
            type="date"
            value={formData.fecha}
            onChange={e => setFormData({...formData, fecha: e.target.value})}
            required
            disabled={submitting}
            className="h-14 flex-1 font-medium"
          />
          
          {/* Botón "Ayer" */}
          <button
            type="button"
            onClick={() => {
              const ayer = new Date();
              ayer.setDate(ayer.getDate() - 1);
              setFormData({
                ...formData, 
                fecha: ayer.toISOString().split('T')[0]
              });
            }}
            className="px-4 h-14 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors text-sm"
            disabled={submitting}
          >
            Ayer
          </button>
        </div>
        
        {formData.fecha === formatearFechaParaInput() && (
          <p className="text-xs text-green-600 font-medium mt-1 ml-2">
            ✓ Hoy (recomendado)
          </p>
        )}
      </div>

      {/* ADVERTENCIA SI NO HAY DATOS */}
      {!hayDatos && formData.animalId && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-3 animate-shake">
          <p className="text-sm text-amber-700 font-medium text-center flex items-center justify-center gap-2">
            <span className="text-lg">⚠️</span>
            Debes registrar al menos litros o peso
          </p>
        </div>
      )}

      {/* 6. BOTÓN SUBMIT MEJORADO */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting || !hayDatos}
          className={`h-14 text-base font-bold rounded-xl transition-all ${
            submitting 
              ? 'bg-blue-400' 
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
          } ${!hayDatos ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : (
            '✓ Registrar Medición'
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
            className="h-14 px-6 font-bold rounded-xl"
          >
            Cancelar
          </Button>
        )}
      </div>

      {/* Indicador de progreso visual */}
      {submitting && (
        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse" style={{width: '100%'}} />
        </div>
      )}
    </form>
  );
}