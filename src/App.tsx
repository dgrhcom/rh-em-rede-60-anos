import { useState } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from './types/timeline';
import { timelinePeriods } from './data/timelineData';
import { Header } from './components/Header';
import { ContinuousTimeline } from './components/ContinuousTimeline/ContinuousTimeline';
import { HistoricalDashboard } from './components/Dashboard/HistoricalDashboard';
import { PhotoViewerModal } from './components/DetailModal/PhotoViewerModal';
import { AchievementsModal } from './components/GameBoard/AchievementsModal';

export function App() {
  const [currentView, setCurrentView] = useState<'timeline' | 'dashboard'>('timeline');
  const [activePeriodIndex, setActivePeriodIndex] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<MilestonePhoto | null>(null);
  const [selectedPhotoPeriod, setSelectedPhotoPeriod] = useState<HistoricalPeriod | null>(null);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isFanIdle, setIsFanIdle] = useState<boolean>(true);

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
        isCentered={isFanIdle && currentView === 'timeline'}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Main View Area: Continuous Timeline or Historical Dashboard */}
      <main className={`w-full relative z-10 ${currentView === 'timeline' ? 'flex-1 pt-14' : 'min-h-screen pt-14 sm:pt-16 pb-4 flex flex-col justify-center'}`}>
        {currentView === 'timeline' ? (
          <ContinuousTimeline
            periods={periods}
            activeIndex={activePeriodIndex}
            onSelectPeriod={handleSelectPeriod}
            onOpenPhoto={handleOpenPhoto}
            onFanIdleChange={setIsFanIdle}
            onOpenDashboard={() => setCurrentView('dashboard')}
          />
        ) : (
          <HistoricalDashboard onBackToTimeline={() => setCurrentView('timeline')} />
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
