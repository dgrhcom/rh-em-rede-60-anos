import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent px-4 py-2.5 transition-all pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: DGRH Logo & Prominent Page Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="relative flex items-center gap-3 select-none">
            {/* Enlarged Official DGRH SVG Logo */}
            <img
              src="/logo_dgrh.svg"
              alt="DGRH - Diretoria Geral de Recursos Humanos"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs"
            />

            <div className="h-8 w-px bg-slate-950/20 hidden sm:block" />

            <div className="flex flex-col text-left">
              <h1 className="text-sm sm:text-base md:text-xl font-black text-slate-950 tracking-tight leading-tight">
                A Gestão de Pessoas nos 60 Anos da Unicamp
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
