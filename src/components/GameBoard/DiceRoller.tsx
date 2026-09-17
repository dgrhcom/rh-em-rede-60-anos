import React, { useState } from 'react';
import { soundFx } from '../../utils/soundEffects';
import { Dices, Sparkles } from 'lucide-react';

interface DiceRollerProps {
  onRoll: (value: number) => void;
  disabled: boolean;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll, disabled }) => {
  const [currentFace, setCurrentFace] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const handleRoll = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    soundFx.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setCurrentFace(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setCurrentFace(finalValue);
        setIsRolling(false);
        onRoll(finalValue);
      }
    }, 60);
  };

  const renderDots = (num: number) => {
    switch (num) {
      case 1:
        return <div className="w-3.5 h-3.5 rounded-full bg-[#105e7b]" />;
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b] self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b] self-center" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b] self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-1.5">
            <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
            <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#105e7b]" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 p-1.5 gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
            <div className="w-2 h-2 rounded-full bg-[#105e7b]" />
          </div>
        );
    }
  };

  return (
    <div className="flex items-center gap-3 bg-white/95 border-2 border-slate-900 p-2 sm:p-2.5 rounded-2xl shadow-lg backdrop-blur-md">
      {/* 3D-styled Dice Cube */}
      <div
        className={`w-12 h-12 rounded-xl bg-white border-2 border-slate-900 shadow-md flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          isRolling ? 'rotate-180 scale-110' : 'hover:scale-105'
        }`}
        onClick={handleRoll}
        title="Clique para Rolar o Dado"
      >
        {renderDots(currentFace)}
      </div>

      {/* Action Button & Help */}
      <div className="flex flex-col text-left">
        <button
          onClick={handleRoll}
          disabled={disabled || isRolling}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#e5a93a] hover:bg-[#b8801a] text-slate-950 font-black text-xs border-2 border-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          <Dices className="w-4 h-4" />
          <span>{isRolling ? 'Rolando...' : 'Jogar Dado'}</span>
        </button>
        <span className="text-[10px] text-slate-600 font-bold mt-1 flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-[#105e7b]" />
          Avança de 1 a 6 casas
        </span>
      </div>
    </div>
  );
};
