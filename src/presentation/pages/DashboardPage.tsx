"use client";

import { useState } from "react";

// ─── HOOKS (NO MODIFICAR) ───────────────────────────────────────────────────
import { useAnimales } from "../hooks/useAnimales";
import { useFinanzas } from "../hooks/useFinanzas";
import { useProduccion } from "../hooks/useProduccion";
import { useVacunas } from "../hooks/useVacunas";
import { useTasaBCV } from "../hooks/useTasaBCV";

// ─── COMPONENTES (NO MODIFICAR IMPORTS) ────────────────────────────────────
import { DockNavigation } from "../components/common/Navigation/DockNavigation";
import { BalanceCard } from "../components/features/finanzas/BalanceCard/BalanceCard";
import { AnimalList } from "../components/features/animales/AnimalList/AnimalList";
import { AnimalForm } from "../components/features/animales/AnimalForm/AnimalForm";
import { RegistroProduccionForm } from "../components/features/produccion/RegistroProduccionForm/RegistroProduccionForm";
import { VacunaForm } from "../components/features/salud/VacunaForm/VacunaForm";
import { VacunaList } from "../components/features/salud/VacunaList/VacunaList";
import { FinanzaForm } from "../components/features/finanzas/FinanzaForm/FinanzaForm";
import { GraficoProduccion } from "../components/features/produccion/GraficoProduccion/GraficoProduccion";
import { ThemeToggle } from "../components/common/ThemeToggle/ThemeToggle"; // ← NUEVO

type TabType = "inicio" | "animales" | "produccion" | "salud" | "finanzas";

export default function DashboardPage() {
  // ─── ESTADOS (NO MODIFICAR) ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabType>("inicio");

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

  const { tasa, convertirMoneda } = useTasaBCV();

  const [searchTerm, setSearchTerm] = useState("");
  const [verEnDolares, setVerEnDolares] = useState(false);

  // ─── HANDLERS (NO MODIFICAR) ─────────────────────────────────────────────
  const handleBuscarAnimales = (term: string) => {
    setSearchTerm(term);
    buscarAnimales(term);
  };

  // ─── CÁLCULOS (NO MODIFICAR) ─────────────────────────────────────────────
  const totalMachos = animales.filter((a) => a.sexo === "Macho").length;
  const totalHembras = animales.filter((a) => a.sexo === "Hembra").length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[var(--background)] pb-28 text-[var(--foreground)] font-sans scroll-smooth">
      {/*
       * ════════════════════════════════════════════════════════
       * HEADER — CAMBIOS VISUALES:
       *   · Gradiente rico de verde oscuro a verde medio
       *   · Subtítulo de bienvenida elegante
       *   · Nombre de finca grande y con sombra
       *   · Card BCV con backdrop-blur y punto indicador
       *   · Rounded bottom más expresivo
       * ════════════════════════════════════════════════════════
       */}
      <header
        className="sticky top-0 z-20 text-white px-6 py-4 shadow-[0_8px_32px_rgba(27,67,50,0.35)]"
        style={{
          background:
            "linear-gradient(135deg, #1B4332 0%, #2D6A4F 60%, #40916C 100%)",
          borderRadius: "0 0 2rem 2rem",
        }}
      >
        {/* Textura sutil de fondo */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 9px)",
            borderRadius: "0 0 2rem 2rem",
          }}
        />

        <div className="max-w-md mx-auto flex justify-between items-center relative">
          {/* ── Identidad de la finca ── */}
          <div>
            {/* [TEXTO CAMBIADO] "SISTEMA DATAVE" → saludo personalizado */}
            <p className="text-green-200 text-[9px] font-semibold uppercase tracking-[0.25em] mb-0.5 opacity-90">
              Bienvenido, Leonardo Marcano
            </p>
            {/* [TEXTO CAMBIADO] "BÚFALOS" → nombre de la finca */}
            <h1
              className="text-3xl font-black tracking-tight leading-none"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.25)" }}
            >
              Finca las Camasas
            </h1>
          </div>

          {/* ── Card tasa BCV y toggle de tema ── */}
          <div className="flex items-center gap-2">
            <ThemeToggle /> {/* ← NUEVO */}
            <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 text-center flex flex-col items-center gap-0.5">
              {/* Indicador online/offline */}
              <span className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    tasa.origen === "api"
                      ? "bg-green-400 animate-pulse"
                      : "bg-orange-400"
                  }`}
                />
                <p
                  className={`text-[7px] font-black uppercase tracking-widest ${
                    tasa.origen === "api" ? "text-green-300" : "text-orange-300"
                  }`}
                >
                  {tasa.origen === "api" ? "BCV Live" : "Offline"}
                </p>
              </span>
              <p className="text-sm font-bold leading-none text-white">
                Bs {tasa.value.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ... resto del código sin cambios ... */}
      <div className="max-w-md mx-auto px-4 pt-12 -mt-8 space-y-4 relative z-10">
        {/* ── Tab: Inicio ─────────────────────────────────────────────────── */}
        {activeTab === "inicio" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Tarjetas machos / hembras */}
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

            {/* Balance principal */}
            <BalanceCard
              balance={balance}
              tasa={tasa.value}
              verEnDolares={verEnDolares}
              onToggleMoneda={() => setVerEnDolares(!verEnDolares)}
            />

            {/* Gráfico de producción */}
            <GraficoProduccion registros={registros} />

            {/* Resumen ingresos / gastos */}
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

        {/* ── Tab: Animales ────────────────────────────────────────────────── */}
        {activeTab === "animales" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[10px] font-black mb-4 text-[var(--primary)] uppercase tracking-widest flex items-center gap-2">
                <span className="bg-[var(--primary)]/10 p-1.5 rounded-lg">🐃</span> Nuevo
                Registro
              </h3>
              <AnimalForm
                animales={animales}
                onSubmit={async (data: any) => {
                  await crearAnimal(data);
                }}
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-4 text-[var(--muted-foreground)]">🔍</span>
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

        {/* ── Tab: Producción ──────────────────────────────────────────────── */}
        {activeTab === "produccion" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-[var(--info)] uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-[var(--info)]/10 p-1 rounded-lg">🥛</span> Control
                Diario
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
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: Salud ───────────────────────────────────────────────────── */}
        {activeTab === "salud" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-purple-600 dark:text-purple-400 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-lg">💉</span> Plan
                Sanitario
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

        {/* ── Tab: Finanzas ────────────────────────────────────────────────── */}
        {activeTab === "finanzas" && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-amber-600 dark:text-amber-400 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-lg">💰</span> Caja
                Chica
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

      {/* ── Navegación inferior (NO MODIFICAR LÓGICA) ─────────────────────── */}
      <DockNavigation
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as TabType)}
      />
    </main>
  );
}
