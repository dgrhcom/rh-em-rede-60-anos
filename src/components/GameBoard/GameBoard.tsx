import React, { useState, useEffect, useRef } from 'react';
import type { HistoricalPeriod } from '../../types/timeline';
import { BoardTile } from './BoardTile';
import { DiceRoller } from './DiceRoller';
import { soundFx } from '../../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, MapPin, ChevronUp, ChevronDown, Trophy, Flag, 
  Sparkles, ArrowUpRight
} from 'lucide-react';

interface GameBoardProps {
  periods: HistoricalPeriod[];
  currentTileIndex: number;
  visitedIndices: Set<number>;
  onMoveToTile: (index: number) => void;
  onOpenDetail: (period: HistoricalPeriod) => void;
}

// Pure DGRH colors for the 13 periods
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
  'bg-[#701a75]', // 11: 2020-2022 (Ameixa DGRH)
  'bg-[#105e7b]', // 12: 2024-2026 (Azul DGRH 60 Anos)
];

// 4-column dynamic board game trail coordinates with expanded vertical spacing (step ~450px)
const trailPositions = [
  { x: 18, y: 180 },   // 0: 1983-1986 (Col 1 - Base / Partida)
  { x: 62, y: 630 },   // 1: 1989 (Col 3)
  { x: 82, y: 1080 },  // 2: 1990-1993 (Col 4)
  { x: 38, y: 1530 },  // 3: 1995-1997 (Col 2)
  { x: 18, y: 1980 },  // 4: 1998 (Col 1)
  { x: 82, y: 2430 },  // 5: 1999-2000 (Col 4)
  { x: 62, y: 2880 },  // 6: 2001-2003 (Col 3)
  { x: 18, y: 3330 },  // 7: 2004-2006 (Col 1)
  { x: 38, y: 3780 },  // 8: 2008-2011 (Col 2)
  { x: 82, y: 4230 },  // 9: 2014-2015 (Col 4)
  { x: 38, y: 4680 },  // 10: 2017-2019 (Col 2)
  { x: 62, y: 5130 },  // 11: 2020-2022 (Col 3)
  { x: 82, y: 5580 },  // 12: 2024-2026 (Col 4 - Topo / Chegada 60 Anos)
];

export const GameBoard: React.FC<GameBoardProps> = ({
  periods,
  currentTileIndex,
  visitedIndices,
  onMoveToTile,
  onOpenDetail,
}) => {
  const [isMoving, setIsMoving] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const totalTiles = periods.length;
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasInitializedScroll = useRef(false);

  // Auto-scroll to active tile
  const scrollToTile = (index: number, smooth: boolean = true) => {
    const el = tileRefs.current[index];
    if (el) {
      el.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        block: 'center',
      });
    }
  };

  // Initial scroll to bottom (oldest era 1983)
  useEffect(() => {
    if (!hasInitializedScroll.current) {
      hasInitializedScroll.current = true;
      setTimeout(() => {
        scrollToTile(currentTileIndex, false);
      }, 150);
    }
  }, [currentTileIndex]);

  // Handle move and scroll
  const handleMove = (newIndex: number) => {
    onMoveToTile(newIndex);
    scrollToTile(newIndex, true);
  };

  // Dice roll handler
  const handleDiceRoll = (steps: number) => {
    setIsMoving(true);
    let current = currentTileIndex;
    let remaining = steps;

    const interval = setInterval(() => {
      if (remaining > 0) {
        current = Math.min(current + 1, totalTiles - 1);
        soundFx.playPawnHop();
        handleMove(current);
        remaining--;

        if (current === totalTiles - 1) {
          remaining = 0;
        }
      } else {
        clearInterval(interval);
        setIsMoving(false);

        if (current === totalTiles - 1) {
          triggerCelebration();
        }
      }
    }, 380);
  };

  const triggerCelebration = () => {
    soundFx.playCelebration();
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#105e7b', '#e5a93a', '#477b2f', '#d67b27', '#ffffff'],
    });
  };

  const activePeriod = periods[currentTileIndex];
  const progressPercent = Math.round((visitedIndices.size / totalTiles) * 100);

  // Generate SVG path connecting the 13 tiles from bottom to top (using 0..1000 X coordinate space)
  // Generate SVG orthogonal path connecting the 13 tiles with straight lines and 90° bends
  const svgTotalHeight = 5850;
  const buildSvgPath = () => {
    if (trailPositions.length === 0) return '';
    let d = '';
    for (let i = 0; i < trailPositions.length; i++) {
      const pos = trailPositions[i];
      const svgY = svgTotalHeight - pos.y;
      const svgX = pos.x * 10; // Numeric coordinate for SVG viewBox 0..1000
      if (i === 0) {
        d += `M ${svgX} ${svgY} `;
      } else {
        const prev = trailPositions[i - 1];
        const prevY = svgTotalHeight - prev.y;
        const prevX = prev.x * 10;
        const midY = Math.round((prevY + svgY) / 2);
        // Orthogonal 90-degree steps:
        // 1. Vertical from prevY up to midY
        // 2. Horizontal from prevX to svgX at midY (90° bend)
        // 3. Vertical from midY up to svgY (90° bend)
        d += `L ${prevX} ${midY} L ${svgX} ${midY} L ${svgX} ${svgY} `;
      }
    }
    return d;
  };

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen w-full bg-[#e5a93a] text-slate-900 overflow-x-hidden pt-14"
    >

      {/* Top Banner: Finish Line Header at the very top */}
      <div className="relative z-10 max-w-2xl mx-auto pt-20 pb-8 text-center px-4">
        <div className="bg-white/95 border-2.5 border-slate-950 p-6 rounded-3xl shadow-2xl backdrop-blur-md">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#105e7b] text-white font-black text-xs uppercase tracking-wider shadow-md border border-slate-900 mb-3 animate-pulse">
            <Trophy className="w-4 h-4 text-[#e5a93a]" />
            <span>Chegada • 60 Anos da Unicamp</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
            A gestão de pessoas nos 60 anos da Unicamp
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 max-w-lg mx-auto mt-2 font-medium">
            Você percorreu mais de quatro décadas de transformações e dedicação pública na Unicamp.
          </p>
        </div>
      </div>

      {/* Giant Winding Board Canvas (5400px tall) */}
      <div className="relative w-full max-w-6xl mx-auto" style={{ height: `${svgTotalHeight}px` }}>
        {/* SVG Dashed Orthogonal Path with Dynamic ViewBox 0 0 1000 ${svgTotalHeight} */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox={`0 0 1000 ${svgTotalHeight}`}
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Discreet Dashed Gray Trail (matching the continuous timeline) */}
          <path
            d={buildSvgPath()}
            fill="none"
            stroke="#475569"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Stepping Node Points on Trail (Mathematically Centered at each tile position) */}
          {trailPositions.map((pos, idx) => {
            const svgY = svgTotalHeight - pos.y;
            const svgX = pos.x * 10;
            return (
              <g key={`svg-node-${idx}`}>
                <circle
                  cx={svgX}
                  cy={svgY}
                  r="6"
                  fill="#475569"
                  stroke="#ffffff"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/* The 12 Period Cards as Board Houses (Placements mathematically centered from bottom to top) */}
        {periods.map((period, idx) => {
          const pos = trailPositions[idx];
          const isCurrent = idx === currentTileIndex;
          const isVisited = visitedIndices.has(idx);
          const isStart = idx === 0;
          const isFinish = idx === totalTiles - 1;

          // Compute absolute top offset in pixels
          const topOffset = svgTotalHeight - pos.y;

          return (
            <div
              key={period.id}
              ref={(el) => {
                tileRefs.current[idx] = el;
              }}
              className="absolute z-20 transition-transform duration-300 crisp-card"
              style={{
                left: `${pos.x}%`,
                top: `${topOffset}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <BoardTile
                period={period}
                isCurrent={isCurrent}
                isVisited={isVisited}
                isStart={isStart}
                isFinish={isFinish}
                onClick={() => handleMove(idx)}
                onOpenDetail={() => onOpenDetail(period)}
              />
            </div>
          );
        })}

        {/* Start Line at the base of the board (near bottom) */}
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none z-10"
          style={{ top: `${svgTotalHeight - 20}px` }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#105e7b] text-white font-black text-xs uppercase tracking-wider shadow-md border-2 border-slate-900">
            <Flag className="w-4 h-4 text-[#e5a93a]" />
            <span>Ponto de Partida • 1983</span>
          </div>
          <p className="text-[11px] text-slate-500 font-bold mt-1">
            Gire o scroll ou jogue o dado para subir a trilha
          </p>
        </div>
      </div>

      {/* ================= FIXED PERIOD SUMMARY PANEL (VERSO DO CARD) ================= */}
      <aside
        className={`fixed z-30 transition-all duration-300 top-1/2 -translate-y-1/2 ${
          isPanelMinimized
            ? 'right-4 sm:right-6 w-auto'
            : 'inset-x-3 sm:inset-x-auto sm:right-6 lg:right-8 w-auto sm:w-88 lg:w-92 max-w-[calc(100vw-1.5rem)]'
        }`}
      >
        {isPanelMinimized ? (
          <button
            onClick={() => setIsPanelMinimized(false)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border-2 border-slate-950 shadow-2xl text-xs font-black text-slate-950 hover:bg-slate-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#105e7b]" />
            <span>Ver Resumo ({activePeriod.period})</span>
          </button>
        ) : (
          <div
            className={`rounded-2xl border-2.5 border-slate-950 p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xl text-white ${
              pureBgColors[activePeriod.index % pureBgColors.length]
            } transition-colors duration-500`}
            style={{ maxHeight: 'calc(100vh - 7rem)' }}
          >
            {/* Header of summary card */}
            <div className="flex items-center justify-between pb-2.5 border-b-2 border-white/20 shrink-0">
              <div className="flex items-center gap-2.5 text-left">
                <span className="w-6 h-6 rounded-md bg-white text-slate-950 font-black text-xs flex items-center justify-center border border-slate-900 shadow-xs shrink-0">
                  {activePeriod.index + 1}
                </span>
                <div className="min-w-0">
                  <span className="text-lg font-black text-white tracking-tight block leading-none">
                    {activePeriod.period}
                  </span>
                  <h4 className="text-xs font-black text-white/90 truncate max-w-[200px] sm:max-w-[230px] mt-0.5">
                    {activePeriod.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setIsPanelMinimized(true)}
                className="p-1 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-950 transition-colors cursor-pointer border border-white/40 shadow-xs shrink-0"
                title="Minimizar resumo"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Description quote */}
            {activePeriod.description && (
              <p className="text-xs text-white/85 line-clamp-2 my-2 font-medium leading-relaxed shrink-0">
                {activePeriod.description}
              </p>
            )}

            {/* Milestones Checklist (identical to back of card / verso do card) */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1 my-1 text-left max-h-52 sm:max-h-60">
              <div className="text-[11px] font-black text-white uppercase tracking-wider mb-1">
                Marcos Históricos:
              </div>
              {activePeriod.milestones.map((m) => (
                <div key={m.id} className="p-2.5 rounded-lg bg-white/10 border border-white/15 text-left text-xs text-white leading-snug">
                  {m.year && (
                    <span className="block font-black text-[#e5a93a] text-xs tracking-wider mb-0.5">
                      {m.year}
                    </span>
                  )}
                  <p className="font-bold text-white/95 text-xs">{m.text}</p>
                </div>
              ))}
            </div>

            {/* Bottom Action: Open Full Detail / Photos */}
            <div className="pt-2.5 border-t border-white/20 flex items-center justify-between shrink-0">
              <span className="text-xs text-white/80 font-bold">
                {activePeriod.photos.length} fotos no acervo
              </span>

              <button
                onClick={() => {
                  soundFx.playCardFlip();
                  onOpenDetail(activePeriod);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition-colors cursor-pointer shadow-md"
              >
                <span>Ver Acervo</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Floating Bottom Game Controls Bar */}
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 flex flex-wrap items-center justify-center gap-2 max-w-2xl w-full">
        {/* Dice Roller */}
        <DiceRoller onRoll={handleDiceRoll} disabled={isMoving} />

        {/* Current Pawn Location Card */}
        <div className="flex items-center gap-2.5 bg-white border-2 border-slate-900 p-2 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1 text-[10px] font-black text-[#105e7b]">
              <MapPin className="w-3 h-3 text-[#e5a93a]" />
              <span>Casa {currentTileIndex + 1} de {totalTiles}</span>
              <span className="text-slate-400 font-semibold">• {progressPercent}% explorado</span>
            </div>
            <div className="text-xs font-black text-slate-950 truncate max-w-[160px] sm:max-w-[190px]">
              {activePeriod.period} - {activePeriod.title}
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playCardFlip();
              onOpenDetail(activePeriod);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#105e7b] hover:bg-[#187fa1] text-white text-xs font-black border border-slate-900 shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Ver Marcos
          </button>
        </div>

        {/* Manual Stepper (Up / Down camera navigation) */}
        <div className="flex items-center bg-white border-2 border-slate-900 rounded-2xl p-1 shadow-md gap-0.5">
          <button
            onClick={() => {
              if (currentTileIndex > 0) {
                soundFx.playPawnHop();
                handleMove(currentTileIndex - 1);
              }
            }}
            disabled={currentTileIndex === 0 || isMoving}
            className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer text-slate-800"
            title="Descer para a casa anterior"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (currentTileIndex < totalTiles - 1) {
                soundFx.playPawnHop();
                handleMove(currentTileIndex + 1);
              }
            }}
            disabled={currentTileIndex === totalTiles - 1 || isMoving}
            className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-30 transition-colors cursor-pointer text-slate-800"
            title="Subir para a próxima casa"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>

        {/* Reset Trail to 1983 (Bottom) */}
        <button
          onClick={() => {
            soundFx.playCardTick();
            handleMove(0);
          }}
          className="p-2.5 rounded-2xl bg-white border-2 border-slate-900 hover:bg-slate-100 text-slate-900 shadow-md transition-colors cursor-pointer"
          title="Voltar à base da trilha (1983)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
