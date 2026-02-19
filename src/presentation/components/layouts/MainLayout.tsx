import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MainLayout({ children, header, footer }: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-32 text-slate-900 font-sans selection:bg-green-200 relative">
      {/* Header con sticky, gradiente y animaciones */}
      {header && (
        <header className="sticky top-0 z-30 bg-gradient-to-br from-[#1B4332] via-[#2D5F4A] to-[#1B4332] text-white pt-10 pb-16 px-6 shadow-2xl rounded-b-[3rem] backdrop-blur-sm transition-all duration-300">
          <div className="max-w-md mx-auto">{header}</div>
        </header>
      )}

      {/* Contenedor principal de contenido */}
      <div className="max-w-md mx-auto px-4 -mt-12 space-y-6 relative z-10 transition-all duration-300">
        {children}
      </div>

      {/* Footer con dock flotante y efectos visuales */}
      {footer && (
        <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
          <div className="max-w-md mx-auto px-4 pb-6 pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_-4px_20px_rgba(0,0,0,0.12)] border border-white/20 transition-all duration-300 hover:shadow-[0_-8px_30px_rgba(0,0,0,0.16)]">
              {footer}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}