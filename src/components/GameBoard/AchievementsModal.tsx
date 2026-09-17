import React from 'react';
import type { HistoricalPeriod } from '../../types/timeline';
import { soundFx } from '../../utils/soundEffects';
import { X, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';

interface AchievementsModalProps {
  periods: HistoricalPeriod[];
  visitedIndices: Set<number>;
  isOpen: boolean;
  onClose: () => void;
  onSelectPeriod: (index: number) => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  periods,
  visitedIndices,
  isOpen,
  onClose,
  onSelectPeriod,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white border-3 border-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col text-left text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e5a93a] border-2 border-slate-900 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-950 tracking-tight">
                Galeria de Conquistas Históricas
              </h3>
              <p className="text-xs text-slate-600 font-bold">
                {visitedIndices.size} de {periods.length} fases comemorativas exploradas
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playCardTick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges List */}
        <div className="py-4 overflow-y-auto space-y-3 flex-1 pr-1">
          {periods.map((period, idx) => {
            const isUnlocked = visitedIndices.has(idx);

            return (
              <div
                key={period.id}
                onClick={() => {
                  soundFx.playCardTick();
                  onSelectPeriod(idx);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border-2 flex items-center gap-3.5 transition-all cursor-pointer ${
                  isUnlocked
                    ? 'bg-amber-50/70 border-slate-900 hover:bg-amber-100/70 shadow-xs'
                    : 'bg-slate-50 border-slate-300 opacity-60 hover:opacity-85'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-900 ${
                    isUnlocked
                      ? 'bg-[#105e7b] text-[#e5a93a]'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isUnlocked ? <Sparkles className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-950">
                      {period.badge.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-300 text-[#105e7b] font-black">
                      {period.period}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5 font-medium">
                    {period.badge.description}
                  </p>
                </div>

                {isUnlocked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">
                    Bloqueado
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t-2 border-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-colors cursor-pointer"
          >
            Continuar Explorando
          </button>
        </div>
      </div>
    </div>
  );
};
