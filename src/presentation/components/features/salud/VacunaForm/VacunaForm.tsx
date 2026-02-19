import React, { useState, useMemo } from 'react';
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

// Vacunas comunes para autocompletado
const VACUNAS_COMUNES = [
  'Fiebre Aftosa',
  'Brucelosis',
  'Rabia',
  'Carbón Sintomático',
  'IBR/DVB',
  'Leptospirosis',
  'Clostridiosis',
  'Anaplasmosis',
  'Babesiosis',
  'Neumonía'
];

export function VacunaForm({ animales, onSubmit, onCancel }: VacunaFormProps) {
  const [formData, setFormData] = useState({
    animalId: '',
    nombreVacuna: '',
    fechaAplicacion: formatearFechaParaInput(),
    proximaDosis: formatearFechaParaInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // +30 días por defecto
    lote: '',
    laboratorio: '',
    dosis: '',
    observaciones: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchAnimal, setSearchAnimal] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Validación de fechas
  const validarFechas = () => {
    if (!formData.proximaDosis) return true;
    const aplicacion = crearFechaLocal(formData.fechaAplicacion);
    const proxima = crearFechaLocal(formData.proximaDosis);
    return proxima > aplicacion;
  };

  const fechasValidas = validarFechas();

  // Calcular días hasta próxima dosis
  const diasHastaProximaDosis = useMemo(() => {
    if (!formData.proximaDosis) return null;
    const aplicacion = crearFechaLocal(formData.fechaAplicacion);
    const proxima = crearFechaLocal(formData.proximaDosis);
    const diff = proxima.getTime() - aplicacion.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [formData.fechaAplicacion, formData.proximaDosis]);

  // Alerta si próxima dosis es > 365 días
  const alertaFechaLejana = diasHastaProximaDosis && diasHastaProximaDosis > 365;

  // Filtrar sugerencias de vacunas
  const sugerenciasFiltradas = VACUNAS_COMUNES.filter(vacuna =>
    vacuna.toLowerCase().includes(formData.nombreVacuna.toLowerCase())
  );

  // Filtrar animales por búsqueda
  const animalesFiltrados = useMemo(() => {
    const sorted = [...animales].sort((a, b) => a.nombre.localeCompare(b.nombre));
    if (!searchAnimal) return sorted;
    return sorted.filter(animal =>
      animal.nombre.toLowerCase().includes(searchAnimal.toLowerCase()) ||
      animal.numeroArete.toLowerCase().includes(searchAnimal.toLowerCase())
    );
  }, [animales, searchAnimal]);

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
      
      // Mostrar éxito con checkmark
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      // Reset del formulario
      setFormData({
        animalId: '',
        nombreVacuna: '',
        fechaAplicacion: formatearFechaParaInput(),
        proximaDosis: formatearFechaParaInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        lote: '',
        laboratorio: '',
        dosis: '',
        observaciones: ''
      });
      setSearchAnimal('');
    } finally {
      setSubmitting(false);
    }
  };

  const animalSeleccionado = animales.find(a => a.id === formData.animalId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. SELECTOR DE ANIMAL MEJORADO */}
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          🐃 Seleccionar Animal
        </label>
        <div className="relative">
          <input
            type="text"
            className="w-full h-14 px-4 pr-10 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 font-semibold focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm"
            placeholder="Buscar por nombre o arete..."
            value={searchAnimal}
            onChange={e => setSearchAnimal(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            disabled={submitting}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
        
        {showSuggestions && searchAnimal && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto">
            {animalesFiltrados.length > 0 ? (
              animalesFiltrados.map(animal => (
                <button
                  key={animal.id}
                  type="button"
                  className="w-full px-4 py-3 text-left hover:bg-purple-50 transition-colors flex items-center gap-3 border-b border-slate-100 last:border-0"
                  onClick={() => {
                    if (animal.id) {
                      setFormData({...formData, animalId: animal.id});
                      setSearchAnimal(`${animal.nombre} (${animal.numeroArete})`);
                      setShowSuggestions(false);
                    }
                  }}
                >
                  <span className="text-2xl">🐃</span>
                  <div>
                    <div className="font-semibold text-slate-800">{animal.nombre}</div>
                    <div className="text-sm text-slate-500">Arete: {animal.numeroArete}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-slate-500 text-center">
                No se encontraron animales
              </div>
            )}
          </div>
        )}
        
        <select
          className="hidden"
          value={formData.animalId}
          onChange={e => {
            const animal = animales.find(a => a.id === e.target.value);
            setFormData({...formData, animalId: e.target.value});
            if (animal) setSearchAnimal(`${animal.nombre} (${animal.numeroArete})`);
          }}
          required
        >
          <option value="">Seleccionar animal...</option>
          {animales.map(animal => (
            <option key={animal.id} value={animal.id}>
              {animal.nombre} ({animal.numeroArete})
            </option>
          ))}
        </select>
        
        {animalSeleccionado && (
          <div className="mt-2 p-3 bg-purple-50 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">🐃</span>
              <span className="font-semibold text-purple-900">
                {animalSeleccionado.nombre}
              </span>
              <span className="text-purple-600">
                • Arete: {animalSeleccionado.numeroArete}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. NOMBRE DE VACUNA CON AUTOCOMPLETADO */}
      <div className="relative">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          💉 Nombre de la Vacuna
        </label>
        <Input
          placeholder="Ej: Fiebre Aftosa, Brucelosis..."
          value={formData.nombreVacuna}
          onChange={e => setFormData({...formData, nombreVacuna: e.target.value})}
          required
          disabled={submitting}
          className="h-14"
        />
        
        {formData.nombreVacuna && sugerenciasFiltradas.length > 0 && (
          <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg">
            {sugerenciasFiltradas.slice(0, 5).map(vacuna => (
              <button
                key={vacuna}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-purple-50 transition-colors text-sm font-medium text-slate-700 border-b border-slate-100 last:border-0"
                onClick={() => setFormData({...formData, nombreVacuna: vacuna})}
              >
                💉 {vacuna}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. FECHAS EN GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            📅 Fecha de Aplicación
          </label>
          <Input
            type="date"
            value={formData.fechaAplicacion}
            onChange={e => setFormData({...formData, fechaAplicacion: e.target.value})}
            required
            disabled={submitting}
            className={`h-14 ${!fechasValidas ? 'border-rose-500' : ''}`}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ⏰ Próxima Dosis
          </label>
          <Input
            type="date"
            value={formData.proximaDosis}
            onChange={e => setFormData({...formData, proximaDosis: e.target.value})}
            disabled={submitting}
            className={`h-14 ${!fechasValidas ? 'border-rose-500' : ''}`}
          />
        </div>
      </div>

      {/* 4. VALIDACIÓN DE FECHAS */}
      {!fechasValidas && (
        <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-semibold text-rose-700">
            La próxima dosis debe ser posterior a la fecha de aplicación
          </p>
        </div>
      )}

      {/* 5. INFORMACIÓN ADICIONAL */}
      {fechasValidas && diasHastaProximaDosis !== null && (
        <div className={`p-3 rounded-xl border-2 ${
          alertaFechaLejana 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{alertaFechaLejana ? '⚠️' : 'ℹ️'}</span>
            <div>
              <p className={`font-semibold ${
                alertaFechaLejana ? 'text-amber-800' : 'text-blue-800'
              }`}>
                {diasHastaProximaDosis} días hasta la próxima dosis
              </p>
              {alertaFechaLejana && (
                <p className="text-xs text-amber-600 mt-1">
                  La fecha parece muy lejana. Verifica que sea correcta.
                </p>
              )}
              {diasHastaProximaDosis <= 90 && !alertaFechaLejana && (
                <p className="text-xs text-blue-600 mt-1">
                  💡 Recuerda programar un recordatorio para la dosis de refuerzo
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. CAMPOS OPCIONALES */}
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-2">
          <span className="group-open:rotate-90 transition-transform">▶</span>
          Información adicional (opcional)
        </summary>
        
        <div className="mt-4 space-y-4 pl-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              placeholder="Lote"
              value={formData.lote}
              onChange={e => setFormData({...formData, lote: e.target.value})}
              disabled={submitting}
            />
            <Input
              placeholder="Laboratorio"
              value={formData.laboratorio}
              onChange={e => setFormData({...formData, laboratorio: e.target.value})}
              disabled={submitting}
            />
          </div>
          
          <Input
            type="number"
            placeholder="Dosis (ml)"
            value={formData.dosis}
            onChange={e => setFormData({...formData, dosis: e.target.value})}
            disabled={submitting}
            step="0.1"
            min="0"
          />
          
          <textarea
            className="w-full p-3 rounded-xl bg-white border-2 border-slate-200 text-slate-800 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all shadow-sm resize-none"
            placeholder="Observaciones..."
            value={formData.observaciones}
            onChange={e => setFormData({...formData, observaciones: e.target.value})}
            disabled={submitting}
            rows={3}
          />
        </div>
      </details>

      {/* 6. BOTÓN SUBMIT CON ANIMACIONES */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={submitting || !fechasValidas || !formData.animalId}
          className={`h-14 bg-purple-600 hover:bg-purple-700 transition-all duration-300 ${
            showSuccess ? 'bg-green-500 hover:bg-green-500' : ''
          }`}
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Guardando...
            </span>
          ) : showSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">✓</span>
              ¡Registrado!
            </span>
          ) : (
            '💉 Registrar Vacuna'
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={submitting}
            className="h-14"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}