import React from 'react';
import type { HistoricalPeriod } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { 
  Building2, FileText, Cpu, LayoutGrid, ShieldCheck, HeartPulse, 
  GraduationCap, Users, Medal, Network, ActivitySquare, Rocket
} from 'lucide-react';

interface BoardTileProps {
  period: HistoricalPeriod;
  isCurrent: boolean;
  isVisited: boolean;
  isStart: boolean;
  isFinish: boolean;
  onClick: () => void;
  onOpenDetail: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  Building2,
  FileText,
  Cpu,
  LayoutGrid,
  ShieldCheck,
  HeartPulse,
  GraduationCap,
  Users,
  Medal,
  Network,
  ActivitySquare,
  Rocket,
};

const pureBgColors = [
  'bg-[#105e7b]', // 0: 1983-1986 (Azul DGRH)
  'bg-[#477b2f]', // 1: 1989 (Verde DGRH)
  'bg-[#5e2a6b]', // 2: 1990-1993 (Roxo DGRH)
  'bg-[#d67b27]', // 3: 1995-1997 (Laranja DGRH)
  'bg-[#0a4155]', // 4: 1998 (Azul Petróleo)
  'bg-[#366023]', // 5: 1999-2000 (Verde Floresta)
  'bg-[#6b213b]', // 6: 2001-2003 (Vinho Profundo)
  'bg-[#1a508b]', // 7: 2004-2006 (Azul Cobalto)
  'bg-[#4c1d95]', // 8: 2008-2011 (Roxo Escuro)
  'bg-[#c05621]', // 9: 2014-2015 (Terracota)
  'bg-[#0d6e8a]', // 10: 2017-2019 (Azul Oceano)
  'bg-[#105e7b]', // 11: 2022-2025 (Azul DGRH 60 Anos)
];

export const BoardTile: React.FC<BoardTileProps> = ({
  period,
  isCurrent,
  isVisited,
  isStart,
  isFinish,
  onClick,
  onOpenDetail,
}) => {
  const IconComponent = iconMap[period.iconName] || Building2;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playCardTick();
    onClick();
  };

  const cardBg = pureBgColors[period.index % pureBgColors.length];

  return (
    <div
      onClick={handleClick}
      className={`relative group flex flex-col justify-between w-[230px] sm:w-[252px] min-h-[270px] p-3.5 rounded-2xl cursor-pointer transition-all duration-300 select-none border-2.5 border-slate-950 crisp-card ${cardBg} ${
        isCurrent
          ? 'shadow-2xl z-30 ring-2 ring-white'
          : isVisited
          ? 'shadow-lg hover:shadow-2xl'
          : 'shadow-md hover:shadow-xl'
      }`}
    >
      {/* Centered trail connection nodes on card borders */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-xs z-30 pointer-events-none" />
      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-700 border-2 border-white shadow-xs z-30 pointer-events-none" />

      {/* Active Pawn Token Placement */}
      {isCurrent && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center animate-bounce pointer-events-none">
          {/* Stylized Pawn with Gold Medal */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e5a93a] via-[#f59e0b] to-[#b8801a] border-2 border-slate-950 shadow-xl flex items-center justify-center text-slate-950 font-black text-sm">
            ★
          </div>
          <div className="w-7 h-2 rounded-full bg-slate-950/40 blur-xs mt-0.5" />
        </div>
      )}

      {/* Start or Finish Festive Ribbon */}
      {isStart && (
        <div className="absolute -top-3 right-3 px-2.5 py-0.5 rounded-full bg-white text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md border border-slate-900">
          🏁 Partida
        </div>
      )}
      {isFinish && (
        <div className="absolute -top-3 right-3 px-2.5 py-0.5 rounded-full bg-[#e5a93a] text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md border border-slate-900 animate-pulse">
          🏆 60 Anos Unicamp
        </div>
      )}


      {/* Prominent Period Years in Pure White */}
      <div className="text-center py-1">
        <div className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
          {period.period}
        </div>
      </div>

      {/* Framed Photo in Square Aspect Ratio */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-white/25 bg-slate-950 shadow-md my-1.5 flex items-center justify-center shrink-0">
        {period.coverImage ? (
          <img
            src={period.coverImage}
            alt={period.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-800">
            <IconComponent className="w-6 h-6 text-white/50" />
          </div>
        )}
      </div>

      {/* Bottom Title with Number to the left & Action in White */}
      <div className="pt-1.5 border-t border-white/20 flex items-center justify-between text-left gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md text-xs font-black flex items-center justify-center bg-white text-slate-950 border border-slate-900 shadow-sm shrink-0">
            {period.index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm font-black text-white tracking-tight leading-snug truncate">
              {period.title}
            </h3>
            <span className="text-[10px] sm:text-[11px] text-white/80 font-bold truncate block mt-0.5">
              {period.photos.length} fotos do acervo
            </span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playCardFlip();
            onOpenDetail();
          }}
          className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-950 font-black text-[10px] transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          Marcos
        </button>
      </div>
    </div>
  );
};
