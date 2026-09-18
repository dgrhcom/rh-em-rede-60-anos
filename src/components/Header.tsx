import React from 'react';
import { BarChart3, Clock } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface HeaderProps {
  isCentered?: boolean;
  currentView?: 'timeline' | 'dashboard';
  onNavigate?: (view: 'timeline' | 'dashboard') => void;
  logoVisible?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isCentered = true,
  currentView = 'timeline',
  onNavigate,
  logoVisible = true,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-700 ease-in-out ${
          isCentered
            ? 'top-[max(1rem,calc(14vh-40px))] sm:top-[calc(16vh-40px)] md:top-[calc(18vh-40px)] left-1/2 -translate-x-1/2'
            : 'top-0 left-0 translate-x-0'
        }`}
        style={{
          padding: isCentered ? '0px' : '48px',
        }}
      >
        <img
          src="/logo_dgrh.svg"
          alt="DGRH - Diretoria Geral de Recursos Humanos"
          className={`w-auto object-contain select-none pointer-events-auto transition-all duration-1000 ease-out ${
            logoVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          } ${
            isCentered
              ? 'h-9 sm:h-12 md:h-14 max-w-[85vw] drop-shadow-md'
              : 'h-8 sm:h-10 md:h-12 max-w-[calc(100vw-96px)] drop-shadow-xs'
          }`}
        />
      </div>

      {/* Top-Right Navigation Pill (Visible only after opening is completed or on dashboard) */}
      {(!isCentered || currentView === 'dashboard') && onNavigate && (
        <div className="fixed top-6 right-6 sm:top-8 sm:right-10 z-40 pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-full border-2 border-slate-950 shadow-xl transition-all duration-500">
          <button
            onClick={() => {
              soundFx.playCardTick();
              onNavigate('timeline');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              currentView === 'timeline'
                ? 'bg-slate-950 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
            title="Ver Linha do Tempo contínua"
          >
            <Clock className="w-3.5 h-3.5 text-[#e5a93a]" />
            <span>Linha do Tempo</span>
          </button>

          <button
            onClick={() => {
              soundFx.playCardTick();
              onNavigate('dashboard');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#105e7b] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
            title="Apresentação de Indicadores e Estatísticas"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#e5a93a]" />
            <span>Indicadores & Gráficos</span>
          </button>
        </div>
      )}
    </header>
  );
};
