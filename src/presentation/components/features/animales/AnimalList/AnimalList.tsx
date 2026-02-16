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
      <Card className="text-center py-8">
        <p className="text-slate-400 font-bold">No hay animales registrados</p>
        <p className="text-[10px] text-slate-300 mt-2">
          Registra tu primer búfalo en el formulario
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {animales.map(animal => {
        const padre = encontrarPadre(animal);
        const madre = encontrarMadre(animal);
        const fechaDestete = obtenerFechaDestete(animal.fechaNacimiento);
        const estaEliminando = eliminando === animal.id;
        const edadTexto = formatearEdadCorta(animal.fechaNacimiento);
        const edadCompleta = formatearEdadCompleta(animal.fechaNacimiento);

        return (
          <Card key={animal.id} className="hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-xl text-slate-900">
                    {animal.nombre}
                  </h4>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                    animal.sexo === 'Macho' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-pink-50 text-pink-500'
                  }`}>
                    {animal.sexo === 'Macho' ? 'M' : 'H'}
                  </span>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">
                  ID: {animal.numeroArete}
                </p>
                {/* NUEVO: Mostrar edad */}
                <p className="text-[9px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                  <span>🕒</span>
                  <span>{edadTexto}</span>
                  <span 
                    className="text-slate-400 text-[8px] ml-1 cursor-help border-b border-dotted border-slate-300" 
                    title={edadCompleta}
                  >
                    (detalle)
                  </span>
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleVerArbol(animal)}
                >
                  🌳 Árbol
                </Button>
                {onEditar && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEditar(animal)}
                  >
                    ✏️
                  </Button>
                )}
              </div>
            </div>
            
            {/* Árbol genealógico */}
            {verArbolId === animal.id && (
              <div className="bg-[#F8F9FA] p-4 rounded-2xl mb-4 border border-dashed border-slate-300 animate-in zoom-in-95 duration-300">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-3">
                  Genealogía Directa
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Padre</span>
                    <span className="font-bold text-slate-800">
                      {padre ? padre.nombre : '---'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-bold">Madre</span>
                    <span className="font-bold text-slate-800">
                      {madre ? madre.nombre : '---'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t border-slate-50 pt-3">
              <p className="text-[9px] font-bold text-slate-400">
                Destete: <span className="text-slate-600">{fechaDestete}</span>
              </p>
              <Button
                variant="danger"
                size="sm"
                onClick={() => animal.id && handleEliminar(animal.id)}
                disabled={estaEliminando}
              >
                {estaEliminando ? '...' : 'Eliminar'}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}