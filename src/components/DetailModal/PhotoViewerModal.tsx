import React, { useEffect, useCallback, useRef, useState } from 'react';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Calcula e força a imagem a ocupar o máximo de largura ou altura possível
  const computeSize = useCallback((natW: number, natH: number) => {
    if (!containerRef.current || natW <= 0 || natH <= 0) return;
    const cRect = containerRef.current.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const padX = window.innerWidth < 640 ? 12 : 24;
    const padY = window.innerWidth < 640 ? 12 : 16;
    const availW = Math.max(80, cRect.width - padX);
    const availH = Math.max(80, cRect.height - padY);

    const imgRatio = natW / natH;
    const contRatio = availW / availH;

    if (imgRatio > contRatio) {
      // Ocupa o máximo de largura disponível
      const targetW = availW;
      const targetH = availW / imgRatio;
      setImgDimensions({ width: Math.round(targetW), height: Math.round(targetH) });
    } else {
      // Ocupa o máximo de altura disponível
      const targetH = availH;
      const targetW = availH * imgRatio;
      setImgDimensions({ width: Math.round(targetW), height: Math.round(targetH) });
    }
  }, []);

  // Recalcula dimensões ao trocar de foto
  useEffect(() => {
    setImgDimensions(null);
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      computeSize(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
    }
  }, [photo?.url, computeSize]);

  // Observa redimensionamentos da janela ou do container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
        computeSize(imgRef.current.naturalWidth, imgRef.current.naturalHeight);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [computeSize]);

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
      className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 md:p-5 select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Close Button & Photo Counter */}
      <div
        className="w-full max-w-7xl flex items-center justify-between px-2 mb-1.5 sm:mb-2 shrink-0 z-20"
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
        className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden my-1"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Arrow */}
        {hasMultiple && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-4 md:left-6 z-30 p-2.5 sm:p-3.5 rounded-full bg-slate-950/60 hover:bg-white text-white hover:text-slate-950 border border-white/30 backdrop-blur-sm transition-all shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
            title="Foto anterior (←)"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* Right Arrow */}
        {hasMultiple && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-4 md:right-6 z-30 p-2.5 sm:p-3.5 rounded-full bg-slate-950/60 hover:bg-white text-white hover:text-slate-950 border border-white/30 backdrop-blur-sm transition-all shadow-2xl cursor-pointer hover:scale-105 active:scale-95"
            title="Próxima foto (→)"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        {/* The Photo: Expands to maximum height or maximum width that fits */}
        <div ref={containerRef} className="w-full h-full flex items-center justify-center p-1 sm:p-2">
          {photo.url ? (
            <img
              ref={imgRef}
              src={photo.url}
              alt={photo.title}
              onLoad={(e) => {
                computeSize(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
              }}
              style={
                imgDimensions
                  ? {
                      width: `${imgDimensions.width}px`,
                      height: `${imgDimensions.height}px`,
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }
                  : {
                      maxWidth: '100%',
                      maxHeight: '100%',
                    }
              }
              className="object-contain rounded-2xl shadow-2xl border-2 border-white/25 select-none"
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
        className="w-full max-w-3xl mt-1.5 sm:mt-2 px-4 py-2.5 sm:py-3 rounded-2xl bg-white/95 text-slate-950 border border-slate-900/40 shadow-2xl text-center shrink-0 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm sm:text-base font-black tracking-tight text-slate-900">
          {cleanPhotoText(photo.title)}
        </h3>

        {photo.caption && (
          <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5 leading-relaxed">
            {photo.caption}
          </p>
        )}

        <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600 font-bold">
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
