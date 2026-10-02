import { useState, useCallback, useEffect } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from './types/timeline';
import { timelinePeriods } from './data/timelineData';
import { Header, type OpeningPhase } from './components/Header';
import { ContinuousTimeline } from './components/ContinuousTimeline/ContinuousTimeline';
import { HistoricalDashboard } from './components/Dashboard/HistoricalDashboard';
import { PhotoViewerModal } from './components/DetailModal/PhotoViewerModal';
import { AchievementsModal } from './components/GameBoard/AchievementsModal';

export function App() {
  const [currentView, setCurrentView] = useState<'timeline' | 'dashboard'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (hash === '#dashboard' || search.get('view') === 'dashboard') {
        return 'dashboard';
      }
    }
    return 'timeline';
  });
  const [activePeriodIndex, setActivePeriodIndex] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MilestonePhoto | null>(null);
  const [selectedPhotoPeriod, setSelectedPhotoPeriod] = useState<HistoricalPeriod | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isFanIdle, setIsFanIdle] = useState<boolean>(true);
  const [isLogoVisible, setIsLogoVisible] = useState<boolean>(false);
  const [isPreAnimating, setIsPreAnimating] = useState<boolean>(true);
  const [isLogoInCenterScreen, setIsLogoInCenterScreen] = useState<boolean>(true);
  const [hasIntroCompleted, setHasIntroCompleted] = useState<boolean>(false);
  const [timelineResetTrigger, setTimelineResetTrigger] = useState<number>(0);
  const [timelineFocusTrigger, setTimelineFocusTrigger] = useState<{ index: number; timestamp: number } | null>(null);
  const [dashboardInitialSlide, setDashboardInitialSlide] = useState<number | undefined>(undefined);

  // Opening animation stages before the first stop
  const [openingPhase, setOpeningPhase] = useState<OpeningPhase>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const search = new URLSearchParams(window.location.search);
      if (hash === '#dashboard' || search.get('view') === 'dashboard') {
        return 'first_stop';
      }
    }
    return 'bg_only';
  });

  // Fullscreen automático ao entrar no site (com fallback para primeiro clique/tecla caso o navegador bloqueie chamada direta)
  useEffect(() => {
    const triggerFullscreen = () => {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    };

    triggerFullscreen();

    const onFirstUserAction = () => {
      triggerFullscreen();
      window.removeEventListener('click', onFirstUserAction);
      window.removeEventListener('keydown', onFirstUserAction);
      window.removeEventListener('touchstart', onFirstUserAction);
      window.removeEventListener('pointerdown', onFirstUserAction);
    };

    window.addEventListener('click', onFirstUserAction, { passive: true });
    window.addEventListener('keydown', onFirstUserAction, { passive: true });
    window.addEventListener('touchstart', onFirstUserAction, { passive: true });
    window.addEventListener('pointerdown', onFirstUserAction, { passive: true });

    return () => {
      window.removeEventListener('click', onFirstUserAction);
      window.removeEventListener('keydown', onFirstUserAction);
      window.removeEventListener('touchstart', onFirstUserAction);
      window.removeEventListener('pointerdown', onFirstUserAction);
    };
  }, []);

  // Orchestrate Opening Animation Sequence
  useEffect(() => {
    if (hasIntroCompleted || currentView === 'dashboard') {
      if (openingPhase !== 'first_stop') {
        setOpeningPhase('first_stop');
      }
      return;
    }

    if (openingPhase === 'bg_only') {
      // 1. Tela inicial aparece com a imagem de fundo sem o bg amarelo por 2 segundos
      const timer = setTimeout(() => {
        setOpeningPhase('yellow_fade');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (openingPhase === 'yellow_fade') {
      // 2. Fundo amarelo e logotipo surgem simultaneamente no centro
      const timer = setTimeout(() => {
        setOpeningPhase('logo_hold');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (openingPhase === 'logo_hold') {
      // 3. Logotipo fica visível no centro por 2 segundos
      const timer = setTimeout(() => {
        setOpeningPhase('logo_fade_out');
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (openingPhase === 'logo_fade_out') {
      // 4. Logotipo desaparece gradualmente no centro (1.2s de transição)
      const timer = setTimeout(() => {
        setOpeningPhase('quote_typing');
      }, 1200);
      return () => clearTimeout(timer);
    }

    // 5. quote_typing é orquestrado pelo typewriter em Header.tsx, que chama onQuoteTypingComplete

    if (openingPhase === 'logo_top_appear') {
      // 6. Logotipo surge grande no topo da tela (1.8s de transição antes de liberar o botão de continuar)
      const timer = setTimeout(() => {
        setOpeningPhase('first_stop');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [openingPhase, hasIntroCompleted, currentView]);

  useEffect(() => {
    if (timelineResetTrigger > 0) {
      setOpeningPhase('bg_only');
    }
  }, [timelineResetTrigger]);

  const skipOpeningPhase = useCallback(() => {
    setOpeningPhase('first_stop');
  }, []);

  // Track visited periods for achievements and timeline progress
  const [visitedIndices, setVisitedIndices] = useState<Set<number>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dgrh_visited_periods');
      if (stored) {
        try {
          return new Set(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      }
    }
    return new Set();
  });

  // Periods state (allows local photo additions/replacements)
  const [periods] = useState<HistoricalPeriod[]>(() => {
    if (typeof window !== 'undefined') {
      const storedPhotos = localStorage.getItem('dgrh_custom_photos');
      if (storedPhotos) {
        try {
          const photoMap: Record<string, string> = JSON.parse(storedPhotos);
          return timelinePeriods.map((p) => ({
            ...p,
            photos: p.photos.map((ph) => ({
              ...ph,
              url: photoMap[`${p.id}_${ph.id}`] || ph.url,
            })),
          }));
        } catch {
          // fallback
        }
      }
    }
    return timelinePeriods;
  });

  // Mark period as visited whenever it is selected
  const handleSelectPeriod = useCallback((index: number | null) => {
    setActivePeriodIndex(index);
    if (index !== null) {
      setVisitedIndices((prev) => {
        const updated = new Set(prev).add(index);
        if (typeof window !== 'undefined') {
          localStorage.setItem('dgrh_visited_periods', JSON.stringify(Array.from(updated)));
        }
        return updated;
      });
    }
  }, []);

  // Open standalone photo lightbox modal (shows strictly the photo and its archival info)
  const handleOpenPhoto = useCallback((photo: MilestonePhoto, period: HistoricalPeriod) => {
    setSelectedPhoto(photo);
    setSelectedPhotoPeriod(period);
    handleSelectPeriod(period.index);
  }, [handleSelectPeriod]);

  // Navigate to opening logo paused state
  const handleNavigateToOpeningLogo = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('slide');
      url.searchParams.set('view', 'timeline');
      window.history.replaceState(null, '', url.toString());
    }
    setCurrentView('timeline');
    setActivePeriodIndex(null);
    setHasIntroCompleted(false);
    setIsFanIdle(true);
    setIsLogoVisible(true);
    setIsLogoInCenterScreen(true);
    setIsPreAnimating(false);
    setDashboardInitialSlide(undefined);
    setOpeningPhase('bg_only');
    setTimelineResetTrigger((prev) => prev + 1);
  }, []);

  // Open Historical Dashboard
  const handleOpenDashboard = useCallback((slideIndex?: number) => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'dashboard');
      if (slideIndex !== undefined) {
        url.searchParams.set('slide', String(slideIndex + 1));
      } else {
        url.searchParams.set('slide', 'index');
      }
      window.history.replaceState(null, '', url.toString());
    }
    setDashboardInitialSlide(slideIndex);
    setCurrentView('dashboard');
  }, []);

  // Return to Timeline from Dashboard: always focus and select the LAST card (2022 - 2025)
  const handleBackToTimeline = useCallback(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('slide');
      url.searchParams.set('view', 'timeline');
      window.history.replaceState(null, '', url.toString());
    }
    const lastIndex = periods.length - 1;
    setHasIntroCompleted(true);
    setIsFanIdle(false);
    setIsPreAnimating(false);
    setIsLogoVisible(true);
    setIsLogoInCenterScreen(false);
    handleSelectPeriod(lastIndex);
    setCurrentView('timeline');
    setTimelineFocusTrigger({ index: lastIndex, timestamp: Date.now() });
  }, [handleSelectPeriod, periods.length]);

  const isYellowBgVisible =
    hasIntroCompleted || currentView === 'dashboard' || openingPhase !== 'bg_only';

  return (
    <div className="min-h-screen w-full bg-[#cbd5e1] text-slate-950 flex flex-col relative font-body overflow-x-hidden">
      {/* Layer 1: Background Mural Photo (always present, pure monochrome photo without yellow at first) */}
      <div
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: "url('/bg_60_anos.jpg')",
        }}
      />

      {/* Layer 2: Yellow Theme Background Color + Texture blend */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ease-in-out ${
          isYellowBgVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="absolute inset-0 bg-[#e5a93a]" />
        <div
          className="absolute inset-0 mix-blend-multiply opacity-25 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/bg_60_anos.jpg')",
          }}
        />
      </div>

      {/* Top Main Navigation Header (Maintains DGRH logo and page selector on all views) */}
      <Header
        isCentered={!hasIntroCompleted && isFanIdle && currentView === 'timeline'}
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'timeline') {
            if (currentView === 'dashboard') {
              handleBackToTimeline();
            } else {
              setCurrentView('timeline');
            }
          } else {
            handleOpenDashboard();
          }
        }}
        logoVisible={hasIntroCompleted || isLogoVisible || currentView === 'dashboard' || !isFanIdle}
        isPreAnimating={!hasIntroCompleted && isPreAnimating && currentView === 'timeline'}
        isLogoInCenterScreen={!hasIntroCompleted && isLogoInCenterScreen && isFanIdle && currentView === 'timeline'}
        openingPhase={openingPhase}
        onQuoteTypingComplete={() => setOpeningPhase('logo_top_appear')}
      />

      {/* Main View Area: Continuous Timeline or Historical Dashboard */}
      <main className="w-full relative z-10 flex-1 flex flex-col">
        <div className={`w-full flex-1 flex flex-col pt-14 ${currentView === 'timeline' ? 'block' : 'hidden'}`}>
          <ContinuousTimeline
            periods={periods}
            activeIndex={activePeriodIndex}
            onSelectPeriod={handleSelectPeriod}
            onOpenPhoto={handleOpenPhoto}
            onFanIdleChange={setIsFanIdle}
            onLogoVisibilityChange={setIsLogoVisible}
            onPreAnimatingChange={setIsPreAnimating}
            onLogoPositionChange={setIsLogoInCenterScreen}
            initialIntroDone={hasIntroCompleted}
            onIntroDoneChange={setHasIntroCompleted}
            resetTrigger={timelineResetTrigger}
            onOpenDashboard={handleOpenDashboard}
            isActive={currentView === 'timeline'}
            focusTrigger={timelineFocusTrigger}
            openingPhase={openingPhase}
            onSkipOpening={skipOpeningPhase}
          />
        </div>
        {currentView === 'dashboard' && (
          <div className="w-full min-h-screen pt-16 sm:pt-20 pb-2 sm:pb-3 flex flex-col justify-center">
            <HistoricalDashboard
              initialSlideIndex={dashboardInitialSlide}
              onBackToTimeline={handleBackToTimeline}
              onNavigateToOpeningLogo={handleNavigateToOpeningLogo}
            />
          </div>
        )}
      </main>

      {/* Standalone Fullscreen Photo Modal (Shows ONLY image, caption and credits) */}
      <PhotoViewerModal
        photo={selectedPhoto}
        period={selectedPhotoPeriod}
        isOpen={selectedPhoto !== null}
        onClose={() => {
          setSelectedPhoto(null);
          setSelectedPhotoPeriod(null);
        }}
        onSelectPhoto={(ph) => setSelectedPhoto(ph)}
      />

      {/* Badges / Achievements Modal */}
      <AchievementsModal
        periods={periods}
        visitedIndices={visitedIndices}
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        onSelectPeriod={(idx) => {
          handleSelectPeriod(idx);
        }}
      />
    </div>
  );
}

export default App;
