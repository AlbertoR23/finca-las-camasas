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
    <main className="min-h-screen bg-[#F8F9FA] pb-24 text-slate-900 font-sans">
      
      {/* HEADER COMPACTO */}
      <header className="bg-[#1B4332] text-white px-6 py-3 sticky top-0 z-20 shadow-2xl rounded-b-[2rem]">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div>
            <p className="text-green-400 text-[8px] font-black uppercase tracking-[0.2em] opacity-90">
              Bienvenido Leonardo Marcano
            </p>
            <h1 className="text-2xl font-black tracking-tighter leading-tight">
              Finca las CAMASAS
            </h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
            <p className={`text-[6px] font-black uppercase tracking-widest ${tasa.origen === 'api' ? 'text-green-300' : 'text-orange-300'}`}>
              {tasa.origen === 'api' ? 'BCV' : 'OFF'}
            </p>
            <p className="text-sm font-bold leading-none">
              Bs {tasa.value.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 -mt-8 space-y-4 relative z-10">
        
        {/* Tab: Inicio */}
        {activeTab === 'inicio' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-[2rem] border border-blue-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-wider">Machos</p>
                  <p className="text-2xl font-black text-slate-800">{totalMachos}</p>
                </div>
                <span className="text-3xl">🐂</span>
              </div>
              <div className="bg-white p-4 rounded-[2rem] border border-pink-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-pink-400 uppercase tracking-wider">Hembras</p>
                  <p className="text-2xl font-black text-slate-800">{totalHembras}</p>
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
              <div className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-emerald-100 text-center">
                <p className="text-[10px] font-black text-emerald-600 uppercase">Ingresos</p>
                <p className="text-lg font-black text-slate-800">
                  {verEnDolares ? '$' : 'Bs'} {convertirMoneda(balance.ingresos, 'VES', verEnDolares ? 'USD' : 'VES').toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-rose-100 text-center">
                <p className="text-[10px] font-black text-rose-600 uppercase">Gastos</p>
                <p className="text-lg font-black text-slate-800">
                  {verEnDolares ? '$' : 'Bs'} {convertirMoneda(balance.gastos, 'VES', verEnDolares ? 'USD' : 'VES').toLocaleString('es-VE', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Animales */}
        {activeTab === 'animales' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="text-[10px] font-black mb-4 text-green-800 uppercase tracking-widest flex items-center gap-2">
                <span className="bg-green-100 p-1.5 rounded-lg">🐃</span> Nuevo Registro
              </h3>
              <AnimalForm 
                animales={animales} 
                onSubmit={async (data: any) => {
                  await crearAnimal(data);
                }} 
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400">🔍</span>
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

        {/* Tab: Producción */}
        {activeTab === 'produccion' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-blue-700 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-blue-50 p-1 rounded-lg">🥛</span> Control Diario
              </h2>
              <RegistroProduccionForm
                animales={animales}
                onSubmit={crearRegistro}
              />
            </div>
            
            <div className="space-y-3">
              {registros.map(r => (
                <div key={r.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
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
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Salud */}
        {activeTab === 'salud' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-purple-700 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-purple-50 p-1 rounded-lg">💉</span> Plan Sanitario
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

        {/* Tab: Finanzas */}
        {activeTab === 'finanzas' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-[10px] font-black mb-4 text-amber-600 uppercase tracking-widest text-center flex justify-center gap-2">
                <span className="bg-amber-50 p-1 rounded-lg">💰</span> Caja Chica
              </h2>
              <FinanzaForm
                tasaBCV={tasa.value}
                onSubmit={crearTransaccion}
              />
            </div>
            
            <div className="space-y-3 pb-10">
              {finanzas.map(f => (
                <div key={f.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex justify-between items-center">
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
                      className="text-slate-300 hover:text-rose-500 font-bold p-1"
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

      {/* Navegación compacta */}
      <DockNavigation
        activeTab={activeTab}
        onTabChange={(tabId: string) => setActiveTab(tabId as TabType)}
      />
    </main>
  );
}