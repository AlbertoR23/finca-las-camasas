import React from 'react';

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

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-0.5 transition-all duration-300
        ${active ? 'scale-110 -translate-y-1' : 'opacity-40 grayscale scale-100'}
      `}
    >
      <span className="text-xl filter drop-shadow-md">{item.icon}</span>
      {active && (
        <div className="w-1 h-1 bg-green-400 rounded-full shadow-[0_0_10px_#4ade80]" />
      )}
    </button>
  );
}

export function DockNavigation({ 
  activeTab, 
  onTabChange, 
  items = defaultItems 
}: DockNavigationProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 bg-[#1B4332]/95 backdrop-blur-xl border border-white/20 p-3 flex justify-around items-center z-30 shadow-2xl shadow-green-900/40 rounded-2xl">
      {items.map(item => (
        <NavButton
          key={item.id}
          item={item}
          active={activeTab === item.id}
          onClick={() => onTabChange(item.id)}
        />
      ))}
    </nav>
  );
}