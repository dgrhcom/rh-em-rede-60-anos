import React, { useEffect, useCallback } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoViewerModalProps {
  photo: MilestonePhoto | null;
  period: HistoricalPeriod | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto?: (photo: MilestonePhoto) => void;
}

const cleanPhotoText = (text: string) => text.replace(/^Foto\s+(do\s+|da\s+|dos\s+|das\s+|de\s+)?/i, '');

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  photo,
  period,
  isOpen,
  onClose,
  onSelectPhoto,
}) => {
  const photos = period?.photos || [];
  const currentIndex = photo ? photos.findIndex((p) => p.id === photo.id) : -1;
  const totalPhotos = photos.length;
  const hasMultiple = totalPhotos > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple || currentIndex === -1 || !onSelectPhoto) return;
    soundFx.playCardTick();
    const prevIdx = (currentIndex - 1 + totalPhotos) % totalPhotos;
    onSelectPhoto(photos[prevIdx]);
  }, [currentIndex, hasMultiple, onSelectPhoto, photos, totalPhotos]);

  const handleNext = useCallback(() => {
    if (!hasMultiple || currentIndex === -1 || !onSelectPhoto) return;
    soundFx.playCardTick();
    const nextIdx = (currentIndex + 1) % totalPhotos;
    onSelectPhoto(photos[nextIdx]);
  }, [currentIndex, hasMultiple, onSelectPhoto, photos, totalPhotos]);

  // Keyboard navigation (Esc to close, Arrow keys to navigate)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !photo) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fade-in select-none"
      onClick={onClose}
    >
      {/* Top Close Button & Photo Counter */}
      <div
        className="w-full max-w-5xl flex items-center justify-between px-2 mb-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          {period && (
            <span className="px-3 py-1 rounded-lg bg-[#e5a93a] text-slate-950 font-black text-xs shadow-md border border-slate-900">
              {period.period}
            </span>
          )}
          {hasMultiple && (
            <span className="text-xs font-black text-white/80 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20">
              Foto {currentIndex + 1} de {totalPhotos}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            soundFx.playCardTick();
            onClose();
          }}
          className="p-2.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all cursor-pointer shadow-lg"
          title="Fechar (Esc)"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Image Container with Prev/Next Navigation */}
      <div
        className="relative w-full max-w-5xl flex items-center justify-center flex-1 min-h-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        {hasMultiple && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all shadow-xl cursor-pointer"
            title="Foto anterior (←)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Right Arrow */}
        {hasMultiple && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all shadow-xl cursor-pointer"
            title="Próxima foto (→)"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* The Photo */}
        <div className="relative max-w-full max-h-full flex items-center justify-center p-2">
          {photo.url ? (
            <img
              src={photo.url}
              alt={photo.title}
              className="max-h-[68vh] sm:max-h-[72vh] max-w-full w-auto object-contain rounded-2xl shadow-2xl border-2 border-white/25"
            />
          ) : (
            <div className="w-96 h-72 flex flex-col items-center justify-center bg-slate-800 rounded-2xl border-2 border-white/20 text-white/60">
              <ImageIcon className="w-16 h-16 mb-2 text-white/40" />
              <span className="text-sm font-bold">{cleanPhotoText(photo.title)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Info Card: Title, Caption and Credits */}
      <div
        className="w-full max-w-2xl mt-3 p-4 rounded-2xl bg-white/95 text-slate-950 border-2 border-slate-900 shadow-2xl text-center shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
          {cleanPhotoText(photo.title)}
        </h3>

        {photo.caption && (
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-1 leading-relaxed">
            {photo.caption}
          </p>
        )}

        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-bold">
          <span>{photo.credit || 'Acervo Histórico DGRH / Memória Unicamp'}</span>
          {hasMultiple && (
            <span className="text-slate-500 font-medium hidden sm:inline">
              Use as setas ← / → do teclado para navegar
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
