import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HistoricalPeriod } from '../../types/timeline';
import { CircleCard } from './CircleCard';
import { soundFx } from '../../utils/soundEffects';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import gsap from 'gsap';

interface CircleCarouselProps {
  periods: HistoricalPeriod[];
  activeIndex: number;
  onSelectPeriod: (index: number) => void;
  onOpenDetail: (period: HistoricalPeriod) => void;
}

export const CircleCarousel: React.FC<CircleCarouselProps> = ({
  periods,
  activeIndex,
  onSelectPeriod,
  onOpenDetail,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPeriods = periods.length;
  const angleStep = 360 / totalPeriods; // 30 degrees per card

  // Rotation in degrees
  const [rotation, setRotation] = useState(-activeIndex * angleStep);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [radius, setRadius] = useState(560);

  const startXRef = useRef(0);
  const startRotationRef = useRef(0);
  const autoPlayTimerRef = useRef<number | null>(null);

  // Responsive radius calculation
  useEffect(() => {
    const updateRadius = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      if (width < 640) {
        setRadius(380); // Mobile
      } else if (width < 1024 || height < 750) {
        setRadius(480); // Tablet or shorter laptop displays
      } else {
        setRadius(580); // Desktop
      }
    };
    updateRadius();
    window.addEventListener('resize', updateRadius);
    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  // Animate rotation to target index
  const rotateToIndex = useCallback((index: number) => {
    const targetRotation = -index * angleStep;
    soundFx.playCardTick();

    const obj = { r: rotation };
    gsap.to(obj, {
      r: targetRotation,
      duration: 0.8,
      ease: 'power3.out',
      onUpdate: () => setRotation(obj.r),
      onComplete: () => {
        onSelectPeriod(index);
      },
    });
  }, [angleStep, onSelectPeriod, rotation]);

  // Sync external activeIndex changes
  useEffect(() => {
    const currentNorm = ((-rotation % 360) + 360) % 360;
    const targetNorm = ((activeIndex * angleStep % 360) + 360) % 360;
    if (Math.abs(currentNorm - targetNorm) > 1 && !isDragging) {
      rotateToIndex(activeIndex);
    }
  }, [activeIndex]);

  // Next & Previous
  const handlePrev = useCallback(() => {
    const nextIdx = (activeIndex - 1 + totalPeriods) % totalPeriods;
    rotateToIndex(nextIdx);
  }, [activeIndex, totalPeriods, rotateToIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = (activeIndex + 1) % totalPeriods;
    rotateToIndex(nextIdx);
  }, [activeIndex, totalPeriods, rotateToIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        onOpenDetail(periods[activeIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, activeIndex, onOpenDetail, periods]);

  // Mouse wheel rotation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let wheelDelta = 0;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelDelta += e.deltaY * 0.15;

      if (wheelTimeout) clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(() => {
        if (Math.abs(wheelDelta) > 8) {
          if (wheelDelta > 0) {
            handleNext();
          } else {
            handlePrev();
          }
        }
        wheelDelta = 0;
      }, 40);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [handleNext, handlePrev]);

  // Pointer / Touch Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startRotationRef.current = rotation;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    const newRot = startRotationRef.current + deltaX * 0.22;
    setRotation(newRot);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Inertia snap to nearest card
    const rawTarget = -rotation / angleStep;
    const nearestIndex = Math.round(rawTarget);
    const normalizedIndex = ((nearestIndex % totalPeriods) + totalPeriods) % totalPeriods;

    rotateToIndex(normalizedIndex);
  };

  // Auto-play / Presentation mode
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayTimerRef.current = window.setInterval(() => {
        handleNext();
      }, 4000);
    } else if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, handleNext]);

  const activePeriod = periods[activeIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-white text-slate-900 flex flex-col items-center justify-center select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Pop Art / Comic Halftone Dots Background */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-halftone-pattern opacity-35 pointer-events-none" />
      <div className="absolute top-4 right-0 w-80 h-80 bg-halftone-pattern opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-56 h-56 bg-halftone-dense opacity-20 pointer-events-none" />

      {/* Subtle Warm Backdrop Arc */}
      <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[1200px] h-[450px] rounded-[100%] bg-gradient-to-t from-slate-100 via-amber-50/30 to-transparent pointer-events-none -z-0" />

      {/* Center 3D Stage Ring (The Wheel) */}
      <div className="relative w-full h-[410px] sm:h-[450px] perspective-1200 flex items-center justify-center pointer-events-none z-10">
        <div
          className="relative w-full h-full preserve-3d transition-transform pointer-events-auto"
          style={{
            transform: `translateZ(-${radius}px) rotateX(-1deg)`,
          }}
        >
          {periods.map((period, idx) => {
            const cardAngle = idx * angleStep + rotation;
            const isCardActive = idx === activeIndex;

            return (
              <CircleCard
                key={period.id}
                period={period}
                angle={cardAngle}
                radius={radius}
                isActive={isCardActive}
                onSelect={() => rotateToIndex(idx)}
                onOpenDetail={() => onOpenDetail(period)}
              />
            );
          })}
        </div>
      </div>

      {/* Top Center Period Indicator Tag */}
      <div className="absolute top-3 sm:top-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
        <div className="px-3.5 py-1 rounded-full bg-white/95 border-2 border-slate-900 shadow-md text-[11px] font-black text-slate-900 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e5a93a] border border-slate-900" />
          <span className="text-[#105e7b] font-black">{activePeriod.period}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-900 uppercase tracking-wide truncate max-w-[200px] sm:max-w-none">
            {activePeriod.title}
          </span>
        </div>
      </div>

      {/* Floating Left / Right Navigation Controls */}
      <div className="absolute inset-y-0 inset-x-3 sm:inset-x-6 flex items-center justify-between pointer-events-none z-20">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handlePrev();
          }}
          className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#105e7b] text-slate-900 hover:text-white border-2 border-slate-900 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer group"
          title="Período Anterior (Seta Esquerda)"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="p-2.5 sm:p-3 rounded-full bg-white hover:bg-[#105e7b] text-slate-900 hover:text-white border-2 border-slate-900 shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 pointer-events-auto cursor-pointer group"
          title="Próximo Período (Seta Direita)"
        >
          <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Bottom Floating Control Bar (Clean clearance from Windows taskbar) */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Period dots */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/90 border-2 border-slate-900 shadow-xs">
          {periods.map((p, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={p.id}
                onClick={() => rotateToIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isCurrent
                    ? 'w-6 h-2 bg-[#105e7b]'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-500'
                }`}
                title={`${p.period}: ${p.title}`}
              />
            );
          })}
        </div>

        {/* Quick Actions (Autoplay, Reset, Detail) */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playCardTick();
              setIsAutoPlaying(!isAutoPlaying);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border-2 border-slate-900 transition-all cursor-pointer ${
              isAutoPlaying
                ? 'bg-[#e5a93a] text-slate-950 shadow-xs'
                : 'bg-white text-slate-800 hover:bg-slate-100 shadow-xs'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isAutoPlaying ? 'Pausar Tour' : 'Giro Automático'}</span>
          </button>

          <button
            onClick={() => rotateToIndex(0)}
            className="p-1 rounded-full bg-white text-slate-700 hover:text-slate-950 border-2 border-slate-900 hover:bg-slate-100 shadow-xs transition-colors cursor-pointer"
            title="Voltar ao Início (1983)"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              soundFx.playCardFlip();
              onOpenDetail(activePeriod);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#105e7b] hover:bg-[#187fa1] text-white text-[11px] font-black border-2 border-slate-900 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#e5a93a]" />
            <span>Ver Marcos & Fotos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
