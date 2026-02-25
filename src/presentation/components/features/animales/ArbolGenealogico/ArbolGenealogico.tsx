import React from "react";
import { Animal } from "@/src/core/entities/Animal";
import { Card } from "../../../common/Card/Card";

interface ArbolGenealogicoProps {
  animal: Animal;
  animales: Animal[];
  nivel?: number;
  maxNivel?: number;
}

// Calcula edad legible desde fecha de nacimiento
function calcularEdad(fecha: Date): string {
  const hoy = new Date();
  const meses =
    (hoy.getFullYear() - fecha.getFullYear()) * 12 +
    (hoy.getMonth() - fecha.getMonth());
  if (meses < 12) return `${meses}m`;
  return `${Math.floor(meses / 12)}a ${meses % 12}m`;
}

// Tarjeta de "Sin información" cuando no hay padre/madre registrado
function TarjetaDesconocido({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400 text-xs select-none">
      <span className="text-base">❓</span>
      <span className="italic">{label} sin registro</span>
    </div>
  );
}

export function ArbolGenealogico({
  animal,
  animales,
  nivel = 0,
  maxNivel = 2,
}: ArbolGenealogicoProps) {
  if (nivel > maxNivel) return null;

  // ── Lógica de búsqueda de padres (sin modificar) ──────────────────────────
  const padre = animales.find((a) => a.id === animal.padreId);
  const madre = animales.find((a) => a.id === animal.madreId);

  // ── Colores por sexo (sin modificar lógica, mejorado estilo) ─────────────
  const getColorSexo = (sexo: "Macho" | "Hembra") =>
    sexo === "Macho" ? "text-blue-600" : "text-pink-600";

  const getBgSexo = (sexo: "Macho" | "Hembra") =>
    sexo === "Macho" ? "bg-blue-50" : "bg-pink-50";

  // Grosor del borde según nivel de profundidad: raíz más destacada
  const borderWidth = nivel === 0 ? "border-2" : "border";
  const borderColor =
    animal.sexo === "Macho" ? "border-blue-300" : "border-pink-300";

  // Tamaño de fuente decrece por nivel para indicar jerarquía
  const nombreSize = nivel === 0 ? "text-base" : nivel === 1 ? "text-sm" : "text-xs";
  const infoSize = nivel === 0 ? "text-xs" : "text-[10px]";
  const iconSize = nivel === 0 ? "text-2xl" : nivel === 1 ? "text-xl" : "text-base";

  // Indentación proporcional por nivel
  const indentClass = nivel === 0 ? "" : "ml-5 pl-4";

  const tienePadres = padre || madre;
  const mostrarPadres = tienePadres && nivel < maxNivel;

  return (
    <div className={`${indentClass}`}>
      {/* ── Tarjeta del animal ───────────────────────────────────────────── */}
      <div
        className={`
          group relative flex items-center gap-3 px-3 py-2 rounded-xl
          ${getBgSexo(animal.sexo)} ${borderWidth} ${borderColor}
          transition-transform duration-200 ease-out
          hover:scale-[1.02] hover:shadow-md cursor-default
          ${nivel === 0 ? "shadow-sm" : ""}
        `}
      >
        {/* Indicador de nivel raíz */}
        {nivel === 0 && (
          <span className="absolute -top-2 left-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 bg-white px-1 rounded">
            Animal
          </span>
        )}

        {/* Icono por sexo */}
        <span className={`${iconSize} leading-none`}>
          {animal.sexo === "Macho" ? "🐂" : "🐄"}
        </span>

        {/* Datos */}
        <div className="min-w-0 flex-1">
          <p className={`font-bold leading-tight truncate ${nombreSize} ${getColorSexo(animal.sexo)}`}>
            {animal.nombre}
          </p>
          <p className={`${infoSize} text-slate-500 truncate`}>
            #{animal.numeroArete}
            {animal.fechaNacimiento && (
              <>
                {" · "}
                {animal.fechaNacimiento.toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "2-digit",
                })}
                {" · "}
                <span className="font-medium">{calcularEdad(animal.fechaNacimiento)}</span>
              </>
            )}
          </p>
        </div>

        {/* Badge de rol en el árbol */}
        {nivel > 0 && (
          <span
            className={`
              shrink-0 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full
              ${animal.sexo === "Macho"
                ? "bg-blue-100 text-blue-500"
                : "bg-pink-100 text-pink-500"}
            `}
          >
            {animal.sexo === "Macho" ? "Padre" : "Madre"}
          </span>
        )}
      </div>

      {/* ── Rama de padres ───────────────────────────────────────────────── */}
      {mostrarPadres && (
        <div
          className="
            mt-2 ml-4 pl-4
            border-l-2 border-dashed border-slate-300
            space-y-2
          "
          style={{ animation: "fadeIn 0.25s ease-out" }}
        >
          {/* Padre */}
          {padre ? (
            <div className="relative">
              {/* Línea horizontal de conexión */}
              <div className="absolute -left-[18px] top-5 w-4 h-[2px] bg-slate-300" />
              <ArbolGenealogico
                animal={padre}
                animales={animales}
                nivel={nivel + 1}
                maxNivel={maxNivel}
              />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -left-[18px] top-3 w-4 h-[2px] bg-slate-200" />
              <TarjetaDesconocido label="Padre" />
            </div>
          )}

          {/* Madre */}
          {madre ? (
            <div className="relative">
              <div className="absolute -left-[18px] top-5 w-4 h-[2px] bg-slate-300" />
              <ArbolGenealogico
                animal={madre}
                animales={animales}
                nivel={nivel + 1}
                maxNivel={maxNivel}
              />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute -left-[18px] top-3 w-4 h-[2px] bg-slate-200" />
              <TarjetaDesconocido label="Madre" />
            </div>
          )}
        </div>
      )}

      {/* Keyframe inline para entrada suave (se puede mover a globals.css) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
