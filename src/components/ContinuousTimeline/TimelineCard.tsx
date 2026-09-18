import React from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { 
  Sparkles, Image as ImageIcon, X 
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

  // ================= 1. ACTIVE SELECTED CARD: EXPANDED 2-COLUMN DISPLAY =================
  if (isActive) {
    return (
      <div
        className={`relative w-[94vw] sm:w-[780px] md:w-[920px] lg:w-[1040px] xl:w-[1140px] max-w-[1160px] h-[calc(100vh-11.5rem)] min-h-[480px] max-h-[670px] rounded-3xl p-4 sm:p-5 lg:p-6 shadow-2xl shadow-slate-950/40 ring-2 ring-white border-2.5 border-slate-950 ${cardBgClass} text-white transition-shadow duration-300 select-none`}
      >
        {/* Top-Right Collapse Button to return to unselected timeline */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              soundFx.playCardTick();
              onClose();
            }}
            className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all cursor-pointer z-30 shadow-md"
            title="Recolher card e voltar à visão geral"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 h-full items-stretch overflow-hidden">
          {/* ================= COLUNA 1: FOTOS HISTÓRICAS DO PERÍODO ================= */}
          <div className="flex flex-col justify-between h-full min-w-0">
            {/* Top: Ano do Período & Título */}
            <div className="text-center pb-2 border-b border-white/20 shrink-0">
              <div className="text-3xl sm:text-4xl lg:text-[42px] font-black text-white tracking-tight leading-none">
                {period.period}
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-black text-white/90 truncate mt-1">
                {period.title}
              </h3>
            </div>

            {/* Fotos Listadas da Estrutura de Dados em Formato Retangular (Grid de 2 colunas) */}
            <div className="flex-1 overflow-y-auto py-2 pr-1 my-1">
              <div className="grid grid-cols-2 gap-3 items-start">
                {period.photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playCardTick();
                      onOpenPhoto(photo, period);
                    }}
                    className="flex flex-col group cursor-pointer text-left"
                    title={`${photo.title} - Clique para ampliar`}
                  >
                    {/* Rectangular Photo Container */}
                    <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border-2 border-white/30 bg-slate-950 shadow-lg group-hover:border-white transition-all">
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                          <ImageIcon className="w-8 h-8 text-white/50" />
                        </div>
                      )}
                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-2 py-0.5 rounded-md bg-white text-slate-950 text-[10px] font-black shadow-md">
                          Ampliar
                        </span>
                      </div>
                    </div>

                    {/* Photo Title & Caption */}
                    <h5 className="text-[11px] sm:text-xs md:text-sm font-black text-white mt-1.5 line-clamp-1 group-hover:underline">
                      {cleanPhotoText(photo.title)}
                    </h5>
                    <p className="text-[10px] sm:text-[11px] md:text-xs text-white/80 line-clamp-2 leading-tight mt-0.5 font-medium">
                      {photo.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé da Coluna 1: Total de Fotos */}
            <div className="pt-2 border-t border-white/20 flex items-center justify-between text-left shrink-0">
              <span className="text-xs text-white/80 font-bold">
                {period.photos.length} fotos no acervo
              </span>
            </div>
          </div>

          {/* ================= COLUNA 2: MARCOS HISTÓRICOS (SEM RESUMO ACIMA) ================= */}
          <div className="flex flex-col justify-between h-full min-w-0 sm:border-l-2 sm:border-white/20 sm:pl-5 lg:pl-6 text-left">
            {/* Header da Coluna 2 */}
            <div className="flex items-center justify-between pb-2 border-b-2 border-white/20 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#e5a93a]" />
                <h4 className="text-xs sm:text-sm lg:text-base font-black uppercase tracking-wider text-white">
                  Marcos Históricos
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-black text-xs shrink-0">
                {period.milestones.length} marcos
              </span>
            </div>

            {/* Lista de Marcos com Fonte Aumentada (Inicia diretamente abaixo do header, sem resumo) */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1.5 my-1">
              {period.milestones.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-white/10 border border-white/20 flex flex-col items-start hover:bg-white/15 transition-colors"
                >
                  {m.year && (
                    <span className="text-sm sm:text-base font-black text-[#e5a93a] tracking-wider mb-1">
                      {m.year}
                    </span>
                  )}
                  <p className="text-sm sm:text-base lg:text-[17px] font-bold text-white leading-snug">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. UNSELECTED NEIGHBOR CARD: COMPACT 1-COLUMN PREVIEW =================
  const handleNeighborClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      onClick={handleNeighborClick}
      className={`relative w-[230px] sm:w-[260px] md:w-[280px] h-[390px] sm:h-[430px] md:h-[460px] lg:h-[480px] rounded-3xl p-4 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-2xl border-2.5 border-slate-950 ${cardBgClass} text-white cursor-pointer select-none transition-[transform,box-shadow,filter] duration-200 hover:opacity-95 hover:-translate-y-2 hover:brightness-105`}
    >
      {/* Top: Period Years */}
      <div className="text-center py-1">
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
            <span className="text-[10px] text-white/80 font-bold block truncate mt-0.5">
              {period.photos.length} fotos no acervo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
