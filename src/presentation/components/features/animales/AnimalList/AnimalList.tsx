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

  // ── Calcula la fecha estimada de destete (270 días tras nacimiento) ──────
  const obtenerFechaDestete = (fechaNacimiento: Date): string => {
    const fecha = new Date(fechaNacimiento);
    fecha.setDate(fecha.getDate() + 270);
    return fecha.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // ── Confirma y ejecuta la eliminación del animal ─────────────────────────
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

  // ── Alterna la visibilidad del árbol genealógico ─────────────────────────
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

  // ── Estado vacío ─────────────────────────────────────────────────────────
  if (animales.length === 0) {
    return (
      <Card className="text-center py-12 rounded-2xl shadow-md">
        <p className="text-4xl mb-3">🐃</p>
        <p className="text-slate-500 font-bold text-lg">Sin animales registrados</p>
        <p className="text-sm text-slate-400 mt-2">
          Registra tu primer búfalo en el formulario
        </p>
      </Card>
    );
  }

  return (
    // gap-4 = espaciado generoso entre tarjetas para no confundir elementos
    <div className="space-y-4">
      {animales.map(animal => {
        const padre = encontrarPadre(animal);
        const madre = encontrarMadre(animal);
        const fechaDestete = obtenerFechaDestete(animal.fechaNacimiento);
        const estaEliminando = eliminando === animal.id;
        const edadTexto = formatearEdadCorta(animal.fechaNacimiento);
        const edadCompleta = formatearEdadCompleta(animal.fechaNacimiento);
        const esMacho = animal.sexo === 'Macho';
        const arbolAbierto = verArbolId === animal.id;

        return (
          <div
            key={animal.id}
            // ── Tarjeta con color de fondo según sexo ──────────────────────
            // Azul muy suave → machos   |   Rosa suave → hembras
            // active:scale-[0.98] → feedback táctil inmediato al presionar
            className={`
              rounded-2xl shadow-lg border
              transition-all duration-200
              hover:-translate-y-0.5 hover:shadow-xl
              active:scale-[0.98] active:opacity-90
              overflow-hidden
              ${esMacho
                ? 'bg-[#EFF6FF] border-blue-100'
                : 'bg-[#FDF2F8] border-pink-100'
              }
            `}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {/* ── Franja de color superior según sexo ───────────────────── */}
            <div
              className={`h-1.5 w-full ${esMacho ? 'bg-blue-300' : 'bg-pink-300'}`}
            />

            <div className="p-5">
              {/* ── Encabezado: nombre + badge de sexo + acciones ─────────── */}
              <div className="flex justify-between items-start mb-3">
                {/* Información principal */}
                <div className="flex-1 min-w-0 mr-3">
                  {/* Nombre + badge sexo */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-2xl text-slate-900 leading-tight">
                      {animal.nombre}
                    </h4>
                    {/*
                      Badge de sexo: icono + letra
                      Tamaño aumentado respecto al original para mejor visibilidad
                    */}
                    <span
                      className={`
                        inline-flex items-center gap-1
                        text-sm font-black px-3 py-1 rounded-full
                        ${esMacho
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-pink-100 text-pink-600'
                        }
                      `}
                    >
                      <span className="text-base">{esMacho ? '🐂' : '🐄'}</span>
                      <span>{esMacho ? 'M' : 'H'}</span>
                    </span>
                  </div>

                  {/*
                    Número de arete en fuente monoespaciada
                    → Los dígitos alinean y se distinguen mejor (0 vs O, 1 vs I)
                  */}
                  <p className="text-sm font-bold text-slate-500 uppercase mt-1.5 tracking-wide">
                    Arete:{' '}
                    <span className="font-mono text-slate-700 text-base">
                      {animal.numeroArete}
                    </span>
                  </p>

                  {/* Edad con icono y tooltip de fecha exacta */}
                  <p className="text-sm text-emerald-600 font-bold mt-1.5 flex items-center gap-1.5">
                    <span>🕒</span>
                    <span>{edadTexto}</span>
                    {/* Tooltip accesible con fecha completa al mantener presionado */}
                    <span
                      className="text-slate-400 text-xs ml-1 cursor-help border-b border-dotted border-slate-300"
                      title={edadCompleta}
                    >
                      (detalle)
                    </span>
                  </p>
                </div>

                {/* ── Botones de acción ──────────────────────────────────── */}
                {/*
                  Mínimo 48×48px (p-3 = 12px padding + contenido)
                  para dedos adultos con guantes o manos sucias
                */}
                <div className="flex gap-2 flex-shrink-0">
                  {/* Árbol genealógico: siempre visible */}
                  <button
                    onClick={() => handleVerArbol(animal)}
                    title="Ver árbol genealógico"
                    className={`
                      min-w-[48px] min-h-[48px] p-3
                      rounded-xl font-bold text-sm
                      flex flex-col items-center justify-center gap-0.5
                      transition-all duration-200
                      active:scale-95
                      ${arbolAbierto
                        ? 'bg-amber-100 text-amber-700 shadow-inner'
                        : 'bg-white/70 text-slate-600 hover:bg-white shadow-sm hover:shadow'
                      }
                    `}
                  >
                    <span className="text-xl leading-none">🌳</span>
                    <span className="text-[10px] leading-none">Árbol</span>
                  </button>

                  {/* Editar (si el callback está disponible) */}
                  {onEditar && (
                    <button
                      onClick={() => onEditar(animal)}
                      title="Editar animal"
                      className="
                        min-w-[48px] min-h-[48px] p-3
                        rounded-xl font-bold text-sm
                        flex flex-col items-center justify-center gap-0.5
                        bg-white/70 text-slate-600
                        hover:bg-white shadow-sm hover:shadow
                        transition-all duration-200 active:scale-95
                      "
                    >
                      <span className="text-xl leading-none">✏️</span>
                      <span className="text-[10px] leading-none">Editar</span>
                    </button>
                  )}
                </div>
              </div>

              {/* ── Árbol genealógico expandible ──────────────────────────── */}
              {/*
                Animación: el árbol aparece con fade + slide hacia abajo
                Se usa max-height + opacity para transición CSS pura sin JS adicional
              */}
              <div
                className={`
                  overflow-hidden transition-all duration-300 ease-in-out
                  ${arbolAbierto ? 'max-h-48 opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}
                `}
              >
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-dashed border-slate-300 mt-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase mb-3 tracking-widest">
                    🌳 Genealogía Directa
                  </p>
                  <div className="space-y-2.5">
                    {/* Padre */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐂</span>
                        <span className="text-sm font-bold text-slate-500">Padre</span>
                      </div>
                      <span className={`
                        text-sm font-bold px-3 py-1 rounded-lg
                        ${padre ? 'text-blue-700 bg-blue-50' : 'text-slate-400 bg-slate-100'}
                      `}>
                        {padre ? padre.nombre : 'Sin registro'}
                      </span>
                    </div>
                    {/* Madre */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐄</span>
                        <span className="text-sm font-bold text-slate-500">Madre</span>
                      </div>
                      <span className={`
                        text-sm font-bold px-3 py-1 rounded-lg
                        ${madre ? 'text-pink-600 bg-pink-50' : 'text-slate-400 bg-slate-100'}
                      `}>
                        {madre ? madre.nombre : 'Sin registro'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Pie de tarjeta: fecha destete + botón eliminar ─────────── */}
              <div className={`
                flex justify-between items-center
                border-t pt-4
                ${esMacho ? 'border-blue-100' : 'border-pink-100'}
              `}>
                {/* Fecha de destete más visible con icono */}
                <div className="flex items-center gap-1.5">
                  <span className="text-base">📅</span>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                      Destete
                    </p>
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      {fechaDestete}
                    </p>
                  </div>
                </div>

                {/* Botón eliminar — tamaño táctil mínimo 48px ── */}
                <button
                  onClick={() => animal.id && handleEliminar(animal.id)}
                  disabled={estaEliminando}
                  className="
                    min-h-[48px] px-4
                    rounded-xl font-bold text-sm
                    flex items-center gap-1.5
                    bg-red-50 text-red-600
                    hover:bg-red-100 active:bg-red-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all duration-200 active:scale-95
                    border border-red-200
                  "
                >
                  {estaEliminando ? (
                    <>
                      <span className="animate-spin inline-block">⏳</span>
                      <span>Eliminando…</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Eliminar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
