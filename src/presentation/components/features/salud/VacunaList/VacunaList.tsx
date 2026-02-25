import React, { useState, useCallback } from "react";
import { Vacuna } from "@/src/core/entities/Vacuna";
import { Button } from "../../../common/Button/Button";
import { Card } from "../../../common/Card/Card";

// ============================================================
// TIPOS Y CONSTANTES
// ============================================================

type FiltroEstado = "todos" | "vencidas" | "proximas" | "normales";
type OrdenFecha = "asc" | "desc";

interface VacunaListProps {
  vacunas: Vacuna[];
  vacunasVencidas: Vacuna[];
  onEliminar: (id: string) => Promise<void>;
  onEnviarAlerta: (vacuna: Vacuna) => Promise<void>;
}

// ============================================================
// COMPONENTE TOOLTIP REUTILIZABLE
// ============================================================

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="
            absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
            px-2 py-1 text-[10px] font-semibold text-white bg-slate-800
            rounded-md whitespace-nowrap shadow-lg pointer-events-none
          "
        >
          {text}
          {/* Flecha del tooltip */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

// ============================================================
// BADGE DE DÍAS PARA VENCIMIENTO
// ============================================================

function DiaBadge({
  dias,
  estaVencida,
}: {
  dias: number | null;
  estaVencida: boolean;
}) {
  if (dias === null) return null;

  const absD = Math.abs(dias);

  if (estaVencida) {
    return (
      <Tooltip
        text={`Venció hace exactamente ${absD} día${absD !== 1 ? "s" : ""}`}
      >
        <span
          className="
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wide
            border border-rose-300 cursor-default
          "
        >
          🚨 Hace {absD}d
        </span>
      </Tooltip>
    );
  }

  if (dias <= 7) {
    return (
      <Tooltip text={`Vence en ${dias} día${dias !== 1 ? "s" : ""}`}>
        <span
          className="
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full
            bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-wide
            border border-amber-300 cursor-default
          "
        >
          ⚠️ En {dias}d
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip text={`Faltan ${dias} días para vencer`}>
      <span
        className="
          inline-flex items-center gap-1 px-2 py-0.5 rounded-full
          bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-wide
          border border-emerald-200 cursor-default
        "
      >
        ✅ En {dias}d
      </span>
    </Tooltip>
  );
}

// ============================================================
// ESTADO VACÍO
// ============================================================

function EstadoVacio({ filtro }: { filtro: FiltroEstado }) {
  const mensajes: Record<
    FiltroEstado,
    { icono: string; titulo: string; subtitulo: string }
  > = {
    todos: {
      icono: "💉",
      titulo: "Sin vacunas registradas",
      subtitulo: "Registra la primera vacuna en el formulario de arriba.",
    },
    vencidas: {
      icono: "✅",
      titulo: "¡Sin vacunas vencidas!",
      subtitulo: "Todos los animales están al día. Buen trabajo.",
    },
    proximas: {
      icono: "📅",
      titulo: "Sin vencimientos próximos",
      subtitulo: "No hay vacunas que venzan en los próximos 7 días.",
    },
    normales: {
      icono: "📋",
      titulo: "Sin vacunas en regla",
      subtitulo: "Todas las vacunas están en otra categoría.",
    },
  };

  const { icono, titulo, subtitulo } = mensajes[filtro];

  return (
    <Card className="text-center py-10 px-6 border border-dashed border-slate-200 bg-slate-50">
      <span className="text-5xl block mb-3">{icono}</span>
      <p className="font-black text-slate-500 text-sm">{titulo}</p>
      <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
        {subtitulo}
      </p>
    </Card>
  );
}

// ============================================================
// ITEM DE VACUNA
// ============================================================

interface VacunaItemProps {
  vacuna: Vacuna;
  onEliminar: (id: string) => Promise<void>;
  onEnviarAlerta: (vacuna: Vacuna) => Promise<void>;
  formatearFecha: (fecha: Date) => string;
  desapareciendo: boolean;
}

function VacunaItem({
  vacuna,
  onEliminar,
  onEnviarAlerta,
  formatearFecha,
  desapareciendo,
}: VacunaItemProps) {
  const estaVencida = vacuna.estaVencida();
  const dias = vacuna.diasParaVencimiento();
  const esProxima = !estaVencida && dias !== null && dias <= 7;

  // Clases dinámicas según estado
  const cardBase = `
    transition-all duration-300 ease-in-out cursor-default
    hover:shadow-md hover:-translate-y-0.5 active:translate-y-0
    border rounded-xl
    ${desapareciendo ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100"}
  `;

  const cardEstilo = estaVencida
    ? "bg-rose-50 border-rose-300 shadow-rose-100 shadow-sm"
    : esProxima
      ? "bg-amber-50 border-amber-300 shadow-amber-100 shadow-sm"
      : "bg-white border-slate-100 shadow-slate-100 shadow-sm";

  // Indicador lateral de urgencia
  const barraLateral = estaVencida
    ? "bg-rose-500"
    : esProxima
      ? "bg-amber-400"
      : "bg-emerald-400";

  // Icono de estado animado
  const iconoEstado = estaVencida ? (
    <span
      className="text-base animate-pulse select-none"
      title="Vacuna vencida"
    >
      🚨
    </span>
  ) : esProxima ? (
    <span className="text-base select-none" title="Próxima a vencer">
      ⚠️
    </span>
  ) : (
    <span className="text-base select-none" title="Al día">
      ✅
    </span>
  );

  return (
    <div className={`${cardBase} ${cardEstilo} flex overflow-hidden`}>
      {/* Barra lateral de urgencia */}
      <div className={`w-1 flex-shrink-0 ${barraLateral} rounded-l-xl`} />

      {/* Contenido principal */}
      <div className="flex flex-1 items-start justify-between gap-3 p-3">
        {/* Icono + datos */}
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {/* Icono animado */}
          <div className="mt-0.5 flex-shrink-0">{iconoEstado}</div>

          {/* Información */}
          <div className="flex-1 min-w-0">
            {/* Nombre del animal — PRIORIDAD MÁXIMA */}
            <p className="font-black text-sm text-slate-800 truncate">
              {vacuna.animalNombre || "Animal desconocido"}
            </p>

            {/* Nombre de la vacuna */}
            <p
              className={`text-xs font-semibold mt-0.5 ${
                estaVencida ? "text-rose-600" : "text-slate-600"
              }`}
            >
              {vacuna.nombreVacuna}
            </p>

            {/* Fecha de aplicación */}
            <Tooltip
              text={`Aplicada el ${vacuna.fechaAplicacion.toLocaleDateString("es-VE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}`}
            >
              <p className="text-[10px] text-slate-400 mt-0.5 cursor-default">
                📌 Aplicada: {formatearFecha(vacuna.fechaAplicacion)}
              </p>
            </Tooltip>

            {/* Próxima dosis + badge */}
            {vacuna.proximaDosis && (
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Tooltip
                  text={`Próxima dosis: ${vacuna.proximaDosis.toLocaleDateString("es-VE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}`}
                >
                  <p
                    className={`text-[10px] font-bold cursor-default ${
                      estaVencida ? "text-rose-600" : "text-slate-500"
                    }`}
                  >
                    {estaVencida ? "🔴 Vencida:" : "📅 Próxima:"}{" "}
                    {formatearFecha(vacuna.proximaDosis)}
                  </p>
                </Tooltip>
                <DiaBadge dias={dias} estaVencida={estaVencida} />
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <Tooltip text="Enviar alerta por Telegram">
            <button
              onClick={() => onEnviarAlerta(vacuna)}
              className="
                min-w-[44px] min-h-[44px] flex items-center justify-center
                rounded-lg bg-blue-50 hover:bg-blue-100 active:scale-95
                border border-blue-200 text-blue-600 text-base
                transition-all duration-150 shadow-sm
              "
              aria-label="Enviar alerta por Telegram"
            >
              ✈️
            </button>
          </Tooltip>

          <Tooltip text="Eliminar vacuna">
            <button
              onClick={() => {
                if (confirm("¿Eliminar esta vacuna?")) {
                  onEliminar(vacuna.id!);
                }
              }}
              className="
                min-w-[44px] min-h-[44px] flex items-center justify-center
                rounded-lg bg-rose-50 hover:bg-rose-100 active:scale-95
                border border-rose-200 text-rose-500 text-base
                transition-all duration-150 shadow-sm
              "
              aria-label="Eliminar vacuna"
            >
              🗑️
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function VacunaList({
  vacunas,
  vacunasVencidas,
  onEliminar,
  onEnviarAlerta,
}: VacunaListProps) {
  // --- Estado local ---
  const [filtro, setFiltro] = useState<FiltroEstado>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState<OrdenFecha>("desc");
  const [desapareciendo, setDesapareciendo] = useState<Set<string>>(new Set());

  // --- Formatear fecha (preservada) ---
  const formatearFecha = useCallback((fecha: Date) => {
    return fecha.toLocaleDateString("es-VE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  // --- Eliminar con animación fade-out ---
  const handleEliminar = useCallback(
    async (id: string) => {
      setDesapareciendo((prev) => new Set(prev).add(id));
      setTimeout(async () => {
        await onEliminar(id);
        setDesapareciendo((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300); // duración del fade-out
    },
    [onEliminar],
  );

  // --- Cálculo de estadísticas ---
  const proximas = vacunas.filter((v) => {
    const d = v.diasParaVencimiento();
    return !v.estaVencida() && d !== null && d <= 7;
  });
  const normales = vacunas.filter((v) => {
    const d = v.diasParaVencimiento();
    return !v.estaVencida() && !(d !== null && d <= 7);
  });

  // --- Filtrado por búsqueda ---
  const filtrarPorBusqueda = (lista: Vacuna[]) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return lista;
    return lista.filter(
      (v) =>
        v.animalNombre?.toLowerCase().includes(q) ||
        v.nombreVacuna.toLowerCase().includes(q),
    );
  };

  // --- Ordenamiento ---
  const ordenar = (lista: Vacuna[]) =>
    [...lista].sort((a, b) => {
      const ta = a.proximaDosis?.getTime() ?? a.fechaAplicacion.getTime();
      const tb = b.proximaDosis?.getTime() ?? b.fechaAplicacion.getTime();
      return orden === "asc" ? ta - tb : tb - ta;
    });

  // --- Lista a mostrar según filtro ---
  const listaBase =
    filtro === "vencidas"
      ? vacunasVencidas
      : filtro === "proximas"
        ? proximas
        : filtro === "normales"
          ? normales
          : vacunas;

  const listaFinal = ordenar(filtrarPorBusqueda(listaBase));

  // --- Estado vacío global ---
  if (vacunas.length === 0) {
    return <EstadoVacio filtro="todos" />;
  }

  return (
    <div className="space-y-4">
      {/* ===== BANNER DE ALERTAS CRÍTICAS ===== */}
      {vacunasVencidas.length > 0 && (
        <div className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2 rounded-xl shadow-rose-200 shadow-md">
          <span className="text-lg animate-bounce">🚨</span>
          <p className="text-xs font-black tracking-wide">
            {vacunasVencidas.length} VACUNA
            {vacunasVencidas.length !== 1 ? "S" : ""} VENCIDA
            {vacunasVencidas.length !== 1 ? "S" : ""} — REQUIERE ATENCIÓN
            INMEDIATA
          </p>
        </div>
      )}

      {/* ===== BARRA DE BÚSQUEDA + ORDEN ===== */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por animal o vacuna…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="
              w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200
              bg-white placeholder-slate-400 text-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400
              transition-all duration-150
            "
          />
        </div>
        <Tooltip
          text={
            orden === "desc"
              ? "Ordenando: más reciente primero"
              : "Ordenando: más antiguo primero"
          }
        >
          <button
            onClick={() => setOrden((o) => (o === "asc" ? "desc" : "asc"))}
            className="
              min-w-[36px] min-h-[36px] rounded-lg border border-slate-200 bg-white
              text-slate-500 hover:bg-slate-50 text-sm flex items-center justify-center
              transition-all duration-150 active:scale-95
            "
            aria-label="Cambiar orden"
          >
            {orden === "desc" ? "↓" : "↑"}
          </button>
        </Tooltip>
      </div>

      {/* ===== FILTROS DE ESTADO ===== */}
      <div className="flex gap-1.5 flex-wrap">
        {(
          [
            {
              key: "todos",
              label: "Todos",
              count: vacunas.length,
              color: "slate",
            },
            {
              key: "vencidas",
              label: "🚨 Vencidas",
              count: vacunasVencidas.length,
              color: "rose",
            },
            {
              key: "proximas",
              label: "⚠️ Próximas",
              count: proximas.length,
              color: "amber",
            },
            {
              key: "normales",
              label: "✅ Al día",
              count: normales.length,
              color: "emerald",
            },
          ] as const
        ).map(({ key, label, count, color }) => {
          const isActive = filtro === key;
          const colorMap: Record<string, string> = {
            slate: isActive
              ? "bg-slate-700 text-white border-slate-700"
              : "bg-white text-slate-500 border-slate-200 hover:border-slate-400",
            rose: isActive
              ? "bg-rose-600  text-white border-rose-600"
              : "bg-white text-rose-500  border-rose-200  hover:border-rose-400",
            amber: isActive
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-amber-600 border-amber-200 hover:border-amber-400",
            emerald: isActive
              ? "bg-emerald-600 text-white border-emerald-600"
              : "bg-white text-emerald-600 border-emerald-200 hover:border-emerald-400",
          };
          return (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`
                px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-wide
                transition-all duration-150 active:scale-95 flex items-center gap-1
                ${colorMap[color]}
              `}
            >
              {label}
              <span className="ml-0.5 bg-white/20 rounded-full px-1 text-[9px]">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ===== SECCIÓN VENCIDAS ===== */}
      {filtro === "todos" && vacunasVencidas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse flex-shrink-0" />
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">
              🔴 VACUNAS VENCIDAS ({vacunasVencidas.length})
            </p>
            <div className="flex-1 h-px bg-rose-200" />
          </div>
          {filtrarPorBusqueda(vacunasVencidas).length === 0 ? (
            <p className="text-[10px] text-slate-400 pl-4">
              Sin resultados para esta búsqueda.
            </p>
          ) : (
            ordenar(filtrarPorBusqueda(vacunasVencidas)).map((v) => (
              <VacunaItem
                key={v.id}
                vacuna={v}
                onEliminar={handleEliminar}
                onEnviarAlerta={onEnviarAlerta}
                formatearFecha={formatearFecha}
                desapareciendo={desapareciendo.has(v.id!)}
              />
            ))
          )}
        </div>
      )}

      {/* ===== SECCIÓN PRÓXIMAS A VENCER ===== */}
      {filtro === "todos" && proximas.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
              ⚠️ PRÓXIMAS A VENCER ({proximas.length})
            </p>
            <div className="flex-1 h-px bg-amber-200" />
          </div>
          {ordenar(filtrarPorBusqueda(proximas)).map((v) => (
            <VacunaItem
              key={v.id}
              vacuna={v}
              onEliminar={handleEliminar}
              onEnviarAlerta={onEnviarAlerta}
              formatearFecha={formatearFecha}
              desapareciendo={desapareciendo.has(v.id!)}
            />
          ))}
        </div>
      )}

      {/* ===== SECCIÓN HISTORIAL COMPLETO / FILTRO APLICADO ===== */}
      <div className="space-y-2">
        {filtro === "todos" && (
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              📋 HISTORIAL AL DÍA ({normales.length})
            </p>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        )}

        {/* Cuando se usa un filtro específico (no "todos"), mostrar todo en lista única */}
        {filtro !== "todos" && (
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {listaFinal.length} resultado{listaFinal.length !== 1 ? "s" : ""}
            </p>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        )}

        {listaFinal.length === 0 ? (
          <EstadoVacio filtro={filtro} />
        ) : filtro === "todos" ? (
          // En modo "todos", sección normales
          ordenar(filtrarPorBusqueda(normales)).map((v) => (
            <VacunaItem
              key={v.id}
              vacuna={v}
              onEliminar={handleEliminar}
              onEnviarAlerta={onEnviarAlerta}
              formatearFecha={formatearFecha}
              desapareciendo={desapareciendo.has(v.id!)}
            />
          ))
        ) : (
          // Filtro específico
          listaFinal.map((v) => (
            <VacunaItem
              key={v.id}
              vacuna={v}
              onEliminar={handleEliminar}
              onEnviarAlerta={onEnviarAlerta}
              formatearFecha={formatearFecha}
              desapareciendo={desapareciendo.has(v.id!)}
            />
          ))
        )}
      </div>
    </div>
  );
}
