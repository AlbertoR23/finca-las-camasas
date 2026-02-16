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
  if (nivel > maxNivel) return null;

  const padre = animales.find((a) => a.id === animal.padreId);
  const madre = animales.find((a) => a.id === animal.madreId);

  const getColorSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "text-blue-600" : "text-pink-600";
  };

  const getBgSexo = (sexo: "Macho" | "Hembra") => {
    return sexo === "Macho" ? "bg-blue-50" : "bg-pink-50";
  };

  return (
    <div className="space-y-3">
      {/* Animal actual */}
      <Card padding="sm" className={`${getBgSexo(animal.sexo)} border-2`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">
            {animal.sexo === "Macho" ? "🐂" : "🐄"}
          </span>
          <div>
            <h4 className={`font-black ${getColorSexo(animal.sexo)}`}>
              {animal.nombre}
            </h4>
            <p className="text-[8px] font-bold text-slate-500">
              {animal.numeroArete} • Nac:{" "}
              {animal.fechaNacimiento.toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Padres */}
      {(padre || madre) && nivel < maxNivel && (
        <div className="ml-6 pl-4 border-l-2 border-dashed border-slate-300 space-y-3">
          {padre && (
            <div className="relative">
              <div className="absolute -left-6 top-4 w-4 h-[2px] bg-slate-300" />
              <ArbolGenealogico
                animal={padre}
                animales={animales}
                nivel={nivel + 1}
                maxNivel={maxNivel}
              />
            </div>
          )}

          {madre && (
            <div className="relative">
              <div className="absolute -left-6 top-4 w-4 h-[2px] bg-slate-300" />
              <ArbolGenealogico
                animal={madre}
                animales={animales}
                nivel={nivel + 1}
                maxNivel={maxNivel}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
