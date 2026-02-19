import React from "react";
import { Animal } from "@/src/core/entities/Animal";
import { Card } from "../../../common/Card/Card";

interface ArbolGenealogicoProps {
  animal: Animal;
  animales: Animal[];
  nivel?: number;
  maxNivel?: number;
}

export function ArbolGenealogico({
  animal,
  animales,
  nivel = 0,
  maxNivel = 2,
}: ArbolGenealogicoProps) {
  // Detener recursión si excedemos el nivel máximo
  if (nivel > maxNivel) return null;

  // Encontrar padres del animal actual
  const padre = animales.find((a) => a.id === animal.padreId);
  const madre = animales.find((a) => a.id === animal.madreId);

  // Calcular edad del animal
  const calcularEdad = (fechaNacimiento: Date): string => {
    const hoy = new Date();
    const diff = hoy.getTime() - fechaNacimiento.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (dias < 30) return `${dias}d`;
    if (dias < 365) return `${Math.floor(dias / 30)}m`;
    return `${Math.floor(dias / 365)}a`;
  };

  // Estilos de color según sexo
  const getColorSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "text-blue-600" : "text-pink-600";
  };

  const getBgSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "bg-blue-50" : "bg-pink-50";
  };

  const getBorderSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "border-blue-200" : "border-pink-200";
  };

  const getHoverBorderSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "hover:border-blue-400" : "hover:border-pink-400";
  };

  // Estilos según nivel de profundidad
  const getTamañoPorNivel = () => {
    if (nivel === 0) return "text-base"; // Animal principal
    if (nivel === 1) return "text-sm"; // Padres
    return "text-xs"; // Abuelos
  };

  const getEspaciadoPorNivel = () => {
    if (nivel === 0) return "p-4";
    if (nivel === 1) return "p-3";
    return "p-2";
  };

  const getTamañoIcono = () => {
    if (nivel === 0) return "text-3xl";
    if (nivel === 1) return "text-2xl";
    return "text-xl";
  };

  const getBordeTamañoPorNivel = () => {
    if (nivel === 0) return "border-[3px]"; // Animal principal destacado
    return "border-2";
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
      {/* Animal actual - Tarjeta principal */}
      <Card 
        padding="none" 
        className={`
          ${getBgSexo(animal.sexo)} 
          ${getBorderSexo(animal.sexo)}
          ${getHoverBorderSexo(animal.sexo)}
          ${getBordeTamañoPorNivel()}
          ${getEspaciadoPorNivel()}
          transition-all duration-200 
          hover:shadow-md 
          hover:scale-[1.02]
          relative
          overflow-hidden
        `}
      >
        {/* Etiqueta de nivel (solo visual para nivel 0) */}
        {nivel === 0 && (
          <div className={`
            absolute top-0 right-0 
            ${animal.sexo === "Macho" ? "bg-blue-500" : "bg-pink-500"}
            text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg
          `}>
            Principal
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Icono del animal */}
          <div className={`
            ${getTamañoIcono()} 
            flex-shrink-0 
            transition-transform duration-200
            hover:scale-110
          `}>
            {animal.sexo === "Macho" ? "🐂" : "🐄"}
          </div>

          {/* Información del animal */}
          <div className="flex-1 min-w-0">
            <h4 className={`
              ${getTamañoPorNivel()} 
              font-black 
              ${getColorSexo(animal.sexo)}
              truncate
            `}>
              {animal.nombre}
            </h4>
            
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`
                ${nivel === 0 ? "text-[10px]" : "text-[8px]"} 
                font-semibold 
                text-slate-600
              `}>
                #{animal.numeroArete}
              </p>
              
              <span className="text-slate-400">•</span>
              
              <p className={`
                ${nivel === 0 ? "text-[10px]" : "text-[8px]"} 
                text-slate-500
              `}>
                {calcularEdad(animal.fechaNacimiento)}
              </p>
              
              {nivel === 0 && (
                <>
                  <span className="text-slate-400">•</span>
                  <p className="text-[10px] text-slate-500">
                    {animal.fechaNacimiento.toLocaleDateString('es', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sección de Padres */}
      {(padre || madre) && nivel < maxNivel && (
        <div className="relative">
          {/* Línea conectora vertical principal */}
          <div className={`
            absolute left-0 top-0 bottom-0 w-[2px] 
            bg-gradient-to-b from-slate-300 to-slate-200
            ${nivel === 0 ? "ml-6" : "ml-4"}
          `} />
          
          {/* Punto de conexión superior */}
          <div className={`
            absolute top-0 w-3 h-3 rounded-full 
            bg-slate-300 border-2 border-white
            ${nivel === 0 ? "left-[19px]" : "left-[13px]"}
            -translate-y-1/2
            shadow-sm
          `} />

          <div className={`
            ${nivel === 0 ? "ml-10 pl-6" : "ml-8 pl-4"} 
            space-y-4
          `}>
            {/* Padre */}
            {padre && (
              <div className="relative group">
                {/* Línea conectora horizontal */}
                <div className={`
                  absolute top-6 w-6 h-[2px] 
                  bg-slate-300
                  ${nivel === 0 ? "-left-6" : "-left-4"}
                  transition-all duration-200
                  group-hover:bg-blue-400
                `} />
                
                {/* Punto de conexión */}
                <div className={`
                  absolute top-6 w-2 h-2 rounded-full 
                  bg-blue-400 border border-white
                  ${nivel === 0 ? "-left-7" : "-left-5"}
                  -translate-y-1/2
                  shadow-sm
                  transition-all duration-200
                  group-hover:scale-125
                `} />

                {/* Etiqueta "Padre" */}
                {nivel === 0 && (
                  <div className="text-[10px] font-bold text-blue-600 mb-1 ml-1">
                    👨 PADRE
                  </div>
                )}

                <ArbolGenealogico
                  animal={padre}
                  animales={animales}
                  nivel={nivel + 1}
                  maxNivel={maxNivel}
                />
              </div>
            )}

            {/* Madre */}
            {madre && (
              <div className="relative group">
                {/* Línea conectora horizontal */}
                <div className={`
                  absolute top-6 w-6 h-[2px] 
                  bg-slate-300
                  ${nivel === 0 ? "-left-6" : "-left-4"}
                  transition-all duration-200
                  group-hover:bg-pink-400
                `} />
                
                {/* Punto de conexión */}
                <div className={`
                  absolute top-6 w-2 h-2 rounded-full 
                  bg-pink-400 border border-white
                  ${nivel === 0 ? "-left-7" : "-left-5"}
                  -translate-y-1/2
                  shadow-sm
                  transition-all duration-200
                  group-hover:scale-125
                `} />

                {/* Etiqueta "Madre" */}
                {nivel === 0 && (
                  <div className="text-[10px] font-bold text-pink-600 mb-1 ml-1">
                    👩 MADRE
                  </div>
                )}

                <ArbolGenealogico
                  animal={madre}
                  animales={animales}
                  nivel={nivel + 1}
                  maxNivel={maxNivel}
                />
              </div>
            )}

            {/* Estado: Sin padre o sin madre */}
            {!padre && nivel === 0 && (
              <div className="relative">
                <div className="absolute top-4 -left-6 w-6 h-[2px] bg-slate-200" />
                <div className="absolute top-4 -left-7 w-2 h-2 rounded-full bg-slate-300 border border-white -translate-y-1/2" />
                <div className="text-[10px] font-bold text-slate-400 mb-1 ml-1">
                  👨 PADRE
                </div>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-xl text-slate-300">❓</span>
                  <span className="text-xs text-slate-400 italic">Sin información</span>
                </div>
              </div>
            )}

            {!madre && nivel === 0 && (
              <div className="relative">
                <div className="absolute top-4 -left-6 w-6 h-[2px] bg-slate-200" />
                <div className="absolute top-4 -left-7 w-2 h-2 rounded-full bg-slate-300 border border-white -translate-y-1/2" />
                <div className="text-[10px] font-bold text-slate-400 mb-1 ml-1">
                  👩 MADRE
                </div>
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-xl text-slate-300">❓</span>
                  <span className="text-xs text-slate-400 italic">Sin información</span>
                </div>
              </div>
            )}
          </div>

          {/* Punto de conexión inferior */}
          {(padre || madre) && (
            <div className={`
              absolute bottom-0 w-3 h-3 rounded-full 
              bg-slate-200 border-2 border-white
              ${nivel === 0 ? "left-[19px]" : "left-[13px]"}
              translate-y-1/2
              shadow-sm
            `} />
          )}
        </div>
      )}
    </div>
  );
}
