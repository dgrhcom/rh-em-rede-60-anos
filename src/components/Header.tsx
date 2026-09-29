import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

interface HeaderProps {
  isCentered?: boolean;
  currentView?: 'timeline' | 'dashboard';
  onNavigate?: (view: 'timeline' | 'dashboard') => void;
  logoVisible?: boolean;
  isPreAnimating?: boolean;
  isLogoInCenterScreen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  isCentered = true,
  currentView = 'timeline',
  onNavigate,
  logoVisible = true,
  isPreAnimating = false,
  isLogoInCenterScreen = false,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);
  const [logoWidth, setLogoWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!logoRef.current) return;
    const updateWidth = () => {
      if (logoRef.current) {
        setLogoWidth(logoRef.current.offsetWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(logoRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, [isLogoInCenterScreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    soundFx.playCardTick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center ${
          isCentered
            ? isLogoInCenterScreen
              ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 sm:px-8'
              : 'top-[max(1rem,calc(14vh-40px))] sm:top-[calc(16vh-40px)] md:top-[calc(18vh-40px)] left-1/2 -translate-x-1/2 translate-y-0 w-auto'
            : 'top-0 left-0 translate-x-0 translate-y-0 w-auto'
        }`}
        style={{
          padding: isCentered ? '0px' : '48px',
        }}
      >
        <img
          ref={logoRef}
          src="/logo_dgrh.svg"
          alt="DGRH - Diretoria Geral de Recursos Humanos"
          className={`w-auto object-contain select-none pointer-events-auto transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPreAnimating && isCentered
              ? 'animate-logo-reveal-bottom-up'
              : logoVisible
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
          } ${
            isCentered
              ? isLogoInCenterScreen
                ? 'h-12 sm:h-16 md:h-20 max-w-[85vw] drop-shadow-xl'
                : 'h-9 sm:h-12 md:h-14 max-w-[85vw] drop-shadow-md'
              : 'h-8 sm:h-10 md:h-12 max-w-[calc(100vw-96px)] drop-shadow-xs'
          }`}
        />

        {/* Citação do Prof. Dr. Zeferino Vaz na abertura inicial */}
        <div
          style={{
            maxWidth: logoWidth ? `${logoWidth}px` : undefined,
          }}
          className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col text-left w-full max-w-[485px] sm:max-w-[647px] md:max-w-[809px] px-0 ${
            isLogoInCenterScreen
              ? 'opacity-100 translate-y-0 mt-5 sm:mt-7 md:mt-8'
              : 'opacity-0 -translate-y-4 pointer-events-none max-h-0 overflow-hidden mt-0'
          }`}
        >
          <blockquote className="text-left text-slate-950 text-sm sm:text-base md:text-lg lg:text-[19px] leading-relaxed tracking-tight select-none">
            <span className="font-medium italic">
              “As coisas mais importantes para construir uma universidade são, em primeiro lugar cérebros, em segundo, cérebros, em terceiro, cérebros, e em quarto equipamentos e edifícios”
            </span>
            {' '}
            <span className="not-italic font-black text-black uppercase tracking-wider text-xs sm:text-sm md:text-base inline-block whitespace-nowrap align-baseline ml-1.5 sm:ml-2">
              — Prof. Dr. Zeferino Vaz
            </span>
          </blockquote>
        </div>
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

          <div className="w-px h-4 bg-slate-300 mx-0.5" />

          <button
            onClick={toggleFullscreen}
            className="flex items-center justify-center p-2 rounded-full text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title={isFullscreen ? "Sair da Tela Cheia (Esc)" : "Entrar em Tela Cheia (F11)"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-[#105e7b]" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>
        </div>
      )}
    </header>
  );
};
