import React, { useState, useEffect } from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { isTopAlignedPhoto } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { 
  X, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Sparkles, Award, ZoomIn
} from 'lucide-react';

interface PeriodDetailModalProps {
  period: HistoricalPeriod | null;
  isOpen: boolean;
  onClose: () => void;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onUpdatePhotoUrl?: (periodId: string, photoId: string, newUrl: string) => void;
}

export const PeriodDetailModal: React.FC<PeriodDetailModalProps> = ({
  period,
  isOpen,
  onClose,
  onPrevPeriod,
  onNextPeriod,
  onUpdatePhotoUrl: _onUpdatePhotoUrl,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<MilestonePhoto | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPhoto) {
          setSelectedPhoto(null);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && !selectedPhoto) {
        onPrevPeriod();
      } else if (e.key === 'ArrowRight' && !selectedPhoto) {
        onNextPeriod();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedPhoto, onClose, onPrevPeriod, onNextPeriod]);

  if (!isOpen || !period) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
      {/* Modal Card */}
      <div
        className="relative w-full max-w-4xl bg-white border-3 border-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-r from-[#105e7b] via-[#0e4e66] to-[#002b49] p-6 sm:p-8 text-white border-b-2 border-slate-900">
          {/* Close Button */}
          <button
            onClick={() => {
              soundFx.playCardTick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/15 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-colors z-20 cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Period Badge & Index */}
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-lg bg-[#e5a93a] text-slate-950 font-black text-xs shadow-sm border border-slate-900">
              {period.period}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {period.index + 1} de 12
            </span>
            <div className="flex items-center gap-1.5 ml-auto text-xs text-[#e5a93a] font-black">
              <Award className="w-4 h-4" />
              <span>{period.badge.title}</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {period.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-100 mt-2 leading-relaxed max-w-2xl font-medium">
            {period.description}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-white">
          {/* Historical Photos Section (Placed first as requested) */}
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#105e7b]" />
                <span>Acervo Histórico e Fotografias ({period.photos.length})</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                Fonte: Portal DGRH / Memória Institucional
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {period.photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative rounded-2xl bg-white border-2 border-slate-900 overflow-hidden flex flex-col justify-between hover:shadow-xl transition-all shadow-md"
                >
                  {/* Photo Thumbnail Area */}
                  <div
                    className="relative w-full h-52 bg-slate-100 flex items-center justify-center cursor-pointer overflow-hidden"
                    onClick={() => {
                      soundFx.playCardTick();
                      setSelectedPhoto(photo);
                    }}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                          photo.objectFit === 'contain'
                            ? 'object-contain p-2 bg-slate-900'
                            : `object-cover ${isTopAlignedPhoto(photo) ? 'object-top' : 'object-center'}`
                        }`}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs font-bold text-slate-700">
                          {photo.title}
                        </span>
                      </div>
                    )}

                    {/* Hover overlay zoom */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="px-3.5 py-1.5 rounded-full bg-white text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl border border-slate-900">
                        <ZoomIn className="w-3.5 h-3.5 text-[#105e7b]" />
                        <span>Ampliar Imagem</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-3.5 bg-slate-50 border-t-2 border-slate-900 text-left">
                    <h4 className="text-xs font-black text-slate-950">{photo.title}</h4>
                    <p className="text-[11px] text-slate-600 leading-snug mt-1 font-medium">
                      {photo.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones Section (Placed second) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#105e7b] flex items-center gap-2 mb-3.5">
              <Sparkles className="w-4 h-4 text-[#e5a93a]" />
              <span>Marcos e Conquistas Históricas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {period.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="p-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex flex-col items-start hover:border-slate-400 transition-colors text-left"
                >
                  {milestone.year && (
                    <span className="text-xs font-black text-[#d97706] tracking-wider mb-1">
                      {milestone.year}
                    </span>
                  )}
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    {milestone.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar with Previous / Next navigation */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-900 flex items-center justify-between">
          <button
            onClick={() => {
              soundFx.playCardTick();
              onPrevPeriod();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-900 text-xs font-black border border-slate-900 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Período Anterior</span>
          </button>

          <span className="text-xs font-bold text-slate-500 hidden sm:inline">
            Navegue com as setas do teclado (← / →)
          </span>

          <button
            onClick={() => {
              soundFx.playCardTick();
              onNextPeriod();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#105e7b] hover:bg-[#187fa1] text-white text-xs font-black border border-slate-900 transition-colors cursor-pointer"
          >
            <span>Próximo Período</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lightbox Fullscreen Photo Zoom */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white text-slate-950 hover:bg-slate-200 border-2 border-slate-900 transition-colors z-30 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-3xl w-full flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedPhoto.url && (
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="max-h-[75vh] rounded-2xl shadow-2xl object-contain border-2 border-white"
              />
            )}

            <div className="mt-4 p-4 rounded-xl bg-white/95 text-slate-950 border border-slate-900 max-w-xl shadow-xl">
              <h3 className="text-sm font-black">{selectedPhoto.title}</h3>
              <p className="text-xs text-slate-700 mt-1 font-medium">{selectedPhoto.caption}</p>
              <span className="text-[10px] text-[#105e7b] font-bold mt-2 block">
                {selectedPhoto.credit || 'Acervo Histórico DGRH / Unicamp'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
