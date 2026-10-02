import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { soundFx } from '../utils/soundEffects';

export type OpeningPhase =
  | 'bg_only'
  | 'yellow_fade'
  | 'logo_fade'
  | 'logo_expand'
  | 'quote_typing'
  | 'first_stop';

interface HeaderProps {
  isCentered?: boolean;
  currentView?: 'timeline' | 'dashboard';
  onNavigate?: (view: 'timeline' | 'dashboard') => void;
  logoVisible?: boolean;
  isPreAnimating?: boolean;
  isLogoInCenterScreen?: boolean;
  openingPhase?: OpeningPhase;
  onQuoteTypingComplete?: () => void;
}

const QUOTE_TEXT =
  '“As coisas mais importantes para construir uma universidade são, em primeiro lugar cérebros, em segundo, cérebros, em terceiro, cérebros, e em quarto equipamentos e edifícios”';
const AUTHOR_TEXT = '— Prof. Dr. Zeferino Vaz';
const TOTAL_CHARS = QUOTE_TEXT.length + AUTHOR_TEXT.length + 1;

export const Header: React.FC<HeaderProps> = ({
  isCentered = true,
  currentView = 'timeline',
  onNavigate,
  logoVisible = true,
  isPreAnimating = false,
  isLogoInCenterScreen = false,
  openingPhase = 'first_stop',
  onQuoteTypingComplete,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const logoRef = useRef<HTMLImageElement>(null);

  // Typewriter effect state
  const [typedCount, setTypedCount] = useState<number>(() => {
    return openingPhase === 'first_stop' ? TOTAL_CHARS : 0;
  });

  useEffect(() => {
    if (openingPhase === 'first_stop') {
      setTypedCount(TOTAL_CHARS);
      return;
    }

    if (openingPhase !== 'quote_typing') {
      setTypedCount(0);
      return;
    }

    setTypedCount(0);
    const interval = setInterval(() => {
      setTypedCount((prev) => {
        const next = prev + 1;
        // Subtle tick sound on word spaces
        if (next <= QUOTE_TEXT.length) {
          if (QUOTE_TEXT[next - 1] === ' ') {
            soundFx.playCardTick();
          }
        } else if (next > QUOTE_TEXT.length + 1) {
          const authIdx = next - QUOTE_TEXT.length - 2;
          if (AUTHOR_TEXT[authIdx] === ' ') {
            soundFx.playCardTick();
          }
        }

        if (next >= TOTAL_CHARS) {
          clearInterval(interval);
          onQuoteTypingComplete?.();
          return TOTAL_CHARS;
        }
        return next;
      });
    }, 44);

    return () => clearInterval(interval);
  }, [openingPhase, onQuoteTypingComplete]);

  const visibleQuote = QUOTE_TEXT.slice(0, Math.min(typedCount, QUOTE_TEXT.length));
  const authorCount = Math.max(0, typedCount - QUOTE_TEXT.length - 1);
  const visibleAuthor = AUTHOR_TEXT.slice(0, authorCount);
  const isTypingActive = openingPhase === 'quote_typing' && typedCount < TOTAL_CHARS;

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

  const isLogoAtUpperThird =
    isCentered &&
    isLogoInCenterScreen &&
    (openingPhase === 'logo_expand' ||
      openingPhase === 'quote_typing' ||
      openingPhase === 'first_stop');

  const isLogoAtCenter =
    isCentered &&
    isLogoInCenterScreen &&
    (openingPhase === 'yellow_fade' || openingPhase === 'logo_fade');

  const isLogoHiddenInIntro =
    isCentered && isLogoInCenterScreen && openingPhase === 'bg_only';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent pointer-events-none">
      {/* Container do Logotipo DGRH */}
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center ${
          isCentered
            ? isLogoInCenterScreen
              ? isLogoAtUpperThird
                ? 'top-[max(2.5rem,16%)] sm:top-[17%] md:top-[18%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 sm:px-8'
                : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-6 sm:px-8'
              : 'top-[max(1rem,calc(14vh-40px))] sm:top-[calc(15vh-40px)] md:top-[calc(16vh-40px)] left-1/2 -translate-x-1/2 translate-y-0 w-auto'
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
          className={`w-auto object-contain select-none pointer-events-auto transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isPreAnimating && isCentered
              ? 'animate-logo-reveal-bottom-up'
              : isLogoHiddenInIntro
              ? 'opacity-0 scale-90'
              : isLogoAtUpperThird
              ? 'opacity-100 scale-[1.35] sm:scale-[1.58] md:scale-[1.8] origin-center drop-shadow-2xl'
              : isLogoAtCenter
              ? 'opacity-100 scale-100 origin-center drop-shadow-xl'
              : logoVisible
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-90'
          } ${
            isCentered
              ? isLogoInCenterScreen
                ? 'h-12 sm:h-16 md:h-20 max-w-[85vw]'
                : 'h-12 sm:h-16 md:h-[75px] max-w-[85vw] drop-shadow-md'
              : 'h-8 sm:h-10 md:h-12 max-w-[calc(100vw-96px)] drop-shadow-xs'
          }`}
        />
      </div>

      {/* Citação do Prof. Dr. Zeferino Vaz na abertura inicial: efeito digitação, fonte ampliada, alinhada 125px mais à esquerda */}
      <div
        className={`fixed z-40 pointer-events-none transition-all duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCentered && isLogoInCenterScreen && (openingPhase === 'quote_typing' || openingPhase === 'first_stop')
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        } top-[42%] sm:top-[44%] md:top-[46%] left-6 right-6 md:left-[calc(50%-125px)] md:right-10 lg:right-16 xl:right-24 2xl:right-32 text-left`}
      >
        <blockquote className="text-left text-slate-950 text-xl sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[36px] leading-snug sm:leading-relaxed tracking-tight select-none max-w-4xl">
          <span className="font-medium italic">
            {visibleQuote}
          </span>
          {visibleAuthor && (
            <>
              {' '}
              <span className="not-italic font-black text-black uppercase tracking-wider text-base sm:text-lg md:text-xl lg:text-2xl inline-block whitespace-nowrap align-baseline ml-2 sm:ml-3">
                {visibleAuthor}
              </span>
            </>
          )}
          {isTypingActive && (
            <span className="inline-block w-[3px] h-[0.9em] bg-slate-950 ml-1.5 align-middle animate-pulse" />
          )}
        </blockquote>
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
