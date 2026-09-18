import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { TimelineCard, pureBgColors } from './TimelineCard';
import { soundFx } from '../../utils/soundEffects';
import { 
  ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Sparkles, Volume2, VolumeX, BarChart3 
} from 'lucide-react';
import gsap from 'gsap';

interface ContinuousTimelineProps {
  periods: HistoricalPeriod[];
  activeIndex: number | null;
  onSelectPeriod: (index: number | null) => void;
  onOpenPhoto: (photo: MilestonePhoto, period: HistoricalPeriod) => void;
  onFanIdleChange?: (isIdle: boolean) => void;
  onOpenDashboard?: () => void;
  onLogoVisibilityChange?: (visible: boolean) => void;
  onPreAnimatingChange?: (isPreAnimating: boolean) => void;
  onLogoPositionChange?: (inCenterScreen: boolean) => void;
}

export const ContinuousTimeline: React.FC<ContinuousTimelineProps> = ({
  periods,
  activeIndex,
  onSelectPeriod,
  onOpenPhoto,
  onFanIdleChange,
  onOpenDashboard,
  onLogoVisibilityChange,
  onPreAnimatingChange,
  onLogoPositionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPeriods = periods.length;

  // Animation position state (floating point for smooth dragging & tweening)
  const [currentPosition, setCurrentPosition] = useState<number>(activeIndex ?? 0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [cardSpacing, setCardSpacing] = useState(320);

  // Intro animation lifecycle:
  // 'pre_animating': entrance sequence (logo -> deck rises from below -> fan opens -> button appears)
  // 'idle_fan': resting fan state with button visible, waiting for user click
  // 'animating': dealing out cards into horizontal timeline
  // 'done': in continuous timeline mode
  const [introStatus, setIntroStatus] = useState<'pre_animating' | 'idle_fan' | 'animating' | 'done'>('pre_animating');
  const [preAnimProgress, setPreAnimProgress] = useState<number>(0);
  const [introProgress, setIntroProgress] = useState<number>(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const isIntroActive = introStatus !== 'done';
  const isFanIdle = introStatus === 'idle_fan' || introStatus === 'pre_animating';
  const isAnimating = introStatus === 'animating';
  const isPreAnimating = introStatus === 'pre_animating';

  // Notify parent component about fan idle status
  useEffect(() => {
    onFanIdleChange?.(isFanIdle);
  }, [isFanIdle, onFanIdleChange]);

  useEffect(() => {
    onPreAnimatingChange?.(isPreAnimating);
  }, [isPreAnimating, onPreAnimatingChange]);

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
  const preAnimTweenRef = useRef<gsap.core.Tween | null>(null);

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

  // Entrance Pre-Animation Sequence:
  // 1. Logo appears gradually in the center of the screen with bottom-up mask reveal (~4s total duration)
  // 2. At p >= 0.29, cards surge from below pushing the logo up to the top; cards rise vertically into the center deck
  // 3. Stacked deck pauses briefly, then fans out into an extra-tight curved fan
  // 4. Exactly 1s after fan opens, the "Iniciar apresentação" button appears slowly and gracefully
  const startPreAnimation = useCallback(() => {
    if (preAnimTweenRef.current) preAnimTweenRef.current.kill();
    if (introTweenRef.current) introTweenRef.current.kill();

    setIntroStatus('pre_animating');
    setPreAnimProgress(0);
    setHoveredCardIndex(null);
    onLogoVisibilityChange?.(true);
    onLogoPositionChange?.(true); // Logo starts in the exact center of the screen

    const obj = { p: 0 };
    const cardsTicked = new Set<number>();
    let tickFanPlayed = false;
    let logoPushedUp = false;

    preAnimTweenRef.current = gsap.to(obj, {
      p: 1,
      duration: 9.6,
      ease: 'none',
      onUpdate: () => {
        setPreAnimProgress(obj.p);

        // When cards begin rising at p >= 0.29, smoothly push the logo up to the top
        if (obj.p >= 0.29 && !logoPushedUp) {
          logoPushedUp = true;
          onLogoPositionChange?.(false);
        }

        // Sound cadence as cards snap individually into the central deck
        for (let i = 0; i <= 12; i++) {
          const cardArrival = 0.29 + (i / 12) * 0.22 + 0.09;
          if (obj.p >= cardArrival && !cardsTicked.has(i)) {
            cardsTicked.add(i);
            soundFx.playCardTick();
          }
        }

        if (obj.p >= 0.67 && !tickFanPlayed) {
          tickFanPlayed = true;
          soundFx.playCardTick();
        }
      },
      onComplete: () => {
        preAnimTweenRef.current = null;
        setPreAnimProgress(1);
        setIntroStatus('idle_fan');
        onLogoVisibilityChange?.(true);
        onLogoPositionChange?.(false);
        soundFx.playCardTick();
      },
    });

    return () => {
      if (preAnimTweenRef.current) preAnimTweenRef.current.kill();
    };
  }, [onLogoPositionChange, onLogoVisibilityChange]);

  // Run pre-animation on mount
  useEffect(() => {
    const cleanup = startPreAnimation();
    return () => {
      cleanup?.();
    };
  }, [startPreAnimation]);

  // Skip pre-animation immediately to resting fan state
  const skipPreAnim = useCallback(() => {
    if (preAnimTweenRef.current) preAnimTweenRef.current.kill();
    preAnimTweenRef.current = null;
    onLogoVisibilityChange?.(true);
    onLogoPositionChange?.(false);
    setHoveredCardIndex(null);
    setPreAnimProgress(1);
    setIntroStatus('idle_fan');
    soundFx.playCardTick();
  }, [onLogoPositionChange, onLogoVisibilityChange]);

  // Execute Opening Animation: sequentially deals cards out one by one from oldest to newest from the bottom of the deck
  const executeOpeningAnimation = useCallback(() => {
    if (introStatus === 'animating') return;

    // Strictly guarantee all cards are unselected before and during the opening
    setHoveredCardIndex(null);
    prevActiveIndexRef.current = null;
    currentPositionRef.current = 0;
    onSelectPeriod(null);
    setCurrentPosition(0);
    setIntroStatus('animating');
    setIntroProgress(0);

    if (introTweenRef.current) introTweenRef.current.kill();
    soundFx.playCardTick();

    const obj = { p: 0 };
    const dealTicked = new Set<number>();

    introTweenRef.current = gsap.to(obj, {
      p: 1,
      duration: 3.0,
      ease: 'none',
      onUpdate: () => {
        setIntroProgress(obj.p);

        // Sound tick as each card arrives at its slot in the horizontal timeline
        for (let i = 0; i < totalPeriods; i++) {
          const arrival = (i / Math.max(1, totalPeriods - 1)) * 0.58 + 0.36;
          if (obj.p >= arrival && !dealTicked.has(i)) {
            dealTicked.add(i);
            soundFx.playCardTick();
          }
        }
      },
      onComplete: () => {
        introTweenRef.current = null;
        setIntroProgress(1);
        setIntroStatus('done');
        soundFx.playCardTick();
        // Select the first card (1983-1986) by default
        slideToIndex(0);
      },
    });
  }, [introStatus, onSelectPeriod, slideToIndex, totalPeriods]);

  // Skip Opening Animation: immediately complete and select the first card
  const skipIntro = useCallback(() => {
    if (introTweenRef.current) introTweenRef.current.kill();
    introTweenRef.current = null;
    setHoveredCardIndex(null);
    setIntroProgress(1);
    setIntroStatus('done');
    soundFx.playCardTick();
    // Select the first card by default
    slideToIndex(0);
  }, [slideToIndex]);

  // Reset to initial 3D fan view (re-runs the entrance sequence)
  const handleReplayIntro = useCallback(() => {
    if (introTweenRef.current) introTweenRef.current.kill();
    if (preAnimTweenRef.current) preAnimTweenRef.current.kill();
    if (tweenRef.current) tweenRef.current.kill();
    setHoveredCardIndex(null);
    prevActiveIndexRef.current = null;
    currentPositionRef.current = 0;
    onSelectPeriod(null);
    setCurrentPosition(0);
    setIntroProgress(0);
    startPreAnimation();
    soundFx.playCardTick();
  }, [onSelectPeriod, startPreAnimation]);

  // Cleanup tweens on unmount
  useEffect(() => {
    return () => {
      if (introTweenRef.current) introTweenRef.current.kill();
      if (preAnimTweenRef.current) preAnimTweenRef.current.kill();
      if (tweenRef.current) tweenRef.current.kill();
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
      if (isPreAnimating) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape' || e.key === 'ArrowRight') {
          e.preventDefault();
          skipPreAnim();
        }
        return;
      }

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

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        const current = activeIndex ?? Math.round(currentPositionRef.current);
        if (current >= totalPeriods - 1) {
          e.preventDefault();
          soundFx.playCardTick();
          onOpenDashboard?.();
        } else {
          handleNext();
        }
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
  }, [isPreAnimating, isFanIdle, isAnimating, skipPreAnim, executeOpeningAnimation, skipIntro, handlePrev, handleNext, activeIndex, onOpenPhoto, periods, currentPosition, onSelectPeriod, onOpenDashboard, totalPeriods]);

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
      className="relative w-full h-[calc(100vh-3.5rem)] overflow-hidden bg-transparent text-slate-900 flex flex-col justify-between select-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* ================= 1. INTRO 3D FAN OVERLAY (Cards + Start Button Only) ================= */}
      {(introStatus === 'idle_fan' || introStatus === 'pre_animating') && (
        <div
          className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-end pb-[136px] sm:pb-[152px] md:pb-[168px] transition-all duration-500"
          style={{
            opacity: introStatus === 'idle_fan' ? 1 : Math.max(0, (preAnimProgress - 0.90) / 0.10),
            transform: `translateY(${introStatus === 'idle_fan' ? 0 : (1 - Math.max(0, (preAnimProgress - 0.90) / 0.10)) * 18}px)`,
            pointerEvents: introStatus === 'idle_fan' || preAnimProgress >= 0.95 ? 'auto' : 'none',
          }}
        >
          <div className="pointer-events-auto">
            <button
              onClick={executeOpeningAnimation}
              className="flex items-center gap-3 px-8 py-3.5 rounded-full bg-slate-950 hover:bg-slate-900 text-white font-black text-sm sm:text-base tracking-wide shadow-2xl border-2 border-white transition-all transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/10 group"
              title="Iniciar apresentação"
            >
              <Play className="w-5 h-5 fill-[#e5a93a] text-[#e5a93a] group-hover:scale-110 transition-transform" />
              <span>Iniciar apresentação</span>
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
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
          onClick={() => {
            if (introStatus === 'pre_animating') {
              skipPreAnim();
            } else if (introStatus === 'idle_fan') {
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

            // Calculations during Intro Animation / Pre-animation / Idle fan
            let currentX = targetX;
            let currentY = 0;
            let currentRot = 0;
            let currentRotX = 0;
            let currentScale = targetScale;
            let currentOpacity = targetOpacity;
            let currentZIndex = targetZIndex;

            if (isIntroActive) {
              // 3D Fan Stack initial values (13 items total: 12 cards + cover, centered symmetrically at 6.0)
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
              const angleStep = isMobile ? 1.5 : 2.0; // Tighter fan tilt
              const spreadStep = isMobile ? 6.5 : 9.0;  // Tighter horizontal spread
              const arcStep = isMobile ? 1.2 : 1.6;   // Gentle natural arc
              const arcBase = isMobile ? 3 : 4;

              const fanDelta = idx - 6.0; // Symmetrical around 6.0 for 13 items (0..12)
              const finalFanAngle = fanDelta * angleStep;
              const finalFanX = fanDelta * spreadStep;
              const finalFanY = Math.pow(Math.abs(fanDelta), 1.35) * arcStep - arcBase;
              const fanScale = isMobile ? 0.64 : 0.76;
              const fanZ = 30 + idx;

              if (introStatus === 'pre_animating') {
                const p = preAnimProgress;
                // Staggered vertical arrival: 13 items (0..12). Card 0 starts at 0.29, Card 12 starts at 0.51.
                const cardStart = 0.29 + (idx / 12) * 0.22;
                const cardDur = 0.09;

                if (p < cardStart) {
                  // Phase 1: Waiting below screen, vertical/portrait, hidden
                  currentY = 750;
                  currentX = 0;
                  currentRot = 0;
                  currentRotX = 14;
                  currentScale = fanScale * 0.92;
                  currentOpacity = 0;
                  currentZIndex = fanZ;
                } else if (p < cardStart + cardDur) {
                  // Phase 2: Rising vertically into the deck cleanly without cutting the previous card
                  const rawRise = (p - cardStart) / cardDur;
                  const riseP = 1 - Math.pow(1 - rawRise, 3);
                  currentY = 750 * (1 - riseP) + (idx - 6) * -0.5;
                  currentX = 0;
                  currentRot = 0;
                  currentRotX = 14 * (1 - riseP);
                  currentScale = (fanScale * 0.92) + (fanScale * 0.08) * riseP;
                  currentOpacity = Math.min(1, rawRise * 2.5);
                  currentZIndex = fanZ;
                } else if (p < 0.67) {
                  // Phase 3: Resting in central stacked deck ("monte no centro")
                  currentY = (idx - 6) * -0.5;
                  currentX = 0;
                  currentRot = 0;
                  currentRotX = 0;
                  currentScale = fanScale;
                  currentOpacity = 1;
                  currentZIndex = fanZ;
                } else {
                  // Phase 4: Deck opens into tight curved fan
                  const fanRaw = Math.min(1, (p - 0.67) / (0.79 - 0.67));
                  const fanP = 1 - Math.pow(1 - fanRaw, 3);
                  currentX = finalFanX * fanP;
                  currentY = finalFanY * fanP + (1 - fanP) * ((idx - 6) * -0.5);
                  currentRot = finalFanAngle * fanP;
                  currentRotX = 0;
                  currentScale = fanScale;
                  currentOpacity = 1;
                  currentZIndex = fanZ;
                }
              } else if (introStatus === 'animating') {
                // DEAL ANIMATION: cards dealt one by one, from oldest (idx 0) to newest (idx 11) from bottom of deck
                const dealStart = (idx / 11) * 0.58;
                const dealDur = 0.36;

                if (introProgress < dealStart) {
                  // Card is still waiting in the fan
                  currentX = finalFanX;
                  currentY = finalFanY;
                  currentRot = finalFanAngle;
                  currentRotX = 0;
                  currentScale = fanScale;
                  currentOpacity = 1;
                  currentZIndex = fanZ;
                } else if (introProgress < dealStart + dealDur) {
                  // Card is dealing out to its position in the horizontal timeline
                  const rawP = (introProgress - dealStart) / dealDur;
                  const p = 1 - Math.pow(1 - rawP, 3);
                  currentX = finalFanX + (targetX - finalFanX) * p;
                  currentY = finalFanY + (0 - finalFanY) * p;
                  currentRot = finalFanAngle * (1 - p);
                  currentRotX = 0;
                  currentScale = fanScale + (targetScale - fanScale) * p;
                  currentOpacity = 1;
                  currentZIndex = Math.round(fanZ + (targetZIndex - fanZ) * p);
                } else {
                  // Card has arrived at its timeline slot
                  currentX = targetX;
                  currentY = 0;
                  currentRot = 0;
                  currentRotX = 0;
                  currentScale = targetScale;
                  currentOpacity = 1;
                  currentZIndex = targetZIndex;
                }
              } else {
                // idle_fan: apply interactive hover offsets so cards "abrem um pouquinho"
                let hoverOffsetY = 0;
                let hoverOffsetX = 0;
                let hoverOffsetRot = 0;
                let hoverScaleMult = 1;
                let hoverZ = fanZ;

                if (hoveredCardIndex !== null) {
                  if (idx === hoveredCardIndex) {
                    hoverOffsetY = -34;
                    hoverScaleMult = 1.06;
                    hoverZ = 95;
                  } else if (idx < hoveredCardIndex) {
                    const dist = hoveredCardIndex - idx;
                    hoverOffsetX = -Math.max(4, 16 - dist * 2);
                    hoverOffsetRot = -1.5;
                  } else {
                    const dist = idx - hoveredCardIndex;
                    hoverOffsetX = Math.max(4, 16 - dist * 2);
                    hoverOffsetRot = 1.5;
                  }
                }

                currentX = finalFanX + hoverOffsetX;
                currentY = finalFanY + hoverOffsetY;
                currentRot = finalFanAngle + hoverOffsetRot;
                currentRotX = 0;
                currentScale = fanScale * hoverScaleMult;
                currentOpacity = 1;
                currentZIndex = hoverZ;
              }
            } else {
              // Limit rendering of distant cards outside intro for high performance
              if (absOffset > 4.5) return null;
            }

            return (
              <div
                key={period.id}
                className={`absolute pointer-events-auto ${
                  introStatus === 'idle_fan' ? 'cursor-pointer' : ''
                }`}
                onMouseEnter={() => {
                  if (introStatus === 'idle_fan') {
                    setHoveredCardIndex(idx);
                  }
                }}
                onMouseLeave={() => {
                  if (introStatus === 'idle_fan') {
                    setHoveredCardIndex((prev) => (prev === idx ? null : prev));
                  }
                }}
                onClick={(e) => {
                  if (introStatus === 'pre_animating') {
                    e.stopPropagation();
                    skipPreAnim();
                  } else if (introStatus === 'idle_fan') {
                    e.stopPropagation();
                    executeOpeningAnimation();
                  }
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0) scale(${currentScale}) rotate(${currentRot}deg) rotateX(${currentRotX}deg)`,
                  transformOrigin: 'center center',
                  opacity: currentOpacity,
                  zIndex: currentZIndex,
                  transition: introStatus === 'idle_fan' ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease' : 'none',
                  willChange: 'transform, opacity',
                  backfaceVisibility: 'hidden',
                }}
              >
                <TimelineCard
                  period={period}
                  isActive={isCardActive}
                  onSelect={() => {
                    if (introStatus === 'pre_animating') {
                      skipPreAnim();
                    } else if (introStatus === 'idle_fan') {
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

          {/* ================= 2.1. CAPA DOS CARDS (Posicionada após o último card no leque) ================= */}
          {isIntroActive && (
            (() => {
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
              const angleStep = isMobile ? 1.5 : 2.0; // Even tighter fan tilt
              const spreadStep = isMobile ? 6.5 : 9.0;  // Even tighter horizontal spread
              const arcStep = isMobile ? 1.2 : 1.6;   // Gentle natural arc
              const arcBase = isMobile ? 3 : 4;

              // Virtual index 12: comes right after card 11 (the last card)
              const fanDelta = 12 - 6.0; // +6.0
              const finalFanAngle = fanDelta * angleStep;
              const finalFanX = fanDelta * spreadStep;
              const finalFanY = Math.pow(Math.abs(fanDelta), 1.35) * arcStep - arcBase;
              const fanScale = isMobile ? 0.64 : 0.76;
              const coverZIndex = 55; // Sits on top of the last card & top of the deck

              let coverCurrentX = finalFanX;
              let coverCurrentY = finalFanY;
              let coverCurrentRot = finalFanAngle;
              let coverCurrentRotX = 0;
              let coverCurrentScale = fanScale;
              let coverCurrentZ = coverZIndex;
              let coverOpacity = 1;

              if (introStatus === 'pre_animating') {
                const p = preAnimProgress;
                // Capa is idx 12 (last card to rise and land on top of the central deck)
                const cardStart = 0.29 + (12 / 12) * 0.22; // 0.51
                const cardDur = 0.09;

                if (p < cardStart) {
                  // Phase 1: Waiting below screen, vertical/portrait, hidden
                  coverCurrentY = 750;
                  coverCurrentX = 0;
                  coverCurrentRot = 0;
                  coverCurrentRotX = 14;
                  coverCurrentScale = fanScale * 0.92;
                  coverOpacity = 0;
                } else if (p < cardStart + cardDur) {
                  // Phase 2: Cover rises vertically as top card of the deck cleanly
                  const riseRaw = (p - cardStart) / cardDur;
                  const riseP = 1 - Math.pow(1 - riseRaw, 3);
                  coverCurrentY = 750 * (1 - riseP) + (12 - 6) * -0.5;
                  coverCurrentX = 0;
                  coverCurrentRot = 0;
                  coverCurrentRotX = 14 * (1 - riseP);
                  coverCurrentScale = (fanScale * 0.92) + (fanScale * 0.08) * riseP;
                  coverOpacity = Math.min(1, riseRaw * 2.5);
                } else if (p < 0.67) {
                  // Phase 3: Hold top of deck in center
                  coverCurrentY = (12 - 6) * -0.5;
                  coverCurrentX = 0;
                  coverCurrentRot = 0;
                  coverCurrentRotX = 0;
                  coverCurrentScale = fanScale;
                  coverOpacity = 1;
                } else {
                  // Phase 4: Fans out to index 12
                  const fanRaw = Math.min(1, (p - 0.67) / (0.79 - 0.67));
                  const fanP = 1 - Math.pow(1 - fanRaw, 3);
                  coverCurrentX = finalFanX * fanP;
                  coverCurrentY = finalFanY * fanP + (1 - fanP) * ((12 - 6) * -0.5);
                  coverCurrentRot = finalFanAngle * fanP;
                  coverCurrentRotX = 0;
                  coverCurrentScale = fanScale;
                  coverOpacity = 1;
                }
              } else if (introStatus === 'animating') {
                // Smooth fade-out and slide as cards deal out from underneath
                coverOpacity = Math.max(0, 1 - introProgress * 2.4);
                const p = 1 - Math.pow(1 - Math.min(1, introProgress * 1.5), 3);
                coverCurrentX = finalFanX + p * 30;
                coverCurrentY = finalFanY - introProgress * 40;
                coverCurrentRot = finalFanAngle * (1 - introProgress * 0.4);
                coverCurrentRotX = 0;
                coverCurrentScale = fanScale + introProgress * 0.06;
              } else {
                // idle_fan: apply interactive hover offsets!
                let hoverOffsetY = 0;
                let hoverOffsetX = 0;
                let hoverOffsetRot = 0;
                let hoverScaleMult = 1;

                if (hoveredCardIndex !== null) {
                  if (hoveredCardIndex === 12) {
                    hoverOffsetY = -34;
                    hoverScaleMult = 1.06;
                    coverCurrentZ = 95;
                  } else {
                    // Capa is at index 12, so any card to its left parts to the left and Capa pushes right
                    hoverOffsetX = 12;
                    hoverOffsetRot = 1.5;
                  }
                }

                coverCurrentX = finalFanX + hoverOffsetX;
                coverCurrentY = finalFanY + hoverOffsetY;
                coverCurrentRot = finalFanAngle + hoverOffsetRot;
                coverCurrentScale = fanScale * hoverScaleMult;
              }

              if (coverOpacity <= 0) return null;

              return (
                <div
                  className={`absolute pointer-events-auto ${
                    introStatus === 'idle_fan' ? 'cursor-pointer' : ''
                  }`}
                  onMouseEnter={() => {
                    if (introStatus === 'idle_fan') {
                      setHoveredCardIndex(12);
                    }
                  }}
                  onMouseLeave={() => {
                    if (introStatus === 'idle_fan') {
                      setHoveredCardIndex((prev) => (prev === 12 ? null : prev));
                    }
                  }}
                  onClick={(e) => {
                    if (introStatus === 'pre_animating') {
                      e.stopPropagation();
                      skipPreAnim();
                    } else if (introStatus === 'idle_fan') {
                      executeOpeningAnimation();
                    }
                  }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate3d(calc(-50% + ${coverCurrentX}px), calc(-50% + ${coverCurrentY}px), 0) scale(${coverCurrentScale}) rotate(${coverCurrentRot}deg) rotateX(${coverCurrentRotX}deg)`,
                    transformOrigin: 'center center',
                    opacity: coverOpacity,
                    zIndex: coverCurrentZ,
                    transition: introStatus === 'idle_fan' ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease' : 'none',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                  }}
                >
                  <div className="relative w-[230px] sm:w-[260px] md:w-[280px] h-[390px] sm:h-[430px] md:h-[460px] lg:h-[480px] rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-2xl border-2.5 border-slate-950 bg-[#105e7b] text-white select-none ring-2 ring-white/60">
                    {/* Topo: Identificação e Título */}
                    <div className="text-center py-1 flex flex-col items-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-white/30 mb-1 shadow-xs">
                        DGRH • UNICAMP
                      </span>
                      <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                        60 Anos Unicamp
                      </div>
                      <span className="text-[11px] text-white/85 font-bold mt-0.5">
                        A Gestão de Pessoas (1983 - 2026)
                      </span>
                    </div>

                    {/* Centro: Foto do Prédio da DGRH */}
                    <div className="relative w-full aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden border-2 border-white/30 bg-slate-950 shadow-md my-auto group shrink-0">
                      <img
                        src="/capa.jpg"
                        alt="Prédio da DGRH - Reitoria IV"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 text-left">
                        <span className="text-[11px] font-bold text-white drop-shadow-md">
                          Prédio da Reitoria IV
                        </span>
                      </div>
                    </div>

                    {/* Rodapé: Selo Comemorativo */}
                    <div className="pt-2 border-t border-white/20 flex items-center justify-between text-left gap-2 shrink-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-[#e5a93a] text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border border-slate-900 shrink-0">
                          ★
                        </span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs sm:text-sm font-black text-white tracking-tight truncate leading-snug">
                            Linha do Tempo
                          </h3>
                          <span className="text-[10px] text-white/80 font-bold block truncate mt-0.5">
                            Memória & Transformação
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#e5a93a] text-slate-950 font-black text-[10px] tracking-wide shadow-xs border border-white/30">
                        CAPA
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
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
              onClick={() => {
                const current = activeIndex ?? Math.round(currentPositionRef.current);
                if (current >= totalPeriods - 1) {
                  soundFx.playCardTick();
                  onOpenDashboard?.();
                } else {
                  handleNext();
                }
              }}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white hover:bg-slate-50 text-slate-950 border-2 border-slate-950 shadow-2xl flex items-center justify-center transition-all cursor-pointer group"
              title={((activeIndex !== null && activeIndex >= totalPeriods - 1) || (activeIndex === null && currentPosition >= totalPeriods - 1)) ? "Avançar para o Índice de Gráficos" : "Próximo período"}
            >
              <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </>
        )}
      </div>

      {/* ================= 3. COMPACT BOTTOM TIMELINE RULER & CONTROLS ================= */}
      <div 
        className={`relative z-20 pb-8 sm:pb-12 px-3 max-w-4xl mx-auto w-full flex flex-col items-center gap-2 transition-all duration-700 ${isIntroActive ? 'pointer-events-none' : ''}`}
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

          {/* Indicadores & Gráficos Link pill */}
          {onOpenDashboard && (
            <button
              onClick={() => {
                soundFx.playCardTick();
                onOpenDashboard();
              }}
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#105e7b] hover:bg-[#187fa1] text-white text-[11px] font-black border border-slate-950 shadow-xs transition-all cursor-pointer"
              title="Apresentação de Indicadores e Estatísticas dos 60 Anos"
            >
              <BarChart3 className="w-3.5 h-3.5 text-[#e5a93a]" />
              <span>Indicadores & Gráficos</span>
            </button>
          )}

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
