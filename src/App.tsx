import { useState } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from './types/timeline';
import { timelinePeriods } from './data/timelineData';
import { Header } from './components/Header';
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
  const handleSelectPeriod = (index: number | null) => {
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
  };

  // Open standalone photo lightbox modal (shows strictly the photo and its archival info)
  const handleOpenPhoto = (photo: MilestonePhoto, period: HistoricalPeriod) => {
    setSelectedPhoto(photo);
    setSelectedPhotoPeriod(period);
    handleSelectPeriod(period.index);
  };

  return (
    <div className="min-h-screen w-full bg-[#e5a93a] text-slate-950 flex flex-col relative font-body overflow-x-hidden">
      {/* Background Texture Overlay with Multiply Blend Mode over yellow background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 mix-blend-multiply opacity-25 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: "url('/bg_60_anos.jpg')",
        }}
      />

      {/* Top Main Navigation Header (Maintains DGRH logo and page selector on all views) */}
      <Header
        isCentered={!hasIntroCompleted && isFanIdle && currentView === 'timeline'}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        logoVisible={hasIntroCompleted || isLogoVisible || currentView === 'dashboard' || !isFanIdle}
        isPreAnimating={!hasIntroCompleted && isPreAnimating && currentView === 'timeline'}
        isLogoInCenterScreen={!hasIntroCompleted && isLogoInCenterScreen && isFanIdle && currentView === 'timeline'}
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
            onOpenDashboard={() => {
              if (typeof window !== 'undefined') {
                const url = new URL(window.location.href);
                url.searchParams.set('view', 'dashboard');
                url.searchParams.set('slide', 'index');
                window.history.replaceState(null, '', url.toString());
              }
              setCurrentView('dashboard');
            }}
          />
        </div>
        {currentView === 'dashboard' && (
          <div className="w-full min-h-screen pt-20 sm:pt-24 pb-4 flex flex-col justify-center">
            <HistoricalDashboard
              onBackToTimeline={() => {
                if (typeof window !== 'undefined') {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('slide');
                  url.searchParams.set('view', 'timeline');
                  window.history.replaceState(null, '', url.toString());
                }
                setCurrentView('timeline');
              }}
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
