import React, { useState } from 'react';

interface NavItem {
  id: string;
  icon: string;
  label: string;
}

interface DockNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  items?: NavItem[];
}

const defaultItems: NavItem[] = [
  { id: 'inicio', icon: '📊', label: 'Inicio' },
  { id: 'animales', icon: '🐃', label: 'Animales' },
  { id: 'produccion', icon: '🥛', label: 'Producción' },
  { id: 'salud', icon: '💉', label: 'Salud' },
  { id: 'finanzas', icon: '💰', label: 'Finanzas' }
];

function NavButton({ 
  item, 
  active, 
  onClick 
}: { 
  item: NavItem; 
  active: boolean; 
  onClick: () => void;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  // ✨ MEJORA 10: Efecto ripple al tocar
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 600);
    
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      className={`
        relative overflow-hidden
        flex flex-col items-center justify-center gap-1
        p-4 min-w-[64px] rounded-2xl
        transition-all duration-300 ease-out
        group
        ${active 
          ? 'scale-100' 
          : 'scale-95 opacity-60'
        }
        ${isPressed && !active ? 'scale-90' : ''}
      `}
      // ✨ MEJORA 7: Tooltip en hover para desktop
      title={item.label}
    >
      {/* ✨ MEJORA 10: Ripple effect animado */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: 0,
            height: 0,
          }}
        />
      ))}

      {/* ✨ MEJORA 5: Íconos más grandes con animación de rebote */}
      <span 
        className={`
          text-3xl filter drop-shadow-lg
          transition-all duration-300
          ${active 
            ? 'scale-110 animate-bounce-once' 
            : 'grayscale group-hover:grayscale-0 group-hover:scale-105'
          }
          ${isPressed ? 'scale-95' : ''}
        `}
      >
        {item.icon}
      </span>

      {/* ✨ MEJORA 3: Indicador activo más visible - barra inferior con glow */}
      {active && (
        <>
          {/* Barra inferior */}
          <div 
            className="absolute bottom-1 w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-[0_0_12px_#4ade80] animate-slide-in"
          />
          {/* Glow de fondo */}
          <div 
            className="absolute inset-0 bg-green-500/10 rounded-2xl animate-pulse-slow"
          />
        </>
      )}

      {/* ✨ MEJORA 6: Tooltip label (visible en hover en desktop) */}
      <span 
        className={`
          absolute -top-10 left-1/2 -translate-x-1/2
          px-3 py-1.5 rounded-lg
          bg-gray-900/95 backdrop-blur-sm
          text-white text-xs font-medium whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          shadow-lg
          hidden md:block
        `}
      >
        {item.label}
        {/* Flecha del tooltip */}
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45" />
      </span>
    </button>
  );
}

export function DockNavigation({ 
  activeTab, 
  onTabChange, 
  items = defaultItems 
}: DockNavigationProps) {
  return (
    <>
      {/* ✨ Estilos CSS para animaciones personalizadas */}
      <style jsx>{`
        @keyframes ripple {
          to {
            width: 100px;
            height: 100px;
            opacity: 0;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes bounce-once {
          0%, 100% { transform: scale(1.1) translateY(0); }
          50% { transform: scale(1.1) translateY(-4px); }
        }
        @keyframes slide-in {
          from { width: 0; opacity: 0; }
          to { width: 2rem; opacity: 1; }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
        .animate-bounce-once {
          animation: bounce-once 0.5s ease-out;
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* ✨ MEJORA 7, 8, 9: Fondo con blur, sombra exterior y transición */}
      <nav 
        className={`
          fixed bottom-4 left-4 right-4 mx-auto max-w-md
          bg-gradient-to-r from-[#1B4332]/95 to-[#2D6A4F]/95
          backdrop-blur-xl
          border border-white/20
          px-2 py-3
          flex justify-around items-center
          z-30
          rounded-3xl
          shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]
          transition-all duration-500 ease-out
          hover:shadow-[0_12px_40px_rgba(34,197,94,0.3),0_0_0_1px_rgba(255,255,255,0.15)]
        `}
      >
        {/* ✨ MEJORA 1: Área táctil expandida (p-4 en cada botón) */}
        {items.map(item => (
          <NavButton
            key={item.id}
            item={item}
            active={activeTab === item.id}
            onClick={() => onTabChange(item.id)}
          />
        ))}

        {/* Barra superior decorativa */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />
      </nav>
    </>
  );
}