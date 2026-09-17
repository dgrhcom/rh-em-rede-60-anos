import React, { useState } from 'react';
import { soundFx } from '../utils/soundEffects';
import { Volume2, VolumeX, Award } from 'lucide-react';

interface HeaderProps {
  unlockedCount: number;
  totalCount: number;
  onOpenAchievements: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unlockedCount,
  totalCount,
  onOpenAchievements,
}) => {
  const [soundActive, setSoundActive] = useState(soundFx.isEnabled());

  const handleToggleSound = () => {
    const newState = soundFx.toggle();
    setSoundActive(newState);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-transparent px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: DGRH Logo & Prominent Page Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center gap-3 select-none">
            {/* Enlarged Official DGRH SVG Logo */}
            <img
              src="/logo_dgrh.svg"
              alt="DGRH - Diretoria Geral de Recursos Humanos"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain drop-shadow-xs"
            />

            <div className="h-8 w-px bg-slate-950/20 hidden sm:block" />

            <div className="flex flex-col text-left">
              <h1 className="text-sm sm:text-base md:text-xl font-black text-slate-950 tracking-tight leading-tight">
                A Gestão de Pessoas nos 60 Anos da Unicamp
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Actions (Achievements, Sound, Info) */}
        <div className="flex items-center gap-2">
          {/* Achievements badge button */}
          <button
            onClick={() => {
              soundFx.playCardTick();
              onOpenAchievements();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border-2 border-slate-900 text-xs font-black transition-all shadow-xs group cursor-pointer"
            title="Ver Conquistas e Marcos Históricos Desbloqueados"
          >
            <Award className="w-4 h-4 text-[#e5a93a] group-hover:scale-110 transition-transform" />
            <span className="font-extrabold text-[#105e7b]">{unlockedCount}</span>
            <span className="text-slate-400 hidden md:inline">/{totalCount}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-1.5 rounded-lg border-2 border-slate-900 text-xs font-bold transition-colors cursor-pointer ${
              soundActive
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
            title={soundActive ? 'Efeitos sonoros ativados (Clique para silenciar)' : 'Efeitos sonoros desativados (Clique para ativar)'}
          >
            {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
