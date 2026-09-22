import React from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { 
  Image as ImageIcon, X 
} from 'lucide-react';

interface TimelineCardProps {
  period: HistoricalPeriod;
  isActive: boolean;
  onSelect: () => void;
  onClose?: () => void;
  onOpenPhoto: (photo: MilestonePhoto, period: HistoricalPeriod) => void;
}

// Deep, saturated DGRH colors for the 12 periods (Secondary and Auxiliaries only - Primary reserved strictly for Cover)
export const pureBgColors = [
  'bg-[#477b2f]', // 0: 1983-1986 (Aux 1 - Verde DGRH)
  'bg-[#5e2a6b]', // 1: 1989 (Aux 2 - Roxo DGRH)
  'bg-[#d67b27]', // 2: 1990-1993 (Aux 3 - Laranja DGRH)
  'bg-[#b8801a]', // 3: 1995-1997 (Secundária - Dourado Profundo Unicamp 60 Anos)
  'bg-[#366023]', // 4: 1998 (Aux 1 - Verde Floresta)
  'bg-[#6b213b]', // 5: 1999-2000 (Aux 2 - Vinho Profundo)
  'bg-[#c05621]', // 6: 2001-2003 (Aux 3 - Terracota)
  'bg-[#a16207]', // 7: 2004-2006 (Secundária - Âmbar Ouro)
  'bg-[#2d5a27]', // 8: 2008-2011 (Aux 1 - Verde Escuro)
  'bg-[#4c1d95]', // 9: 2014-2015 (Aux 2 - Roxo Profundo)
  'bg-[#b44318]', // 10: 2017-2019 (Aux 3 - Terracota Queimado)
  'bg-[#701a75]', // 11: 2022-2025 (Aux 2 - Ameixa DGRH)
];

const cleanPhotoText = (text: string) => text.replace(/^Foto\s+(do\s+|da\s+|dos\s+|das\s+|de\s+)?/i, '');

export const TimelineCard: React.FC<TimelineCardProps> = ({
  period,
  isActive,
  onSelect,
  onClose,
  onOpenPhoto,
}) => {
  const cardBgClass = pureBgColors[period.index % pureBgColors.length];

  const handleNeighborClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      onClick={!isActive ? handleNeighborClick : undefined}
      className={`relative rounded-3xl overflow-hidden border-2.5 border-slate-950 ${cardBgClass} text-white select-none
        transition-[width,height,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${
          isActive
            ? 'w-[96vw] sm:w-[840px] md:w-[980px] lg:w-[1120px] xl:w-[1240px] max-w-[1260px] h-[calc(100vh-9.5rem)] min-h-[520px] max-h-[740px] shadow-2xl shadow-slate-950/40 ring-2 ring-white cursor-default'
            : 'w-[230px] sm:w-[260px] md:w-[280px] h-[390px] sm:h-[430px] md:h-[460px] lg:h-[480px] shadow-lg hover:shadow-2xl cursor-pointer hover:opacity-95 hover:brightness-105'
        }
      `}
    >
      {/* Top-Right Collapse Button to return to unselected timeline */}
      {onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            soundFx.playCardTick();
            onClose();
          }}
          className={`absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all duration-300 cursor-pointer z-30 shadow-md ${
            isActive ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Recolher card e voltar à visão geral"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ================= 1. ACTIVE SELECTED CARD: EXPANDED 2-COLUMN DISPLAY ================= */}
      <div
        className={`absolute inset-0 p-3.5 sm:p-4 lg:p-5 transition-all duration-400 ease-out ${
          isActive
            ? 'opacity-100 pointer-events-auto delay-150 transform translate-y-0 scale-100'
            : 'opacity-0 pointer-events-none transform translate-y-2 scale-98'
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-[44%_56%] gap-4 sm:gap-6 h-full min-h-0 items-stretch overflow-hidden">
          {/* ================= COLUNA 1: FOTOS HISTÓRICAS DO PERÍODO (CABEM RIGOROSAMENTE NA ALTURA) ================= */}
          <div className="flex flex-col h-full min-h-0 min-w-0 justify-center">
            {/* Fotos (máximo 2 fotos empilhadas, cada uma contida rigorosamente em sua fração de altura) */}
            <div className={`grid ${period.photos.slice(0, 2).length === 1 ? 'grid-rows-1' : 'grid-rows-2'} gap-2.5 sm:gap-3 h-full min-h-0 max-h-full`}>
              {period.photos.slice(0, 2).map((photo) => (
                <div
                  key={photo.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundFx.playCardTick();
                    onOpenPhoto(photo, period);
                  }}
                  className="relative w-full h-full min-h-0 min-w-0 rounded-2xl overflow-hidden border-2 border-white/30 bg-black/70 shadow-lg group cursor-pointer hover:border-white transition-all flex items-center justify-center text-left"
                  title={`${photo.title} - Clique para ampliar`}
                >
                  {photo.url ? (
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-auto h-auto max-w-full max-h-full object-contain p-1 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <ImageIcon className="w-8 h-8 text-white/50" />
                    </div>
                  )}

                  {/* Legenda posicionada sobre a foto, na base dela, para ganhar espaço */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-4 pb-2 px-3 pointer-events-none">
                    <p className="text-[11px] sm:text-xs font-bold text-white line-clamp-1 sm:line-clamp-2 leading-tight drop-shadow-md">
                      {cleanPhotoText(photo.caption || photo.title)}
                    </p>
                  </div>

                  {/* Hover Overlay Hint */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-2.5 py-1 rounded-md bg-white text-slate-950 text-[10px] font-black shadow-md">
                      Ampliar
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= COLUNA 2: MARCOS HISTÓRICOS (SEM SEPARADOR VERTICAL) ================= */}
          <div className="flex flex-col justify-between h-full min-h-0 min-w-0 sm:pl-2 lg:pl-3 text-left">
            {/* Header da Coluna 2: Anos do Período e Subtítulo alinhados à esquerda */}
            <div className="pb-3 border-b-2 border-white/20 shrink-0 text-left">
              <div className="text-3xl sm:text-4xl lg:text-[46px] font-black text-white tracking-tight leading-none">
                {period.period}
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-white/90 truncate mt-1.5">
                {period.title}
              </h3>
            </div>

            {/* Lista de Marcos agrupados por ano em tópicos com separador horizontal e tipografia ampliada */}
            <div className="flex-1 overflow-y-auto py-2 pr-2 my-1 space-y-4">
              {(() => {
                const groupedMilestones = period.milestones.reduce((acc, m) => {
                  const y = m.year || period.period;
                  if (!acc[y]) acc[y] = [];
                  acc[y].push(m);
                  return acc;
                }, {} as Record<string, typeof period.milestones>);
                const yearGroups = Object.entries(groupedMilestones);

                return yearGroups.map(([year, milestones], gIdx) => (
                  <div key={year} className="flex flex-col text-left">
                    {/* Cabeçalho do Ano */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl lg:text-2xl font-black text-[#e5a93a] tracking-wider drop-shadow-xs">
                        {year}
                      </span>
                    </div>

                    {/* Tópicos dos marcos para o ano com texto ampliado */}
                    <ul className="space-y-3 list-disc list-inside">
                      {milestones.map((m) => (
                        <li
                          key={m.id}
                          className="text-base sm:text-lg lg:text-[20px] font-semibold text-white/95 leading-relaxed tracking-normal pl-1"
                        >
                          <span className="font-bold">{m.text}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Separador horizontal entre anos */}
                    {gIdx < yearGroups.length - 1 && (
                      <hr className="border-t border-white/20 mt-4" />
                    )}
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. UNSELECTED NEIGHBOR CARD: COMPACT 1-COLUMN PREVIEW ================= */}
      <div
        className={`absolute inset-0 p-4 w-full max-w-[280px] mx-auto flex flex-col justify-between overflow-hidden transition-all duration-300 ${
          isActive
            ? 'opacity-0 pointer-events-none transform -translate-y-2 scale-95'
            : 'opacity-100 pointer-events-auto delay-100 transform translate-y-0 scale-100'
        }`}
      >
        {/* Top: Period Years */}
        <div className="text-center py-1 shrink-0">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none">
            {period.period}
          </div>
        </div>

        {/* Center: Square Archival Photo */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/25 bg-slate-950 shadow-md my-auto group shrink-0">
          {period.coverImage ? (
            <img
              src={period.coverImage}
              alt={period.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <ImageIcon className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>

        {/* Bottom: Number & Title */}
        <div className="pt-2 border-t border-white/20 flex items-center justify-between text-left gap-2 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-white text-slate-950 font-black text-xs flex items-center justify-center shadow-xs border border-slate-900 shrink-0">
              {period.index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-black text-white tracking-tight truncate leading-snug">
                {period.title}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
