'use client';

import { useState } from 'react';
import { useAnimales } from '../hooks/useAnimales';
import { useFinanzas } from '../hooks/useFinanzas';
import { useProduccion } from '../hooks/useProduccion';
import { useVacunas } from '../hooks/useVacunas';
import { useTasaBCV } from '../hooks/useTasaBCV';

// Componentes
import { DockNavigation } from '../components/common/Navigation/DockNavigation';
import { BalanceCard } from '../components/features/finanzas/BalanceCard/BalanceCard';
import { AnimalList } from '../components/features/animales/AnimalList/AnimalList';
import { AnimalForm } from '../components/features/animales/AnimalForm/AnimalForm';
import { RegistroProduccionForm } from '../components/features/produccion/RegistroProduccionForm/RegistroProduccionForm';
import { VacunaForm } from '../components/features/salud/VacunaForm/VacunaForm';
import { VacunaList } from '../components/features/salud/VacunaList/VacunaList';
import { FinanzaForm } from '../components/features/finanzas/FinanzaForm/FinanzaForm';
import { GraficoProduccion } from '../components/features/produccion/GraficoProduccion/GraficoProduccion';

type TabType = 'inicio' | 'animales' | 'produccion' | 'salud' | 'finanzas';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('inicio');
  
  // Hooks personalizados
  const { 
    animales, 
    crearAnimal, 
    eliminarAnimal,
    buscarAnimales 
  } = useAnimales();
  
  const { 
    finanzas, 
    balance, 
    crearTransaccion,
    eliminarTransaccion 
  } = useFinanzas();
  
  const { 
    registros, 
    crearRegistro, 
    eliminarRegistro 
  } = useProduccion();
  
  const { 
    vacunas, 
    vacunasVencidas,
    crearVacuna, 
    eliminarVacuna,
    enviarAlertaTelegram 
  } = useVacunas();
  
  const { 
    tasa, 
    convertirMoneda 
  } = useTasaBCV();

  const [searchTerm, setSearchTerm] = useState('');
  const [verEnDolares, setVerEnDolares] = useState(false);

  // Handlers
  const handleBuscarAnimales = (term: string) => {
    setSearchTerm(term);
    buscarAnimales(term);
  };

  const totalMachos = animales.filter(a => a.sexo === 'Macho').length;
  const totalHembras = animales.filter(a => a.sexo === 'Hembra').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 pb-24 text-slate-900 font-sans scroll-smooth">
      
      {/* ========== HEADER ELEGANTE Y MODERNO ========== */}
      <header className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#1B4332] text-white px-6 py-4 sticky top-0 z-30 shadow-[0_8px_30px_rgba(27,67,50,0.3)] rounded-b-[2.5rem] border-b border-white/10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex-1">
            {/* Texto de bienvenida mejorado */}
            <p className="text-green-200 text-xs font-semibold tracking-wide opacity-95 mb-1">
              Bienvenido, Leonardo Marcano
            </p>
            {/* Nombre de finca con estilo premium */}
            <h1 className="text-3xl font-black tracking-tight leading-none text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
              Finca las Camasas
            </h1>
          </div>
          
          {/* Card de tasa BCV mejorada con indicador de estado */}
          <div className="bg-black/20 backdrop-blur-sm px-3 py-2 rounded-2xl border border-white/20 text-center shadow-lg">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              {/* Indicador online/offline */}
              <div className={`w-1.5 h-1.5 rounded-full ${tasa.origen === 'api' ? 'bg-green-400 animate-pulse' : 'bg-orange-400'}`} />
              <p className={`text-[7px] font-black uppercase tracking-widest ${tasa.origen === 'api' ? 'text-green-300' : 'text-orange-300'}`}>
                {tasa.origen === 'api' ? 'BCV ONLINE' : 'OFFLINE'}
              </p>
            </div>
            <p className="text-base font-bold leading-none text-white">
              Bs {tasa.value.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      {/* ========== CONTENEDOR PRINCIPAL CON ESPACIADO OPTIMIZADO ========== */}
      <div className="max-w-md mx-auto p-4 -mt-10 space-y-4 relative z-10">
        
        {/* ========== TAB: INICIO ========== */}
        {activeTab === 'inicio' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Tarjetas de conteo de ganado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-5 rounded-[2rem] border border-blue-100 shadow-lg shadow-blue-100/50 flex items-center justify-between transition-all hover:scale-105 active:scale-95">
                <div>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-wider">Machos</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{totalMachos}</p>
                </div>
                <span className="text-4xl">🐂</span>
              </div>
              <div className="bg-white p-5 rounded-[2rem] border border-pink-100 shadow-lg shadow-pink-100/50 flex items-center justify-between transition-all hover:scale-105 active:scale-95">
                <div>
                  <p className="text-[9px] font-black text-pink-500 uppercase tracking-wider">Hembras</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{totalHembras}</p>
                </div>
                <span className="text-4xl">🐄</span>
              </div>
            </div>

            {/* Balance Card */}
            <BalanceCard
              balance={balance}
              tasa={tasa.value}
              verEnDolares={verEnDolares}
              onToggleMoneda={() => setVerEnDolares(!verEnDolares)}
            />

            {/* Gráfico de Producción */}
            <GraficoProduccion registros={registros} />
            
            {/* Resumen financiero */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[2rem] shadow-xl shadow-emerald-200/50 text-center border border-emerald-400/20">
                <p className="text-[10px] font-black text-emerald-100 uppercase tracking-wider">Ingresos Totales</p>
                <p className="text-xl font-black text-white mt-2">
                  {verEnDolares ? '$' : 'Bs'} {convertirMoneda(balance.ingresos, 'VES', verEnDolares ? 'USD' : 'VES').toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-[2rem] shadow-xl shadow-rose-200/50 text-center border border-rose-400/20">
                <p className="text-[10px] font-black text-rose-100 uppercase tracking-wider">Gastos Totales</p>
                <p className="text-xl font-black text-white mt-2">
                  {verEnDolares ? '$' : 'Bs'} {convertirMoneda(balance.gastos, 'VES', verEnDolares ? 'USD' : 'VES').toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== TAB: ANIMALES ========== */}
        {activeTab === 'animales' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[10px] font-black mb-4 text-green-800 uppercase tracking-widest flex items-center gap-2">
                <span className="bg-green-100 p-1.5 rounded-lg">🐃</span> Registrar Búfalo
              </h3>
              <AnimalForm 
                animales={animales} 
                onSubmit={async (data: any) => {
                  await crearAnimal(data);
                }} 
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400 text-lg">🔍</span>
              <input
                placeholder="Buscar por nombre o arete..."
                className="w-full p-4 pl-12 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold placeholder:text-slate-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all shadow-sm"
                value={searchTerm}
                onChange={e => handleBuscarAnimales(e.target.value)}
              />
            </div>

            <AnimalList
              animales={animales}
              onEliminar={eliminarAnimal}
              onVerArbol={() => {}}
            />
          </div>
        )}

        {/* ========== TAB: PRODUCCIÓN ========== */}
        {activeTab === 'produccion' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-blue-700 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-blue-50 p-1 rounded-lg">🥛</span> Registro de Producción
              </h2>
              <RegistroProduccionForm
                animales={animales}
                onSubmit={crearRegistro}
              />
            </div>
            
            <div className="space-y-3">
              {registros.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                      {new Date(r.fecha).toLocaleDateString()} • {r.animalNombre}
                    </p>
                    <div className="flex gap-3 mt-1.5">
                      {r.litrosLeche > 0 && (
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black">
                          {r.litrosLeche} L
                        </span>
                      )}
                      {r.pesoKg > 0 && (
                        <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-black">
                          {r.pesoKg} Kg
                        </span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => r.id && eliminarRegistro(r.id)}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors active:scale-90"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========== TAB: SALUD ========== */}
        {activeTab === 'salud' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-purple-700 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-purple-50 p-1 rounded-lg">💉</span> Control Sanitario
              </h2>
              <VacunaForm
                animales={animales}
                onSubmit={crearVacuna}
              />
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

        {/* ========== TAB: FINANZAS ========== */}
        {activeTab === 'finanzas' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-amber-600 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-amber-50 p-1 rounded-lg">💰</span> Control Financiero
              </h2>
              <FinanzaForm
                tasaBCV={tasa.value}
                onSubmit={crearTransaccion}
              />
            </div>
            
            <div className="space-y-3 pb-10">
              {finanzas.map(f => (
                <div key={f.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div className="flex-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">
                      {new Date(f.fecha).toLocaleDateString()}
                    </p>
                    <h4 className="font-bold text-slate-800 text-sm">
                      {f.descripcion || f.categoria}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className={`font-black text-lg ${
                      f.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {f.tipo === 'ingreso' ? '+' : '-'}
                      {convertirMoneda(f.monto, 'VES', verEnDolares ? 'USD' : 'VES').toLocaleString('es-VE', {maximumFractionDigits:0})}
                    </p>
                    <button 
                      onClick={() => f.id && eliminarTransaccion(f.id)}
                      className="text-slate-300 hover:text-rose-500 font-bold p-1 transition-colors active:scale-90"
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

      {/* ========== NAVEGACIÓN DOCK ========== */}
      <DockNavigation
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as TabType)}
      />
    </main>
  );
}