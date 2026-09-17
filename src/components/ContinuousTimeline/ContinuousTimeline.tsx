import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { TimelineCard, pureBgColors } from './TimelineCard';
import { soundFx } from '../../utils/soundEffects';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX 
} from 'lucide-react';
import gsap from 'gsap';

interface ContinuousTimelineProps {
  periods: HistoricalPeriod[];
  activeIndex: number | null;
  onSelectPeriod: (index: number | null) => void;
  onOpenPhoto: (photo: MilestonePhoto, period: HistoricalPeriod) => void;
  onFanIdleChange?: (isIdle: boolean) => void;
}

export const ContinuousTimeline: React.FC<ContinuousTimelineProps> = ({
  periods,
  activeIndex,
  onSelectPeriod,
  onOpenPhoto,
  onFanIdleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPeriods = periods.length;

  // Animation position state (floating point for smooth dragging & tweening)
  const [currentPosition, setCurrentPosition] = useState<number>(activeIndex ?? 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [cardSpacing, setCardSpacing] = useState(320);

  // Intro animation lifecycle: 'idle_fan' (waiting for user click) -> 'animating' (dealing out) -> 'done'
  const [introStatus, setIntroStatus] = useState<'idle_fan' | 'animating' | 'done'>('idle_fan');
  const [introProgress, setIntroProgress] = useState<number>(0);

  const isIntroActive = introStatus !== 'done';
  const isFanIdle = introStatus === 'idle_fan';
  const isAnimating = introStatus === 'animating';

  // Notify parent component about fan idle status
  useEffect(() => {
    onFanIdleChange?.(isFanIdle);
  }, [isFanIdle, onFanIdleChange]);

  const [soundActive, setSoundActive] = useState<boolean>(() => soundFx.isEnabled());

  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setSoundActive(newState);
  };

  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const introTweenRef = useRef<gsap.core.Tween | null>(null);

  const currentPositionRef = useRef<number>(currentPosition);
  useEffect(() => {
    currentPositionRef.current = currentPosition;
  }, [currentPosition]);
  const prevActiveIndexRef = useRef<number | null>(activeIndex);

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

  // Smoothly slide to index using GSAP
  const slideToIndex = useCallback((index: number, duration = 0.6) => {
    const target = Math.max(0, Math.min(totalPeriods - 1, index));
    prevActiveIndexRef.current = target;
    soundFx.playCardTick();
    onSelectPeriod(target);

    if (tweenRef.current) tweenRef.current.kill();

    const startPos = currentPositionRef.current;
    const obj = { pos: startPos };
    tweenRef.current = gsap.to(obj, {
      pos: target,
      duration,
      ease: 'power3.out',
      onUpdate: () => {
        currentPositionRef.current = obj.pos;
        setCurrentPosition(obj.pos);
      },
      onComplete: () => {
        currentPositionRef.current = target;
        setCurrentPosition(target);
      },
    });
  }, [onSelectPeriod, totalPeriods]);

  // Execute Opening Animation: strictly guarantees all cards are unselected at start,
  // animates cards dealing out from the 3D fan, and selects the first card (index 0) by default upon completion.
  const executeOpeningAnimation = useCallback(() => {
    if (introStatus === 'animating') return;

    // 1. Strictly guarantee all cards are unselected before and during the opening
    prevActiveIndexRef.current = null;
    currentPositionRef.current = 0;
    onSelectPeriod(null);
    setCurrentPosition(0);
    setIntroStatus('animating');
    setIntroProgress(0);

    if (introTweenRef.current) introTweenRef.current.kill();
    soundFx.playCardTick();

    const obj = { p: 0 };
    introTweenRef.current = gsap.to(obj, {
      p: 1,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        setIntroProgress(obj.p);
      },
      onComplete: () => {
        introTweenRef.current = null;
        setIntroProgress(1);
        setIntroStatus('done');
        soundFx.playCardTick();
        // 2. Select the first card (1983-1986) by default
        slideToIndex(0);
      },
    });
  }, [introStatus, onSelectPeriod, slideToIndex]);

  // Skip Opening Animation: immediately complete and select the first card
  const skipIntro = useCallback(() => {
    if (introTweenRef.current) introTweenRef.current.kill();
    introTweenRef.current = null;
    setIntroProgress(1);
    setIntroStatus('done');
    soundFx.playCardTick();
    // Select the first card by default
    slideToIndex(0);
  }, [slideToIndex]);

  // Reset to initial 3D fan view (idle state with all cards unselected)
  const handleReplayIntro = useCallback(() => {
    if (introTweenRef.current) introTweenRef.current.kill();
    if (tweenRef.current) tweenRef.current.kill();
    prevActiveIndexRef.current = null;
    currentPositionRef.current = 0;
    onSelectPeriod(null);
    setCurrentPosition(0);
    setIntroProgress(0);
    setIntroStatus('idle_fan');
    soundFx.playCardTick();
  }, [onSelectPeriod]);

  // Cleanup tween on unmount
  useEffect(() => {
    return () => {
      if (introTweenRef.current) introTweenRef.current.kill();
    };
  }, []);

  // Sync when activeIndex changes externally (e.g. from bottom navigation)
  useEffect(() => {
    if (
      activeIndex !== null &&
      activeIndex !== prevActiveIndexRef.current &&
      !isDragging &&
      !isIntroActive
    ) {
      prevActiveIndexRef.current = activeIndex;
      if (Math.abs(currentPositionRef.current - activeIndex) > 0.01) {
        slideToIndex(activeIndex, 0.5);
      }
    } else {
      prevActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, isDragging, isIntroActive, slideToIndex]);

  // Next & Previous
  const handlePrev = useCallback(() => {
    const current = activeIndex ?? Math.round(currentPositionRef.current);
    const nextIdx = Math.max(0, current - 1);
    slideToIndex(nextIdx);
  }, [activeIndex, slideToIndex]);

  const handleNext = useCallback(() => {
    const current = activeIndex ?? Math.round(currentPositionRef.current);
    const nextIdx = Math.min(totalPeriods - 1, current + 1);
    slideToIndex(nextIdx);
  }, [activeIndex, totalPeriods, slideToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFanIdle) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          executeOpeningAnimation();
        } else if (e.key === 'Escape') {
          skipIntro();
        }
        return;
      }

      if (isAnimating) {
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
  }, [isFanIdle, isAnimating, executeOpeningAnimation, skipIntro, handlePrev, handleNext, activeIndex, onOpenPhoto, periods, currentPosition, onSelectPeriod]);

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
    currentPositionRef.current = clampedPos;
    setCurrentPosition(clampedPos);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest integer index smoothly
    const nearestIndex = Math.max(0, Math.min(totalPeriods - 1, Math.round(currentPositionRef.current)));
    if (tweenRef.current) tweenRef.current.kill();

    const obj = { pos: currentPositionRef.current };
    tweenRef.current = gsap.to(obj, {
      pos: nearestIndex,
      duration: 0.45,
      ease: 'power3.out',
      onUpdate: () => {
        currentPositionRef.current = obj.pos;
        setCurrentPosition(obj.pos);
      },
      onComplete: () => {
        currentPositionRef.current = nearestIndex;
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
      {/* ================= 1. INTRO 3D FAN OVERLAY (Cards + Start Button Only) ================= */}
      {isFanIdle && (
        <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-8 sm:pb-12">
          <div className="pointer-events-auto">
            <button
              onClick={executeOpeningAnimation}
              className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-sm sm:text-base tracking-wide shadow-2xl border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/10 group"
              title="Iniciar abertura da linha do tempo"
            >
              <Sparkles className="w-5 h-5 text-[#e5a93a] group-hover:rotate-12 transition-transform" />
              <span>Iniciar Abertura</span>
              <Play className="w-4 h-4 fill-white text-white group-hover:translate-x-0.5 transition-transform" />
            </button>
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
        <div
          className={`relative z-10 w-full h-full flex items-center justify-center ${
            isFanIdle ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'
          }`}
          onClick={() => {
            if (isFanIdle) {
              executeOpeningAnimation();
            }
          }}
        >
          {periods.map((period, idx) => {
            // Guarantee cards are strictly unselected during intro / fan / abertura
            const isCardActive = !isIntroActive && activeIndex !== null && idx === activeIndex;

            // Target timeline transform coordinates
            const offset = idx - currentPosition;
            const absOffset = Math.abs(offset);

            // Progressive comfortable spacing
            const sign = offset < 0 ? -1 : 1;
            let targetX = 0;
            let targetScale = 1.0;
            let targetOpacity = 1;
            let targetZIndex = 50;

            if (activeIndex !== null && !isIntroActive) {
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
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
              const fanAngle = (idx - 5.5) * (isMobile ? 3.8 : 4.8); // Fan tilt
              const fanX = (idx - 5.5) * (isMobile ? 14 : 20); // Horizontal spread
              const fanY = Math.pow(Math.abs(idx - 5.5), 1.4) * (isMobile ? 3.2 : 4.2) - (isMobile ? 8 : 12); // Gentle arc
              const fanScale = isMobile ? 0.64 : 0.76;
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
                className={`absolute transition-shadow duration-300 pointer-events-auto ${
                  isFanIdle ? 'cursor-pointer hover:scale-[1.03] transition-transform' : ''
                }`}
                onClick={(e) => {
                  if (isFanIdle) {
                    e.stopPropagation();
                    executeOpeningAnimation();
                  }
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0) scale(${currentScale}) rotate(${currentRot}deg)`,
                  transformOrigin: 'center center',
                  opacity: currentOpacity,
                  zIndex: currentZIndex,
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <TimelineCard
                  period={period}
                  isActive={isCardActive}
                  onSelect={() => {
                    if (isFanIdle) {
                      executeOpeningAnimation();
                    } else if (!isIntroActive) {
                      slideToIndex(idx);
                    }
                  }}
                  onClose={() => onSelectPeriod(null)}
                  onOpenPhoto={onOpenPhoto}
                />
              </div>
            );
          })}
        </div>

        {/* Floating Side Arrow Buttons (Hidden during intro) */}
        {!isIntroActive && (
          <>
            <button
              onClick={handlePrev}
              disabled={(activeIndex !== null && activeIndex === 0) || (activeIndex === null && currentPosition <= 0)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
              title="Período anterior"
            >
              <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={handleNext}
              disabled={(activeIndex !== null && activeIndex === totalPeriods - 1) || (activeIndex === null && currentPosition >= totalPeriods - 1)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
              title="Próximo período"
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* ================= 3. COMPACT BOTTOM TIMELINE RULER & CONTROLS ================= */}
      <div 
        className={`relative z-20 pb-2 px-3 max-w-4xl mx-auto w-full flex flex-col items-center gap-1.5 transition-all duration-700 ${isIntroActive ? 'pointer-events-none' : ''}`}
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
            onClick={handleReplayIntro}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer"
            title="Voltar para apresentação em leque e abertura"
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

          {/* Sound / Audio Toggle pill */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer ${
              soundActive
                ? 'bg-white hover:bg-slate-100 text-slate-900'
                : 'bg-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title={soundActive ? 'Efeitos sonoros ativados (Clique para silenciar)' : 'Efeitos sonoros desativados (Clique para ativar)'}
          >
            {soundActive ? (
              <>
                <Volume2 className="w-3 h-3 text-[#105e7b]" />
                <span>Som</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3 h-3 text-slate-500" />
                <span>Mudo</span>
              </>
            )}
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
