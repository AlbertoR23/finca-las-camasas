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
  const [showSuccess, setShowSuccess] = useState(false);
  
  // 🎯 Validación en tiempo real
  const [touched, setTouched] = useState({
    nombre: false,
    arete: false,
  });

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
      
      // ✨ Animación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      setFormData({
        nombre: '',
        arete: '',
        nacimiento: formatearFechaParaInput(),
        sexo: 'Hembra',
        padre_id: '',
        madre_id: ''
      });
      
      setTouched({ nombre: false, arete: false });
    } finally {
      setSubmitting(false);
    }
  };

  // 🎨 Estilos base con validación visual
  const getInputStyle = (fieldName: 'nombre' | 'arete') => {
    const isValid = touched[fieldName] && formData[fieldName].length > 0;
    const isInvalid = touched[fieldName] && formData[fieldName].length === 0;
    
    return `w-full p-5 rounded-2xl bg-white border-2 text-slate-800 text-lg font-semibold 
      placeholder:text-slate-400 placeholder:font-normal
      focus:outline-none focus:ring-4 transition-all duration-200 shadow-md
      ${isValid ? 'border-green-500 focus:border-green-600 focus:ring-green-100' : ''}
      ${isInvalid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''}
      ${!touched[fieldName] ? 'border-slate-200 focus:border-blue-500 focus:ring-blue-100' : ''}
      disabled:opacity-50 disabled:cursor-not-allowed`;
  };

  const baseInputStyle = "w-full p-5 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 text-lg font-semibold placeholder:text-slate-400 placeholder:font-normal focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 shadow-md disabled:opacity-50";

  return (
    <div className="relative">
      {/* ✨ Animación de éxito */}
      {showSuccess && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-green-500/90 rounded-3xl animate-in fade-in zoom-in duration-300">
          <div className="text-center text-white">
            <div className="text-6xl mb-2">✓</div>
            <div className="text-xl font-bold">¡Animal Guardado!</div>
          </div>
        </div>
      )}

      {/* 🎯 Formulario con fondo destacado */}
      <form 
        onSubmit={handleSubmit} 
        className="space-y-5 bg-white p-6 rounded-3xl shadow-xl border border-slate-100"
      >
        {/* 📝 Campo Nombre - Grande y claro */}
        <div>
          <input
            placeholder="🐃 Nombre del Búfalo (ej: Trueno)"
            className={getInputStyle('nombre')}
            value={formData.nombre}
            onChange={e => setFormData({...formData, nombre: e.target.value})}
            onBlur={() => setTouched({...touched, nombre: true})}
            required
            disabled={submitting}
            autoComplete="off"
          />
          {touched.nombre && formData.nombre.length === 0 && (
            <p className="text-red-500 text-sm mt-2 ml-2 font-medium">* Campo requerido</p>
          )}
        </div>
        
        {/* 🏷️ Arete y Fecha - Grid optimizado para thumbs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              placeholder="🏷️ Arete / ID"
              className={getInputStyle('arete')}
              value={formData.arete}
              onChange={e => {
                // 🔍 Autocompletado inteligente: convertir a mayúsculas
                const valor = e.target.value.toUpperCase();
                setFormData({...formData, arete: valor});
              }}
              onBlur={() => setTouched({...touched, arete: true})}
              required
              disabled={submitting}
              autoComplete="off"
            />
            {touched.arete && formData.arete.length === 0 && (
              <p className="text-red-500 text-sm mt-2 ml-2 font-medium">* Campo requerido</p>
            )}
          </div>
          
          <input
            type="date"
            className={baseInputStyle}
            value={formData.nacimiento}
            onChange={e => setFormData({...formData, nacimiento: e.target.value})}
            required
            disabled={submitting}
            max={formatearFechaParaInput()} // No permitir fechas futuras
          />
        </div>
        
        {/* 🚻 Selector de Sexo - Toggle visual con iconos grandes */}
        <div className="bg-slate-50 p-2 rounded-2xl shadow-inner">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({...formData, sexo: 'Hembra'})}
              className={`flex-1 p-5 rounded-xl font-bold text-base transition-all duration-200 shadow-sm
                ${formData.sexo === 'Hembra' 
                  ? 'bg-gradient-to-br from-pink-500 to-pink-600 text-white scale-105 shadow-lg' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 hover:scale-102'
                }`}
              disabled={submitting}
            >
              <div className="text-3xl mb-1">🐄</div>
              <div>HEMBRA</div>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({...formData, sexo: 'Macho'})}
              className={`flex-1 p-5 rounded-xl font-bold text-base transition-all duration-200 shadow-sm
                ${formData.sexo === 'Macho' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white scale-105 shadow-lg' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 hover:scale-102'
                }`}
              disabled={submitting}
            >
              <div className="text-3xl mb-1">🐂</div>
              <div>MACHO</div>
            </button>
          </div>
        </div>

        {/* 👨‍👩‍👧 Selectores de Padres - Mejorados con iconos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <select
              className={`${baseInputStyle} appearance-none cursor-pointer`}
              value={formData.padre_id}
              onChange={e => setFormData({...formData, padre_id: e.target.value})}
              disabled={submitting}
            >
              <option value="">🐂 Seleccionar Padre (opcional)</option>
              {animales
                .filter(a => a.sexo === 'Macho')
                .map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.numeroArete ? `- ${a.numeroArete}` : ''}
                  </option>
                ))
              }
            </select>
            {/* Flecha personalizada */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <select
              className={`${baseInputStyle} appearance-none cursor-pointer`}
              value={formData.madre_id}
              onChange={e => setFormData({...formData, madre_id: e.target.value})}
              disabled={submitting}
            >
              <option value="">🐄 Seleccionar Madre (opcional)</option>
              {animales
                .filter(a => a.sexo === 'Hembra')
                .map(a => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.numeroArete ? `- ${a.numeroArete}` : ''}
                  </option>
                ))
              }
            </select>
            {/* Flecha personalizada */}
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* 🎯 Botones de acción - Siempre visibles y grandes */}
        <div className="flex gap-3 pt-3">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={submitting}
            className="!p-5 !text-lg !font-bold shadow-lg hover:shadow-xl transition-all duration-200"
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
              '✓ Guardar Animal'
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={submitting}
              className="!p-5 !text-lg !font-bold"
            >
              ✕
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}