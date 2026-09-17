import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { TimelineCard, pureBgColors } from './TimelineCard';
import { soundFx } from '../../utils/soundEffects';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw 
} from 'lucide-react';
import gsap from 'gsap';

interface ContinuousTimelineProps {
  periods: HistoricalPeriod[];
  activeIndex: number;
  onSelectPeriod: (index: number) => void;
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
  const [currentPosition, setCurrentPosition] = useState<number>(activeIndex);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [cardSpacing, setCardSpacing] = useState(310);

  const startXRef = useRef(0);
  const startPosRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  // Responsive spacing calculation
  useEffect(() => {
    const updateSpacing = () => {
      const w = window.innerWidth;
      if (w < 640) {
        setCardSpacing(360);
      } else if (w < 1024) {
        setCardSpacing(540);
      } else {
        setCardSpacing(700);
      }
    };
    updateSpacing();
    window.addEventListener('resize', updateSpacing);
    return () => window.removeEventListener('resize', updateSpacing);
  }, []);

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
    if (Math.abs(currentPosition - activeIndex) > 0.05 && !isDragging) {
      slideToIndex(activeIndex, 0.5);
    }
  }, [activeIndex]);

  // Next & Previous
  const handlePrev = useCallback(() => {
    const nextIdx = Math.max(0, activeIndex - 1);
    slideToIndex(nextIdx);
  }, [activeIndex, slideToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = Math.min(totalPeriods - 1, activeIndex + 1);
    slideToIndex(nextIdx);
  }, [activeIndex, totalPeriods, slideToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        const currentPeriod = periods[activeIndex];
        if (currentPeriod?.photos && currentPeriod.photos.length > 0) {
          onOpenPhoto(currentPeriod.photos[0], currentPeriod);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, activeIndex, onOpenPhoto, periods]);

  // Mouse wheel navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let accumulatedDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulatedDelta += e.deltaY !== 0 ? e.deltaY : e.deltaX;

      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (Math.abs(accumulatedDelta) > 25) {
          if (accumulatedDelta > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
        accumulatedDelta = 0;
      }, 50);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [handleNext, handlePrev]);

  // Pointer / Touch Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (tweenRef.current) tweenRef.current.kill();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startPosRef.current = currentPosition;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    // Map drag distance in pixels to card indices
    const deltaIndex = -deltaX / cardSpacing;
    const rawPos = startPosRef.current + deltaIndex;
    // Resistance at boundaries
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

    // Snap to nearest integer index
    const nearestIndex = Math.max(0, Math.min(totalPeriods - 1, Math.round(currentPosition)));
    slideToIndex(nearestIndex, 0.45);
  };

  // Auto-play timer
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        if (activeIndex >= totalPeriods - 1) {
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

  const activePeriod = periods[activeIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-[#e5a93a] text-slate-900 flex flex-col justify-between select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >

      {/* ================= 2. CONTINUOUS HORIZONTAL CARDS STAGE ================= */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
        {/* Horizontal Connecting Timeline Line (Gray only, positioned strictly behind cards) */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-0">
          <div className="w-full h-0 border-t-2 border-dashed border-slate-600/80" />
        </div>

        {/* The Continuous Strip of Cards (z-10 guarantees it renders above the gray line) */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pointer-events-none">
          {periods.map((period, idx) => {
            // Distance from current viewport center
            const offset = idx - currentPosition;
            const absOffset = Math.abs(offset);

            // Render cards up to distance 4.2 so ±2 cards are always comfortably visible!
            if (absOffset > 4.2) return null;

            // Progressive comfortable spacing with balanced breathing room
            const sign = offset < 0 ? -1 : 1;
            let xOffset = 0;
            if (absOffset <= 1) {
              xOffset = sign * absOffset * cardSpacing;
            } else if (absOffset <= 2) {
              xOffset = sign * (cardSpacing + (absOffset - 1) * (cardSpacing * 0.52));
            } else {
              xOffset = sign * (cardSpacing * 1.52 + (absOffset - 2) * (cardSpacing * 0.42));
            }

            // Scale:
            // Center active card: 1.0 (inherits intrinsic large 2-column dimensions)
            // Immediate neighbors (offset 1): ~0.65
            // Outer cards (offset 2): ~0.42
            // Edge cards (offset 3+): ~0.26
            let scale = 1.0;
            if (absOffset <= 1) {
              scale = 1.0 - absOffset * 0.35;
            } else if (absOffset <= 2) {
              scale = 0.65 - (absOffset - 1) * 0.23;
            } else {
              scale = Math.max(0.20, 0.42 - (absOffset - 2) * 0.16);
            }

            // Opacity: Cards -2, -1, 0, 1, 2 are 100% solid and opaque
            const opacity = absOffset > 2.3 ? Math.max(0.15, 1 - (absOffset - 2.3) * 0.75) : 1;

            // Z-index: center card on top (50), decreasing outwards
            const zIndex = Math.round(50 - absOffset * 10);

            const isCardActive = idx === activeIndex;

            return (
              <div
                key={period.id}
                className="absolute transition-shadow duration-300 pointer-events-auto"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${xOffset}px), -50%, 0) scale(${scale})`,
                  transformOrigin: 'center center',
                  opacity,
                  zIndex,
                }}
              >
                <TimelineCard
                  period={period}
                  isActive={isCardActive}
                  onSelect={() => slideToIndex(idx)}
                  onOpenPhoto={onOpenPhoto}
                />
              </div>
            );
          })}
        </div>

        {/* Floating Side Arrow Buttons */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
          title="Período anterior"
        >
          <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleNext}
          disabled={activeIndex === totalPeriods - 1}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl disabled:opacity-20 flex items-center justify-center transition-all cursor-pointer group"
          title="Próximo período"
        >
          <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ================= 3. COMPACT BOTTOM TIMELINE RULER & CONTROLS ================= */}
      <div className="relative z-20 pb-2 px-3 max-w-4xl mx-auto w-full flex flex-col items-center gap-1.5">
        {/* Sleek Low-Profile Chronological Track */}
        <div className="w-full bg-[#b8801d] px-2 sm:px-3 py-2 rounded-2xl shadow-lg">
          <div className="relative w-full flex items-center justify-between gap-1 px-1 sm:px-2">
            {/* Background connecting line */}
            <div className="absolute inset-x-4 top-1/2 h-1 bg-black/20 -translate-y-1/2 rounded-full -z-0" />

            {/* Filled progress bar */}
            <div
              className={`absolute left-4 top-1/2 h-1 ${pureBgColors[activeIndex % pureBgColors.length]} -translate-y-1/2 rounded-full transition-all duration-300 -z-0`}
              style={{
                width: `calc(${(activeIndex / (totalPeriods - 1)) * 100}% - 16px)`,
              }}
            />

            {/* 12 Historical Compact Nodes with Years directly inside circles */}
            {periods.map((p, idx) => {
              const isSelected = idx === activeIndex;
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
            onClick={() => slideToIndex(0)}
            disabled={activeIndex === 0}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 text-slate-900 text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer"
            title="Voltar ao início (1983)"
          >
            <RotateCcw className="w-3 h-3" />
            <span>1983</span>
          </button>

          {/* Active Period Indicator */}
          <span className="text-[11px] font-black text-slate-900 bg-white/90 border border-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
            {activePeriod.period} ({activePeriod.index + 1}/{totalPeriods})
          </span>
        </div>
      </div>
    </div>
  );
};
