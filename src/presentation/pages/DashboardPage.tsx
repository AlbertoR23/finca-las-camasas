"use client";

import { useState, useEffect } from "react";

// ─── HOOKS ───────────────────────────────────────────────────────────────────
import { useAnimales } from "../hooks/useAnimales";
import { useFinanzas } from "../hooks/useFinanzas";
import { useProduccion } from "../hooks/useProduccion";
import { useVacunas } from "../hooks/useVacunas";
import { useTasaBCV } from "../hooks/useTasaBCV";

// ─── COMPONENTES ─────────────────────────────────────────────────────────────
import { DockNavigation } from "../components/common/Navigation/DockNavigation";
import { BalanceCard } from "../components/features/finanzas/BalanceCard/BalanceCard";
import { AnimalList } from "../components/features/animales/AnimalList/AnimalList";
import { AnimalForm } from "../components/features/animales/AnimalForm/AnimalForm";
import { RegistroProduccionForm } from "../components/features/produccion/RegistroProduccionForm/RegistroProduccionForm";
import { VacunaForm } from "../components/features/salud/VacunaForm/VacunaForm";
import { VacunaList } from "../components/features/salud/VacunaList/VacunaList";
import { FinanzaForm } from "../components/features/finanzas/FinanzaForm/FinanzaForm";
import { GraficoProduccion } from "../components/features/produccion/GraficoProduccion/GraficoProduccion";
import { ThemeToggle } from "../components/common/ThemeToggle/ThemeToggle";
import SyncIndicator from "../components/common/SyncIndicator";

type TabType = "inicio" | "animales" | "produccion" | "salud" | "finanzas";

// ─── SUBCOMPONENTE: Header aislado para evitar re-renders externos ────────────
// Nota: useState se importa arriba desde React y está disponible aquí también
interface AppHeaderProps {
  tasa: { value: number; origen: string };
  ultimaActualizacion: Date | null;
  onRefresh: () => Promise<void>;
}

function AppHeader({ tasa, ultimaActualizacion, onRefresh }: AppHeaderProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = async () => {
    if (spinning) return;
    setSpinning(true);
    await onRefresh();
    setTimeout(() => setSpinning(false), 600);
  };

  return (
    <header
      className="sticky top-0 z-20 text-white px-4 py-4 shadow-[0_8px_32px_rgba(27,67,50,0.35)]"
      style={{
        background:
          "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)",
        borderRadius: "0 0 2rem 2rem",
      }}
    >
      {/* Textura sutil */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 9px)",
          borderRadius: "0 0 2rem 2rem",
        }}
      />

      <div className="relative">
        {/* ── FILA 1: Bienvenida + SyncIndicator ── */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-green-200 text-[9px] font-semibold uppercase tracking-[0.2em] opacity-90">
            Bienvenido, Leonardo Marcano
          </p>
          <SyncIndicator />
        </div>

        {/* ── FILA 2: Nombre finca | ThemeToggle | Card BCV (con refresh integrado) ── */}
        <div className="flex items-center gap-2">
          {/* Título — ocupa el espacio sobrante */}
          <h1
            className="text-xl font-black tracking-tight leading-none flex-1 min-w-0 truncate"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
          >
            Finca las Camasas
          </h1>

          {/* ThemeToggle: SOLO UNO, tamaño fijo */}
          <div className="shrink-0">
            <ThemeToggle />
          </div>

          {/*
            Card BCV — el botón 🔄 está DENTRO de la card.
            Toca la card entera para actualizar.
            Ocupa ancho mínimo fijo para no desbordarse.
          */}
          <button
            onClick={handleRefresh}
            title="Toca para actualizar tasa BCV"
            aria-label="Actualizar tasa BCV"
            className="shrink-0 bg-black/20 hover:bg-black/30 active:scale-95 backdrop-blur-sm rounded-xl border border-white/20 transition-all flex items-center gap-1.5 px-2.5 py-1.5"
          >
            {/* Indicador online/offline */}
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                tasa.origen === "api"
                  ? "bg-green-400 animate-pulse"
                  : "bg-orange-400"
              }`}
            />

            {/* Textos */}
            <div className="text-right">
              <p
                className={`text-[7px] font-black uppercase tracking-widest leading-none ${
                  tasa.origen === "api" ? "text-green-300" : "text-orange-300"
                }`}
              >
                {tasa.origen === "api" ? "BCV Live" : "Offline"}
              </p>
              <p className="text-sm font-bold leading-snug text-white whitespace-nowrap">
                Bs {tasa.value.toFixed(2)}
              </p>
              {ultimaActualizacion && (
                <p className="text-[6px] text-white/50 leading-none whitespace-nowrap">
                  {ultimaActualizacion.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Icono refresh integrado */}
            <span
              className={`text-[10px] opacity-70 shrink-0 transition-transform duration-500 ${
                spinning ? "animate-spin" : ""
              }`}
            >
              🔄
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function DashboardPage() {
  // ── ESTADOS ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>("inicio");
  const [searchTerm, setSearchTerm] = useState("");
  const [verEnDolares, setVerEnDolares] = useState(false);

  // ── HOOKS ─────────────────────────────────────────────────────────────────
  const { animales, crearAnimal, eliminarAnimal, buscarAnimales } =
    useAnimales();
  const { finanzas, balance, crearTransaccion, eliminarTransaccion } =
    useFinanzas();
  const { registros, crearRegistro, eliminarRegistro } = useProduccion();
  const {
    vacunas,
    vacunasVencidas,
    crearVacuna,
    eliminarVacuna,
    enviarAlertaTelegram,
  } = useVacunas();
  const { tasa, convertirMoneda, forzarActualizacion, ultimaActualizacion } =
    useTasaBCV();

  // Después de obtener forzarActualizacion
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.forzarActualizacion = forzarActualizacion;
    }
    return () => {
      if (typeof window !== "undefined") {
        window.forzarActualizacion = undefined;
      }
    };
  }, [forzarActualizacion]);

  // ── HANDLERS ──────────────────────────────────────────────────────────────
  const handleBuscarAnimales = (term: string) => {
    setSearchTerm(term);
    buscarAnimales(term);
  };

  // ── CÁLCULOS ──────────────────────────────────────────────────────────────
  const totalMachos = animales.filter((a) => a.sexo === "Macho").length;
  const totalHembras = animales.filter((a) => a.sexo === "Hembra").length;

  return (
    <main className="min-h-screen bg-[var(--background)] pb-28 text-[var(--foreground)] font-sans scroll-smooth">
      {/*
        ══════════════════════════════════════════════════════════
        HEADER — componente aislado, sin duplicados
        Si ves duplicados, revisa layout.tsx o los componentes
        ThemeToggle / SyncIndicator por renders propios extra.
        ══════════════════════════════════════════════════════════
      */}
      <AppHeader
        tasa={tasa}
        ultimaActualizacion={ultimaActualizacion}
        onRefresh={forzarActualizacion}
      />

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────────────── */}
      <div className="max-w-md mx-auto px-4 pt-12 -mt-8 space-y-4 relative z-10">
        {/* ── TAB: INICIO ─────────────────────────────────────────────────── */}
        {activeTab === "inicio" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--card)] p-4 rounded-[2rem] border border-[var(--border)] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider">
                    Machos
                  </p>
                  <p className="text-2xl font-black text-[var(--foreground)]">
                    {totalMachos}
                  </p>
                </div>
                <span className="text-3xl">🐂</span>
              </div>
              <div className="bg-[var(--card)] p-4 rounded-[2rem] border border-[var(--border)] shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-pink-400 uppercase tracking-wider">
                    Hembras
                  </p>
                  <p className="text-2xl font-black text-[var(--foreground)]">
                    {totalHembras}
                  </p>
                </div>
                <span className="text-3xl">🐄</span>
              </div>
            </div>

            <BalanceCard
              balance={balance}
              tasa={tasa.value}
              verEnDolares={verEnDolares}
              onToggleMoneda={() => setVerEnDolares(!verEnDolares)}
            />

            <GraficoProduccion registros={registros} />

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--card)] p-5 rounded-[2.2rem] shadow-sm border border-[var(--border)] text-center">
                <p className="text-[10px] font-black text-[var(--success)] uppercase">
                  Ingresos
                </p>
                <p className="text-lg font-black text-[var(--foreground)]">
                  {verEnDolares ? "$" : "Bs"}{" "}
                  {convertirMoneda(
                    balance.ingresos,
                    "VES",
                    verEnDolares ? "USD" : "VES",
                  ).toLocaleString("es-VE", { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-[var(--card)] p-5 rounded-[2.2rem] shadow-sm border border-[var(--border)] text-center">
                <p className="text-[10px] font-black text-[var(--destructive)] uppercase">
                  Gastos
                </p>
                <p className="text-lg font-black text-[var(--foreground)]">
                  {verEnDolares ? "$" : "Bs"}{" "}
                  {convertirMoneda(
                    balance.gastos,
                    "VES",
                    verEnDolares ? "USD" : "VES",
                  ).toLocaleString("es-VE", { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: ANIMALES ────────────────────────────────────────────────── */}
        {activeTab === "animales" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[10px] font-black mb-4 text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                <span className="bg-[var(--primary)]/10 p-1.5 rounded-lg">
                  🐃
                </span>
                Nuevo Registro
              </h3>
              <AnimalForm
                animales={animales}
                onSubmit={async (data: any) => {
                  await crearAnimal(data);
                }}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-4 text-[var(--muted-foreground)]">
                🔍
              </span>
              <input
                placeholder="Buscar por nombre o arete..."
                className="w-full p-4 pl-12 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] font-bold placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/20 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={(e) => handleBuscarAnimales(e.target.value)}
              />
            </div>

            <AnimalList
              animales={animales}
              onEliminar={eliminarAnimal}
              onVerArbol={() => {}}
            />
          </div>
        )}

        {/* ── TAB: PRODUCCIÓN ──────────────────────────────────────────────── */}
        {activeTab === "produccion" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-[var(--info)] uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-[var(--info)]/10 p-1 rounded-lg">🥛</span>
                Control Diario
              </h2>
              <RegistroProduccionForm
                animales={animales}
                onSubmit={crearRegistro}
              />
            </div>

            <div className="space-y-3">
              {registros.map((r) => (
                <div
                  key={r.id}
                  className="bg-[var(--card)] p-5 rounded-[2rem] shadow-sm border border-[var(--border)] flex justify-between items-center"
                >
                  <div>
                    <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase tracking-wider">
                      {new Date(r.fecha).toLocaleDateString()} •{" "}
                      {r.animalNombre}
                    </p>
                    <div className="flex gap-3 mt-1.5">
                      {r.litrosLeche > 0 && (
                        <span className="bg-[var(--info)]/10 text-[var(--info)] px-3 py-1 rounded-lg text-xs font-black">
                          {r.litrosLeche} L
                        </span>
                      )}
                      {r.pesoKg > 0 && (
                        <span className="bg-[var(--muted)] text-[var(--muted-foreground)] px-3 py-1 rounded-lg text-xs font-black">
                          {r.pesoKg} Kg
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => r.id && eliminarRegistro(r.id)}
                    className="w-8 h-8 flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors"
                    aria-label="Eliminar registro"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: SALUD ───────────────────────────────────────────────────── */}
        {activeTab === "salud" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-purple-600 dark:text-purple-400 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-lg">
                  💉
                </span>
                Plan Sanitario
              </h2>
              <VacunaForm animales={animales} onSubmit={crearVacuna} />
            </div>

            <VacunaList
              vacunas={vacunas}
              vacunasVencidas={vacunasVencidas}
              onEliminar={eliminarVacuna}
              onEnviarAlerta={async (vacuna) => {
                await enviarAlertaTelegram(vacuna);
              }}
            />
          </div>
        )}

        {/* ── TAB: FINANZAS ────────────────────────────────────────────────── */}
        {activeTab === "finanzas" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-amber-600 dark:text-amber-400 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-lg">
                  💰
                </span>
                Caja Chica
              </h2>
              <FinanzaForm tasaBCV={tasa.value} onSubmit={crearTransaccion} />
            </div>

            <div className="space-y-3 pb-10">
              {finanzas.map((f) => (
                <div
                  key={f.id}
                  className="bg-[var(--card)] p-5 rounded-[2rem] shadow-sm border border-[var(--border)] flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-[var(--muted-foreground)] uppercase">
                      {new Date(f.fecha).toLocaleDateString()}
                    </p>
                    <h4 className="font-bold text-[var(--foreground)] text-sm">
                      {f.descripcion || f.categoria}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <p
                      className={`font-black text-lg ${
                        f.tipo === "ingreso"
                          ? "text-[var(--success)]"
                          : "text-[var(--destructive)]"
                      }`}
                    >
                      {f.tipo === "ingreso" ? "+" : "-"}
                      {convertirMoneda(
                        f.monto,
                        "VES",
                        verEnDolares ? "USD" : "VES",
                      ).toLocaleString("es-VE", { maximumFractionDigits: 0 })}
                    </p>
                    <button
                      onClick={() => f.id && eliminarTransaccion(f.id)}
                      className="text-[var(--muted-foreground)] hover:text-[var(--destructive)] font-bold p-1 transition-colors"
                      aria-label="Eliminar transacción"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── NAVEGACIÓN INFERIOR ─────────────────────────────────────────── */}
      <DockNavigation
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as TabType)}
      />
    </main>
  );
}
