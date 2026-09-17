import React, { useState } from 'react';
import type { HistoricalPeriod } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { 
  RotateCw, Sparkles, CheckCircle2, Image as ImageIcon, ArrowUpRight
} from 'lucide-react';

interface CircleCardProps {
  period: HistoricalPeriod;
  angle: number; // Current angle in degrees relative to viewer (0 = front)
  radius: number; // 3D radius in px
  isActive: boolean;
  onSelect: () => void;
  onOpenDetail: () => void;
}

export const CircleCard: React.FC<CircleCardProps> = ({
  period,
  angle,
  radius,
  isActive,
  onSelect,
  onOpenDetail,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Normalize angle to [-180, 180]
  let normalizedAngle = ((angle % 360) + 540) % 360 - 180;
  const absAngle = Math.abs(normalizedAngle);

  // Visible within arc
  const isBackFacing = absAngle > 80;
  const opacity = Math.max(0.18, Math.cos((absAngle * Math.PI) / 180));
  const zIndex = Math.round((180 - absAngle) * 10);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isActive) {
      soundFx.playCardTick();
      onSelect();
    } else {
      // Flip active card
      soundFx.playCardFlip();
      setIsFlipped(!isFlipped);
    }
  };

  const cardBgClass = period.themeColor.cardBg || 'bg-[#f0f7fa]';

  return (
    <div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[230px] sm:w-[250px] md:w-[264px] h-[330px] sm:h-[360px] preserve-3d transition-opacity duration-300 select-none cursor-pointer group"
      style={{
        transform: `rotateY(${normalizedAngle}deg) translateZ(${radius}px)`,
        opacity: isBackFacing ? Math.min(opacity, 0.22) : opacity,
        zIndex,
        pointerEvents: absAngle > 70 ? 'none' : 'auto',
      }}
      onClick={handleCardClick}
    >
      {/* 3D Card Inner (Flip container) */}
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-out rounded-2xl ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* ================= FRONT OF CARD (INDEX POSTER WITH AUXILIARY BACKGROUND) ================= */}
        <div
          className={`absolute inset-0 backface-hidden crisp-card rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-lg transition-all duration-300 border-2.5 ${cardBgClass} ${
            isActive
              ? 'border-slate-950 shadow-2xl shadow-slate-900/25 ring-4 ring-[#e5a93a]/50'
              : 'border-slate-700/80 hover:border-slate-950 shadow-md hover:shadow-xl'
          }`}
        >
          {/* Top Bar: Index Number & Phase Tag */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
              FASE {String(period.index + 1).padStart(2, '0')}
            </span>
            <span className="w-5 h-5 rounded-md bg-white text-slate-950 border border-slate-900 font-black text-[11px] flex items-center justify-center shadow-2xs">
              {period.index + 1}
            </span>
          </div>

          {/* Prominent Period Years in DGRH Blue */}
          <div className="text-center py-1">
            <div className="text-2xl sm:text-3xl font-black text-[#105e7b] tracking-tight leading-none">
              {period.period}
            </div>
          </div>

          {/* Compact Framed Photo in Square Aspect Ratio */}
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-slate-900 bg-white shadow-xs flex items-center justify-center shrink-0 my-1">
            {period.coverImage ? (
              <img
                src={period.coverImage}
                alt={period.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100">
                <ImageIcon className="w-7 h-7 text-slate-400" />
              </div>
            )}
          </div>

          {/* Bottom Card Title & Quick Arrow */}
          <div className="pt-1.5 border-t border-slate-900/15 flex items-center justify-between text-left">
            <div className="flex-1 min-w-0 pr-1.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-950 tracking-tight truncate leading-snug">
                {period.title}
              </h3>
              <span className="text-[10px] sm:text-[11px] text-slate-600 font-bold block truncate mt-0.5">
                {period.milestones.length} marcos • {period.photos.length} fotos
              </span>
            </div>

            <div
              className={`w-5 h-5 rounded-md border border-slate-900 flex items-center justify-center shrink-0 transition-colors ${
                isActive
                  ? 'bg-[#e5a93a] text-slate-950'
                  : 'bg-white text-slate-700 group-hover:bg-slate-900 group-hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* ================= BACK OF CARD (DETAILED DATA ON FLIP) ================= */}
        <div
          className={`absolute inset-0 backface-hidden crisp-card rotate-y-180 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-2xl border-2.5 border-slate-950 ring-4 ring-[#105e7b]/20 ${cardBgClass} text-slate-900`}
        >
          {/* Header of back face */}
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900">
            <div className="text-left">
              <span className="text-sm font-black text-[#105e7b] tracking-tight block leading-none">
                {period.period}
              </span>
              <h4 className="text-xs font-black text-slate-950 truncate max-w-[160px] mt-0.5">
                {period.title}
              </h4>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playCardFlip();
                setIsFlipped(false);
              }}
              className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 hover:text-slate-950 transition-colors cursor-pointer border border-slate-300 shadow-2xs"
              title="Voltar à capa do período"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Milestones List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 my-1 text-left">
            <div className="text-[10px] font-black text-slate-900 uppercase tracking-wider">
              Marcos Históricos:
            </div>
            {period.milestones.map((m) => (
              <div key={m.id} className="flex items-start gap-1.5 text-xs text-slate-800 leading-snug">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#105e7b] shrink-0 mt-0.5" />
                <span className="font-medium">{m.text}</span>
              </div>
            ))}
          </div>

          {/* Back face Action Button */}
          <div className="pt-2 border-t-2 border-slate-900">
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playCardTick();
                onOpenDetail();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#105e7b] hover:bg-[#187fa1] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#e5a93a]" />
              <span>Ver Fotos & Acervo Completo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
