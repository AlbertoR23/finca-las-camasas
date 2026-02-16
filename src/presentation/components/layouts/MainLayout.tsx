import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function MainLayout({ children, header, footer }: MainLayoutProps) {
  return (
    <main className="min-h-screen bg-[#F8F9FA] pb-32 text-slate-900 font-sans selection:bg-green-200">
      {header && (
        <header className="bg-[#1B4332] text-white pt-10 pb-16 px-6 sticky top-0 z-20 shadow-2xl rounded-b-[3rem]">
          <div className="max-w-md mx-auto">{header}</div>
        </header>
      )}

      <div className="max-w-md mx-auto p-4 -mt-12 space-y-6 relative z-10">
        {children}
      </div>

      {footer && <div className="fixed bottom-0 left-0 right-0">{footer}</div>}
    </main>
  );
}
