import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { TimelineCard, pureBgColors } from './TimelineCard';
import { soundFx } from '../../utils/soundEffects';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Sparkles, FastForward 
} from 'lucide-react';
import gsap from 'gsap';

interface ContinuousTimelineProps {
  periods: HistoricalPeriod[];
  activeIndex: number | null;
  onSelectPeriod: (index: number | null) => void;
  onOpenPhoto: (photo: MilestonePhoto, period: HistoricalPeriod) => void;
}

export const ContinuousTimeline: React.FC<ContinuousTimelineProps> = ({
  periods,
  activeIndex,
  onSelectPeriod,
  onOpenPhoto,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPeriods = periods.length;

  // Animation position state (floating point for smooth dragging & tweening)
  const [currentPosition, setCurrentPosition] = useState<number>(activeIndex ?? 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [cardSpacing, setCardSpacing] = useState(320);

  // Intro animation states
  const [isIntroActive, setIsIntroActive] = useState<boolean>(true);
  const [introProgress, setIntroProgress] = useState<number>(0);

  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);

  // Responsive spacing calculation
  useEffect(() => {
    const updateSpacing = () => {
      const w = window.innerWidth;
      if (activeIndex === null) {
        // Compact gallery spacing when no card is selected
        if (w < 640) {
          setCardSpacing(280);
        } else if (w < 1024) {
          setCardSpacing(320);
        } else {
          setCardSpacing(360);
        }
      } else {
        // Expanded 2-column active card spacing
        if (w < 640) {
          setCardSpacing(360);
        } else if (w < 1024) {
          setCardSpacing(540);
        } else {
          setCardSpacing(700);
        }
      }
    };
    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, [activeIndex]);

  // Initial Intro Animation: Deal cards from 3D fan into horizontal timeline
  const startIntroAnimation = useCallback(() => {
    setIsIntroActive(true);
    setIntroProgress(0);

    if (introTweenRef.current) introTweenRef.current.kill();
    soundFx.playCardTick();

    const obj = { p: 0 };
    introTweenRef.current = gsap.to(obj, {
      p: 1,
      duration: 2.2,
      delay: 0.3,
      ease: 'power3.inOut',
      onUpdate: () => {
        setIntroProgress(obj.p);
      },
      onComplete: () => {
        setIsIntroActive(false);
        soundFx.playCardTick();
      },
    });
  }, []);

  useEffect(() => {
    startIntroAnimation();
    return () => {
      if (introTweenRef.current) introTweenRef.current.kill();
    };
  }, [startIntroAnimation]);

  const skipIntro = () => {
    if (introTweenRef.current) introTweenRef.current.kill();
    setIsIntroActive(false);
    setIntroProgress(1);
    soundFx.playCardTick();
  };

  // Smoothly slide to index using GSAP
  const slideToIndex = useCallback((index: number, duration = 0.6) => {
    const target = Math.max(0, Math.min(totalPeriods - 1, index));
    soundFx.playCardTick();
    onSelectPeriod(target);

    if (tweenRef.current) tweenRef.current.kill();

    const obj = { pos: currentPosition };
    tweenRef.current = gsap.to(obj, {
      pos: target,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        setCurrentPosition(obj.pos);
      },
      onComplete: () => {
        setCurrentPosition(target);
      },
    });
  }, [currentPosition, onSelectPeriod, totalPeriods]);

  // Sync when activeIndex changes externally
  useEffect(() => {
    if (activeIndex !== null && Math.abs(currentPosition - activeIndex) > 0.05 && !isDragging && !isIntroActive) {
      slideToIndex(activeIndex, 0.5);
    }
  }, [activeIndex, isDragging, isIntroActive, currentPosition, slideToIndex]);

  // Next & Previous
  const handlePrev = useCallback(() => {
    const current = activeIndex ?? Math.round(currentPosition);
    const nextIdx = Math.max(0, current - 1);
    slideToIndex(nextIdx);
  }, [activeIndex, currentPosition, slideToIndex]);

  const handleNext = useCallback(() => {
    const current = activeIndex ?? Math.round(currentPosition);
    const nextIdx = Math.min(totalPeriods - 1, current + 1);
    slideToIndex(nextIdx);
  }, [activeIndex, currentPosition, totalPeriods, slideToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isIntroActive) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          skipIntro();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        const currentIdx = activeIndex ?? Math.round(currentPosition);
        const currentPeriod = periods[currentIdx];
        if (currentPeriod?.photos && currentPeriod.photos.length > 0) {
          onOpenPhoto(currentPeriod.photos[0], currentPeriod);
        }
      } else if (e.key === 'Escape' && activeIndex !== null) {
        onSelectPeriod(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, activeIndex, onOpenPhoto, periods, isIntroActive, currentPosition, onSelectPeriod]);

  // Mouse wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isIntroActive) return;

    let wheelTimeout: number | null = null;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulatedDelta += e.deltaY || e.deltaX;

      if (wheelTimeout) clearTimeout(wheelTimeout);

      wheelTimeout = window.setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 30) {
          if (accumulatedDelta > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
        accumulatedDelta = 0;
      }, 40);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [handleNext, handlePrev, isIntroActive]);

  // Drag & Swipe gesture handling
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isIntroActive) return;
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-no-drag]')) {
      return;
    }
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPosRef.current = currentPosition;
    if (tweenRef.current) tweenRef.current.kill();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const deltaIndex = -deltaX / cardSpacing;
    const rawPos = startPosRef.current + deltaIndex;
    let clampedPos = rawPos;
    if (rawPos < 0) {
      clampedPos = rawPos * 0.3;
    } else if (rawPos > totalPeriods - 1) {
      clampedPos = totalPeriods - 1 + (rawPos - (totalPeriods - 1)) * 0.3;
    }
    setCurrentPosition(clampedPos);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest integer index smoothly
    const nearestIndex = Math.max(0, Math.min(totalPeriods - 1, Math.round(currentPosition)));
    if (tweenRef.current) tweenRef.current.kill();

    const obj = { pos: currentPosition };
    tweenRef.current = gsap.to(obj, {
      pos: nearestIndex,
      duration: 0.45,
      ease: 'power3.out',
      onUpdate: () => {
        setCurrentPosition(obj.pos);
      },
      onComplete: () => {
        setCurrentPosition(nearestIndex);
      },
    });
  };

  // Auto-play timer
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        const current = activeIndex ?? 0;
        if (current >= totalPeriods - 1) {
          slideToIndex(0);
        } else {
          handleNext();
        }
      }, 4200);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, activeIndex, totalPeriods, handleNext, slideToIndex]);

  const activePeriod = activeIndex !== null ? periods[activeIndex] : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-[#e5a93a] text-slate-900 flex flex-col justify-between select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ================= INTRO ANIMATION OVERLAY ================= */}
      {isIntroActive && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-between p-6">
          {/* Top Bar with Skip Button */}
          <div className="w-full max-w-5xl flex items-center justify-between pointer-events-auto">
            <span className="px-3 py-1 rounded-full bg-white text-slate-950 text-xs font-black shadow-md border border-slate-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#105e7b]" />
              <span>Abertura Comemorativa 60 Anos</span>
            </span>

            <button
              onClick={skipIntro}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-slate-100 text-slate-950 text-xs font-black border-2 border-slate-950 shadow-lg cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Pular apresentação inicial"
            >
              <span>Pular</span>
              <FastForward className="w-3.5 h-3.5 text-[#105e7b]" />
            </button>
          </div>

          {/* Central Title Banner (Fades out as cards spread) */}
          <div
            className="text-center my-auto transition-opacity duration-300 pointer-events-none"
            style={{
              opacity: Math.max(0, 1 - introProgress * 2.2),
              transform: `translateY(${-introProgress * 30}px)`,
            }}
          >
            <div className="inline-block px-3 py-1 rounded-full bg-white/90 text-[#105e7b] text-xs font-black uppercase tracking-widest mb-2 border border-slate-900 shadow-sm">
              1983 — 2025
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 tracking-tight drop-shadow-xs">
              A Gestão de Pessoas nos 60 Anos da Unicamp
            </h2>
            <p className="text-xs sm:text-sm text-slate-800 font-bold mt-1">
              Uma trajetória de pessoas, valorização e memória institucional
            </p>
          </div>

          {/* Bottom subtle hint */}
          <div
            className="text-center text-xs font-bold text-slate-900/80 transition-opacity duration-300"
            style={{ opacity: Math.max(0, 1 - introProgress * 2) }}
          >
            Distribuindo os 12 períodos históricos na linha do tempo...
          </div>
        </div>
      )}

      {/* ================= 2. CONTINUOUS HORIZONTAL CARDS STAGE ================= */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Horizontal Connecting Timeline Line */}
        <div
          className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-0 transition-all duration-700"
          style={{
            opacity: isIntroActive ? Math.min(1, Math.max(0, (introProgress - 0.4) / 0.6)) : 1,
            transform: `scaleX(${isIntroActive ? Math.min(1, Math.max(0, (introProgress - 0.3) / 0.7)) : 1})`,
            transformOrigin: 'center center',
          }}
        >
          <div className="w-full h-0 border-t-2 border-dashed border-slate-600/80" />
        </div>

        {/* The Continuous Strip of Cards */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
          {periods.map((period, idx) => {
            const isCardActive = activeIndex !== null && idx === activeIndex;

            // Target timeline transform coordinates
            const offset = idx - currentPosition;
            const absOffset = Math.abs(offset);

            // Progressive comfortable spacing
            const sign = offset < 0 ? -1 : 1;
            let targetX = 0;
            let targetScale = 1.0;
            let targetOpacity = 1;
            let targetZIndex = 50;

            if (activeIndex !== null) {
              // Mode A: ONE CARD IS SELECTED (Active 2-column center card + smaller neighbors)
              if (absOffset <= 1) {
                targetX = sign * absOffset * cardSpacing;
              } else if (absOffset <= 2) {
                targetX = sign * (cardSpacing + (absOffset - 1) * (cardSpacing * 0.52));
              } else {
                targetX = sign * (cardSpacing * 1.52 + (absOffset - 2) * (cardSpacing * 0.42));
              }

              if (absOffset <= 1) {
                targetScale = 1.0 - absOffset * 0.35;
              } else if (absOffset <= 2) {
                targetScale = 0.65 - (absOffset - 1) * 0.23;
              } else {
                targetScale = Math.max(0.20, 0.42 - (absOffset - 2) * 0.16);
              }

              targetOpacity = absOffset > 2.3 ? Math.max(0.15, 1 - (absOffset - 2.3) * 0.75) : 1;
              targetZIndex = Math.round(50 - absOffset * 10);
            } else {
              // Mode B: NO CARD SELECTED (Clean compact gallery of cards side-by-side)
              targetX = offset * cardSpacing;
              targetScale = Math.max(0.48, 1.0 - absOffset * 0.13);
              targetOpacity = absOffset > 3.2 ? Math.max(0.12, 1 - (absOffset - 3.2) * 0.75) : 1;
              targetZIndex = Math.round(50 - absOffset * 4);
            }

            // Calculations during Intro Animation (interpolating from center 3D fan stack to timeline)
            let currentX = targetX;
            let currentY = 0;
            let currentRot = 0;
            let currentScale = targetScale;
            let currentOpacity = targetOpacity;
            let currentZIndex = targetZIndex;

            if (isIntroActive) {
              // 3D Fan Stack initial values
              const fanAngle = (idx - 5.5) * 4.8; // Fan tilt -26deg to +26deg
              const fanX = (idx - 5.5) * 20; // Slight horizontal staggered spread
              const fanY = Math.pow(Math.abs(idx - 5.5), 1.4) * 4.2 - 12; // Gentle arc
              const fanScale = 0.76;
              const fanZ = 30 + idx;

              // Staggered deal interpolation
              const staggerStart = idx * 0.042;
              const dealDuration = 0.52;
              const rawP = Math.max(0, Math.min(1, (introProgress - staggerStart) / dealDuration));
              // Ease out function
              const p = 1 - Math.pow(1 - rawP, 3);

              currentX = fanX + (targetX - fanX) * p;
              currentY = fanY + (0 - fanY) * p;
              currentRot = fanAngle * (1 - p);
              currentScale = fanScale + (targetScale - fanScale) * p;
              currentOpacity = 1;
              currentZIndex = Math.round(fanZ + (targetZIndex - fanZ) * p);
            } else {
              // Limit rendering of distant cards outside intro for high performance
              if (absOffset > 4.5) return null;
            }

            return (
              <div
                key={period.id}
                className="absolute transition-shadow duration-300 pointer-events-auto"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0) scale(${currentScale}) rotate(${currentRot}deg)`,
                  transformOrigin: 'center center',
                  opacity: currentOpacity,
                  zIndex: currentZIndex,
                }}
              >
                <TimelineCard
                  period={period}
                  isActive={isCardActive}
                  onSelect={() => slideToIndex(idx)}
                  onClose={() => onSelectPeriod(null)}
                  onOpenPhoto={onOpenPhoto}
                />
              </div>
            );
          })}
        </div>

        {/* Floating Side Arrow Buttons */}
        <button
          onClick={handlePrev}
          disabled={isIntroActive || (activeIndex !== null && activeIndex === 0) || (activeIndex === null && currentPosition <= 0)}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
          title="Período anterior"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          disabled={isIntroActive || (activeIndex !== null && activeIndex === totalPeriods - 1) || (activeIndex === null && currentPosition >= totalPeriods - 1)}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
          title="Próximo período"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ================= 3. COMPACT BOTTOM TIMELINE RULER & CONTROLS ================= */}
      <div 
        className="relative z-20 pb-2 px-3 max-w-4xl mx-auto w-full flex flex-col items-center gap-1.5 transition-all duration-700"
        style={{
          opacity: isIntroActive ? Math.min(1, Math.max(0, (introProgress - 0.45) / 0.55)) : 1,
          transform: `translateY(${isIntroActive ? (1 - Math.min(1, Math.max(0, (introProgress - 0.45) / 0.55))) * 35 : 0}px)`,
        }}
      >
        {/* Sleek Low-Profile Chronological Track (Darker yellow without border) */}
        <div className="w-full bg-[#b8801d] px-2 sm:px-3 py-2 rounded-2xl shadow-lg">
          <div className="relative w-full flex items-center justify-between gap-1 px-1 sm:px-2">
            {/* Background connecting line */}
            <div className="absolute inset-x-4 top-1/2 h-1 bg-black/20 -translate-y-1/2 rounded-full -z-0" />

            {/* Filled progress bar */}
            <div
              className={`absolute left-4 top-1/2 h-1 ${activeIndex !== null ? pureBgColors[activeIndex % pureBgColors.length] : 'bg-transparent'} -translate-y-1/2 rounded-full transition-all duration-300 -z-0`}
              style={{
                width: activeIndex !== null ? `calc(${(activeIndex / (totalPeriods - 1)) * 100}% - 16px)` : '0px',
              }}
            />

            {/* 12 Historical Compact Nodes with Years directly inside circles */}
            {periods.map((p, idx) => {
              const isSelected = activeIndex !== null && idx === activeIndex;
              const cardBgClass = pureBgColors[idx % pureBgColors.length];

              return (
                <button
                  key={p.id}
                  onClick={() => slideToIndex(idx)}
                  className="relative z-10 flex flex-col items-center cursor-pointer group transition-all duration-200"
                  title={`${p.period} • ${p.title}`}
                >
                  <div
                    className={`min-w-6 sm:min-w-8 h-6 sm:h-7 px-1 sm:px-1.5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? `${cardBgClass} text-white border-2 border-white shadow-md scale-110 ring-2 ring-black/20`
                        : 'bg-white text-slate-900 border border-black/10 hover:border-black/30 hover:scale-105 shadow-xs'
                    }`}
                  >
                    <span className="sm:hidden text-[7.5px] font-black leading-none tracking-tighter">
                      {p.startYear === p.endYear ? p.startYear : `${String(p.startYear).slice(2)}-${String(p.endYear).slice(2)}`}
                    </span>
                    <span className="hidden sm:inline text-[9px] md:text-[10px] font-black leading-none tracking-tighter">
                      {p.startYear === p.endYear ? p.startYear : `${p.startYear}-${String(p.endYear).slice(2)}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compact Quick Controls Row */}
        <div className="flex items-center justify-center gap-2">
          {/* Replay Intro Animation button */}
          <button
            onClick={startIntroAnimation}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer"
            title="Rever apresentação e animação inicial"
          >
            <Sparkles className="w-3 h-3 text-[#105e7b]" />
            <span>Abertura</span>
          </button>

          {/* Auto-play pill */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border border-slate-950 transition-all cursor-pointer shadow-xs ${
              isAutoPlaying
                ? 'bg-[#105e7b] text-white ring-1 ring-white'
                : 'bg-white hover:bg-slate-100 text-slate-900'
            }`}
            title="Apresentação contínua automática"
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3 h-3" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current" />
                <span>Apresentação</span>
              </>
            )}
          </button>

          {/* Reset pill */}
          <button
            onClick={() => {
              slideToIndex(0);
              onSelectPeriod(null);
            }}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer"
            title="Voltar ao início (1983) em visão geral"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Início (1983)</span>
          </button>

          {/* Status Indicator */}
          {activePeriod ? (
            <span className="text-[11px] font-black text-slate-900 bg-white/95 border border-slate-950 px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5">
              <span>{activePeriod.period} ({activePeriod.index + 1}/{totalPeriods})</span>
              <button
                onClick={() => onSelectPeriod(null)}
                className="text-slate-500 hover:text-slate-950 font-bold ml-1 cursor-pointer"
                title="Recolher e voltar à visão geral"
              >
                ✕
              </button>
            </span>
          ) : (
            <span className="text-[11px] font-black text-slate-900 bg-white/95 border border-slate-950 px-3 py-0.5 rounded-full shadow-xs">
              1983 — 2025 • Selecione um período
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
