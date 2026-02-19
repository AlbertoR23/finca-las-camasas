import React, { useState } from 'react';
import { Animal } from '@/src/core/entities/Animal';
import { Button } from '../../../common/Button/Button';
import { Card } from '../../../common/Card/Card';
import { useEdadAnimal } from '@/src/presentation/hooks/useEdadAnimal';

interface AnimalListProps {
  animales: Animal[];
  onEliminar: (id: string) => Promise<void>;
  onVerArbol: (animal: Animal) => void;
  onEditar?: (animal: Animal) => void;
}

export function AnimalList({ animales, onEliminar, onVerArbol, onEditar }: AnimalListProps) {
  const [verArbolId, setVerArbolId] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState<string | null>(null);
  const { formatearEdadCorta, formatearEdadCompleta } = useEdadAnimal();

  const obtenerFechaDestete = (fechaNacimiento: Date): string => {
    const fecha = new Date(fechaNacimiento);
    fecha.setDate(fecha.getDate() + 270);
    return fecha.toLocaleDateString('es-VE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const handleEliminar = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este animal permanentemente?')) {
      setEliminando(id);
      try {
        await onEliminar(id);
      } finally {
        setEliminando(null);
      }
    }
  };

  const handleVerArbol = (animal: Animal) => {
    if (verArbolId === animal.id) {
      setVerArbolId(null);
    } else {
      if (animal.id) setVerArbolId(animal.id);
      onVerArbol(animal);
    }
  };

  const encontrarPadre = (animal: Animal): Animal | undefined => {
    if (!animal.padreId) return undefined;
    return animales.find(a => a.id === animal.padreId);
  };

  const encontrarMadre = (animal: Animal): Animal | undefined => {
    if (!animal.madreId) return undefined;
    return animales.find(a => a.id === animal.madreId);
  };

  if (animales.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-slate-500 font-bold text-lg">No hay animales registrados</p>
        <p className="text-sm text-slate-400 mt-2">
          Registra tu primer búfalo en el formulario
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {animales.map(animal => {
        const padre = encontrarPadre(animal);
        const madre = encontrarMadre(animal);
        const fechaDestete = obtenerFechaDestete(animal.fechaNacimiento);
        const estaEliminando = eliminando === animal.id;
        const edadTexto = formatearEdadCorta(animal.fechaNacimiento);
        const edadCompleta = formatearEdadCompleta(animal.fechaNacimiento);

        return (
          <Card 
            key={animal.id} 
            /* 🎨 Tarjeta elevada con sombra suave y transición smooth */
            className={`
              shadow-lg hover:shadow-xl active:shadow-md
              transition-all duration-200 ease-in-out
              hover:scale-[1.01] active:scale-[0.98]
              ${animal.sexo === 'Macho' 
                ? 'bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-400' 
                : 'bg-gradient-to-br from-pink-50 to-white border-l-4 border-pink-400'
              }
            `}
          >
            {/* 📱 Header con espaciado generoso (p-4) */}
            <div className="flex justify-between items-start mb-4 p-4 pb-0">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-black text-2xl text-slate-900">
                    {animal.nombre}
                  </h4>
                  {/* 🎯 Badge de sexo más visible con iconos */}
                  <span className={`
                    text-sm font-black px-3 py-1.5 rounded-full
                    flex items-center gap-1.5
                    shadow-sm
                    ${animal.sexo === 'Macho' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-pink-100 text-pink-700 border border-pink-200'
                    }
                  `}>
                    <span className="text-base">{animal.sexo === 'Macho' ? '🐂' : '🐄'}</span>
                    <span>{animal.sexo === 'Macho' ? 'M' : 'H'}</span>
                  </span>
                </div>
                
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  ID: {animal.numeroArete}
                </p>
                
                {/* 🕒 Edad destacada con icono y color verde */}
                <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <span className="text-base">🕒</span>
                  <span className="text-sm font-black text-emerald-700">{edadTexto}</span>
                  <span 
                    className="text-xs text-slate-500 cursor-help border-b border-dotted border-slate-400 ml-1" 
                    title={edadCompleta}
                  >
                    ver detalle
                  </span>
                </div>
              </div>
              
              {/* ⚡ Botones táctiles grandes (min 44x44px) */}
              <div className="flex gap-2 ml-2">
                <button
                  onClick={() => handleVerArbol(animal)}
                  /* 📏 Área táctil expandida con padding generoso */
                  className={`
                    min-w-[44px] min-h-[44px]
                    px-4 py-2.5
                    rounded-xl font-bold text-sm
                    transition-all duration-200
                    hover:scale-105 active:scale-95
                    shadow-md hover:shadow-lg
                    ${verArbolId === animal.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                    }
                  `}
                >
                  <span className="text-base">🌳</span>
                </button>
                
                {onEditar && (
                  <button
                    onClick={() => onEditar(animal)}
                    className="
                      min-w-[44px] min-h-[44px]
                      px-4 py-2.5
                      rounded-xl font-bold text-sm
                      bg-white text-slate-700
                      border-2 border-slate-200
                      hover:border-amber-300 hover:bg-amber-50
                      shadow-md hover:shadow-lg
                      transition-all duration-200
                      hover:scale-105 active:scale-95
                    "
                  >
                    <span className="text-base">✏️</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* 🌳 Árbol genealógico con animación de deslizamiento */}
            {verArbolId === animal.id && (
              <div className={`
                mx-4 mb-4 p-5 rounded-2xl
                bg-gradient-to-br from-slate-50 to-slate-100
                border-2 border-dashed border-slate-300
                animate-in slide-in-from-top-2 fade-in duration-300
                shadow-inner
              `}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">👨‍👩‍👦</span>
                  <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Genealogía Directa
                  </p>
                </div>
                
                <div className="space-y-3">
                  {/* Padre */}
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🐂</span>
                      <span className="text-xs text-slate-500 font-bold">Padre</span>
                    </div>
                    <span className="font-black text-sm text-slate-800">
                      {padre ? padre.nombre : '---'}
                    </span>
                  </div>
                  
                  {/* Madre */}
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🐄</span>
                      <span className="text-xs text-slate-500 font-bold">Madre</span>
                    </div>
                    <span className="font-black text-sm text-slate-800">
                      {madre ? madre.nombre : '---'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* 📅 Footer con espaciado generoso */}
            <div className="flex justify-between items-center border-t-2 border-slate-100 pt-4 px-4 pb-4 mt-2">
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg">
                <span className="text-sm">📅</span>
                <p className="text-xs font-bold text-slate-500">
                  Destete: <span className="text-slate-700 font-black">{fechaDestete}</span>
                </p>
              </div>
              
              {/* 🗑️ Botón eliminar con área táctil grande */}
              <button
                onClick={() => animal.id && handleEliminar(animal.id)}
                disabled={estaEliminando}
                className="
                  min-w-[44px] min-h-[44px]
                  px-5 py-2.5
                  rounded-xl font-bold text-sm
                  bg-red-500 text-white
                  hover:bg-red-600 active:bg-red-700
                  disabled:bg-red-300 disabled:cursor-not-allowed
                  shadow-md hover:shadow-lg
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                "
              >
                {estaEliminando ? '⏳ Eliminando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}