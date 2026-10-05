import React from 'react';
import type { HistoricalPeriod, MilestonePhoto } from '../../types/timeline';
import { isTopAlignedPhoto, getPhotoPositionClass } from '../../types/timeline';
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

// Deep, saturated DGRH colors for the 15 periods
export const pureBgColors = [
  'bg-[#105e7b]', // 0: 1962 (Primária - Azul DGRH)
  'bg-[#d67b27]', // 1: 1966-1974 (Aux 3 - Laranja DGRH)
  'bg-[#477b2f]', // 2: 1983-1986 (Aux 1 - Verde DGRH)
  'bg-[#5e2a6b]', // 3: 1987-1989 (Aux 2 - Roxo DGRH)
  'bg-[#187fa1]', // 4: 1990-1993 (Azul Céu DGRH)
  'bg-[#b8801a]', // 5: 1995-1997 (Secundária - Dourado Profundo Unicamp 60 Anos)
  'bg-[#366023]', // 6: 1998 (Aux 1 - Verde Floresta)
  'bg-[#6b213b]', // 7: 1999-2000 (Aux 2 - Vinho Profundo)
  'bg-[#c05621]', // 8: 2001-2003 (Aux 3 - Terracota)
  'bg-[#a16207]', // 9: 2004-2006 (Secundária - Âmbar Ouro)
  'bg-[#2d5a27]', // 10: 2008-2013 (Aux 1 - Verde Escuro)
  'bg-[#4c1d95]', // 11: 2014-2015 (Aux 2 - Roxo Profundo)
  'bg-[#b44318]', // 12: 2017-2019 (Aux 3 - Terracota Queimado)
  'bg-[#701a75]', // 13: 2020-2022 (Aux 2 - Ameixa DGRH)
  'bg-[#105e7b]', // 14: 2024-2026 (Primária DGRH - Azul Celebração 60 Anos)
  'bg-[#1e3a5f]', // 15: Diretores Anteriores (Azul Marinho Nobre Institucional)
  'bg-[#0f4c64]', // 16: Diretores Atuais (Azul Petróleo Institucional)
];

export const TimelineCard: React.FC<TimelineCardProps> = ({
  period,
  isActive,
  onSelect,
  onClose,
  onOpenPhoto,
}) => {
  const cardBgClass = pureBgColors[period.index % pureBgColors.length];
  const hasPhotos = Boolean(period.photos && period.photos.length > 0);
  const isDirectorsCard = Boolean(period.directors && period.directors.length > 0);
  const isCurrentDirectorsCard = isDirectorsCard && Boolean(period.directors && period.directors.length <= 2);

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
            ? 'w-[96vw] sm:w-[920px] md:w-[1080px] lg:w-[1240px] xl:w-[1360px] 2xl:w-[1440px] max-w-[1460px] h-[calc(100vh-8rem)] min-h-[530px] max-h-[810px] shadow-2xl shadow-slate-950/40 ring-2 ring-white cursor-default'
            : 'w-[210px] sm:w-[235px] md:w-[250px] h-[350px] sm:h-[390px] md:h-[420px] lg:h-[440px] shadow-lg hover:shadow-2xl cursor-pointer hover:opacity-95 hover:brightness-105'
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
          className={`absolute top-4 right-4 sm:top-5 sm:right-5 p-1.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-950 border border-white/30 transition-all duration-300 cursor-pointer z-30 shadow-md ${
            isActive ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
          }`}
          title="Recolher card e voltar à visão geral"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ================= 1. ACTIVE SELECTED CARD: EXPANDED DISPLAY ================= */}
      <div
        className={`absolute inset-0 p-5 sm:p-7 lg:p-9 xl:p-10 flex flex-col transition-all duration-400 ease-out ${
          isActive
            ? 'opacity-100 pointer-events-auto delay-150 transform translate-y-0 scale-100'
            : 'opacity-0 pointer-events-none transform translate-y-2 scale-98'
        }`}
      >
        {/* Header Superior Global do Card Todo (Acima das Fotos e dos Marcos) */}
        <div className="pb-3 sm:pb-3.5 border-b-2 border-white/20 shrink-0 text-left pr-12 sm:pr-14 mb-3 sm:mb-4">
          <div className="flex flex-wrap items-baseline gap-x-3 sm:gap-x-4 gap-y-1">
            <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black tracking-tight text-[#e5a93a] whitespace-nowrap leading-none drop-shadow-xs">
              {isDirectorsCard ? period.title : period.period}
            </span>
            <span className="text-white/30 font-light select-none text-2xl sm:text-3xl lg:text-4xl hidden sm:inline leading-none">
              |
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-[28px] xl:text-[30px] font-bold text-white/95 tracking-tight leading-tight inline">
              {isDirectorsCard ? period.period : period.title}
            </h2>
          </div>
        </div>

        {isCurrentDirectorsCard && period.directors ? (
          /* ================= LAYOUT ESPECIAL: DIRETORES ATUAIS (2021 – 2029) ================= */
          <div className="flex-1 min-h-0 flex flex-col justify-center">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 h-full max-h-full items-stretch">
              {period.directors.map((director) => {
                const matchingPhoto = period.photos.find(
                  (p) => p.url === director.photoUrl || p.title === director.director
                );

                return (
                  <div
                    key={director.id}
                    className="flex flex-col p-4 sm:p-5 lg:p-6 bg-slate-900/65 hover:bg-slate-900/85 backdrop-blur-md border-2 border-white/20 hover:border-white/70 rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-xl text-left select-none group"
                  >
                    {/* 1. Cabeçalho com os títulos: Período, Cargo ("Diretora" / "Diretor Adjunto") e Nome */}
                    <div className="shrink-0 mb-3 sm:mb-3.5 pb-2.5 sm:pb-3 border-b border-white/15">
                      <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-2.5">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#e5a93a] text-slate-950 font-black text-xs sm:text-sm tracking-tight shadow-sm leading-none">
                          {director.period}
                        </span>
                        {director.role && (
                          <span className="inline-block px-2.5 py-1 rounded-full bg-white/20 text-white font-bold text-xs sm:text-sm tracking-tight border border-white/20 leading-none">
                            {director.role}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl lg:text-[25px] xl:text-[27px] font-black text-white tracking-tight leading-tight">
                        {director.director}
                      </h3>
                    </div>

                    {/* 2. Conteúdo abaixo do cabeçalho: Foto com metade da largura + Biografia */}
                    <div className="flex-1 min-h-0 flex flex-col sm:flex-row gap-4 sm:gap-5 items-start">
                      {/* Foto dos Diretores Atuais - Metade da largura, proporcional ao tamanho original */}
                      <div
                        className="relative w-full sm:w-1/2 aspect-[4/3] rounded-2xl overflow-hidden border-2 border-white/30 bg-slate-950 shadow-lg shrink-0 cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playCardTick();
                          if (matchingPhoto) {
                            onOpenPhoto(matchingPhoto, period);
                          }
                        }}
                        title={`Clique para ampliar foto de ${director.director}`}
                      >
                        <img
                          src={director.photoUrl}
                          alt={director.director}
                          className={`w-full h-full object-cover ${
                            director.id === 'dir-atual-everaldo' ? 'object-top' : 'object-center'
                          } group-hover/photo:scale-105 transition-transform duration-500`}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1 rounded-md bg-white text-slate-950 text-xs font-black shadow-md">
                            Ampliar
                          </span>
                        </div>
                      </div>

                      {/* 3. Biografia oficial completa */}
                      {director.bio && (
                        <div className="flex-1 min-w-0 h-full overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-xs sm:text-sm lg:text-[14px] text-white/90 leading-relaxed font-normal">
                            {director.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : isDirectorsCard && period.directors ? (
          /* ================= LAYOUT ESPECIAL: GALERIA DE DIRETORES ANTERIORES ================= */
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5 p-1">
                {period.directors.map((director) => {
                  const matchingPhoto = period.photos.find(
                    (p) => p.url === director.photoUrl || p.title === director.director
                  );

                  return (
                    <div
                      key={director.id}
                      className="flex flex-col bg-slate-900/60 hover:bg-slate-900/85 backdrop-blur-md border-2 border-white/20 hover:border-white/80 rounded-2xl p-2.5 sm:p-3 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] group text-center select-none"
                    >
                      {/* 1. Período da Gestão */}
                      <div className="mb-2 shrink-0">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-[#e5a93a] text-slate-950 font-black text-xs sm:text-sm tracking-tight shadow-sm leading-none">
                          {director.period}
                        </span>
                      </div>

                      {/* 2. Foto do Diretor */}
                      <div
                        className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/25 bg-slate-950 shadow-md my-0.5 cursor-pointer group/photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundFx.playCardTick();
                          if (matchingPhoto) {
                            onOpenPhoto(matchingPhoto, period);
                          }
                        }}
                        title={`Clique para ampliar foto de ${director.director}`}
                      >
                        <img
                          src={director.photoUrl}
                          alt={director.director}
                          className="w-full h-full object-cover object-top group-hover/photo:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2 py-0.5 rounded-md bg-white text-slate-950 text-[10px] font-black shadow-md">
                            Ampliar
                          </span>
                        </div>
                      </div>

                      {/* 3. Nome do Diretor */}
                      <div className="mt-2 shrink-0">
                        <h4 className="text-xs sm:text-sm font-black text-white tracking-tight leading-snug">
                          {director.director}
                        </h4>
                      </div>

                      {/* 4. Nome do(s) Diretores Adjuntos - Fonte ampliada (sem o termo "adjunto") */}
                      <div className="mt-1.5 flex-1 flex flex-col justify-start gap-0.5">
                        {Array.isArray(director.deputies) ? (
                          director.deputies.map((dep, dIdx) => (
                            <p key={dIdx} className="text-xs sm:text-[13px] text-white/95 font-semibold leading-snug">
                              {dep.replace(/\s*\((?:adjunt[oa]s?)\s*([0-9-]*)\)/i, (_m, yr) => yr ? ` (${yr})` : '').replace(/\s*\((?:adjunt[oa]s?)\)/i, '').trim()}
                            </p>
                          ))
                        ) : director.deputy ? (
                          <p className="text-xs sm:text-[13px] text-white/95 font-semibold leading-snug">
                            {director.deputy.replace(/\s*\((?:adjunt[oa]s?)\)/i, '').trim()}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={`grid ${hasPhotos ? 'grid-cols-1 sm:grid-cols-[minmax(0,34fr)_minmax(0,66fr)] gap-4 sm:gap-6 lg:gap-8' : 'grid-cols-1'} flex-1 min-h-0 items-stretch`}>
          {/* ================= COLUNA 1: FOTOS HISTÓRICAS DO PERÍODO (SE HOUVER) ================= */}
          {hasPhotos && (
            <div className="flex flex-col h-full min-h-0 min-w-0 justify-center">
              {/* Fotos (máximo 2 fotos empilhadas, cada uma em modo cover ocupando sua fração) */}
              <div className={`grid ${period.photos.slice(0, 2).length === 1 ? 'grid-rows-1' : 'grid-rows-2'} gap-2.5 sm:gap-3 h-full min-h-0 max-h-full`}>
                {period.photos.slice(0, 2).map((photo) => (
                  <div
                    key={photo.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      soundFx.playCardTick();
                      onOpenPhoto(photo, period);
                    }}
                    className="relative w-full h-full min-h-0 min-w-0 rounded-2xl overflow-hidden border-2 border-white/30 bg-slate-950 shadow-lg group cursor-pointer hover:border-white transition-all flex items-center justify-center text-left"
                    title={`${photo.title} - Clique para ampliar`}
                  >
                    {photo.url ? (
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className={`group-hover:scale-105 transition-transform duration-500 ${
                          photo.objectFit === 'contain'
                            ? 'h-full w-auto max-w-full object-contain object-center p-1 sm:p-2'
                            : `w-full h-full object-cover ${getPhotoPositionClass(photo)}`
                        }`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <ImageIcon className="w-8 h-8 text-white/50" />
                      </div>
                    )}

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
          )}

          {/* ================= COLUNA 2: MARCOS HISTÓRICOS ================= */}
          <div className={`flex flex-col justify-between h-full min-h-0 min-w-0 ${hasPhotos ? 'sm:pl-2 lg:pl-3' : 'w-full max-w-5xl mx-auto'} text-left`}>
            {/* Lista de Marcos agrupados por ano em tópicos com tipografia ampliada */}
            {(() => {
              const groupedMilestones = period.milestones.reduce((acc, m) => {
                const y = m.year || period.period;
                if (!acc[y]) acc[y] = [];
                acc[y].push(m);
                return acc;
              }, {} as Record<string, typeof period.milestones>);
              const yearGroups = Object.entries(groupedMilestones);

              return (
                <div className="flex-1 overflow-y-auto py-1 pr-5 sm:pr-7 lg:pr-8 space-y-4">
                  {yearGroups.map(([year, milestones], gIdx) => (
                    <div key={year} className="flex flex-col text-left">
                      {/* Cabeçalho do Ano: 20px */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[20px] font-black text-[#e5a93a] tracking-wider drop-shadow-xs">
                          {year}
                        </span>
                      </div>

                      {/* Tópicos dos marcos para o ano: 26px */}
                      <ul className="space-y-3.5 list-disc pl-5 sm:pl-6">
                        {milestones.map((m) => {
                          const isHeading = m.text.endsWith(':');
                          return (
                            <li
                              key={m.id}
                              className={
                                isHeading
                                  ? "list-none -ml-5 sm:-ml-6 text-xl sm:text-2xl lg:text-[25px] xl:text-[26px] leading-[1.28] font-bold text-white tracking-normal break-words mt-1 mb-1"
                                  : "text-xl sm:text-2xl lg:text-[25px] xl:text-[26px] leading-[1.28] font-normal text-white/95 tracking-normal break-words"
                              }
                            >
                              {m.text}
                            </li>
                          );
                        })}
                      </ul>

                      {/* Separador horizontal entre anos */}
                      {gIdx < yearGroups.length - 1 && (
                        <hr className="border-t border-white/20 mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
        )}
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

        {/* Center: Square Archival Photo or Fallback Badge */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-white/25 bg-slate-950/40 shadow-md my-auto group shrink-0 flex items-center justify-center">
          {period.coverImage ? (
            <img
              src={period.coverImage}
              alt={period.title}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                isTopAlignedPhoto(period.coverImage, period.title) ? 'object-top' : 'object-center'
              }`}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xs">
              <span className="text-2xl sm:text-3xl font-black text-[#e5a93a] tracking-tight drop-shadow-xs">
                {period.startYear}
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-white/90 uppercase tracking-wider mt-1 line-clamp-2 px-1 text-center">
                {period.shortLabel || period.title}
              </span>
              <span className="text-[10px] text-white/60 font-semibold mt-1">
                {period.milestones.length} marcos
              </span>
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
