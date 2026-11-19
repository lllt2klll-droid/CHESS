import React, { useState } from 'react';
import { GameType } from '@/types/game';
import { useGameStore } from '@/stores/useGameStore';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const GameSelectorCard: React.FC = () => {
  const { game, initGame, mode, aiLevel } = useGameStore();
  const [collapsed, setCollapsed] = useState(false);

  const games: Array<{
    type: GameType;
    name: string;
    icon: React.ReactNode;
  }> = [
    {
      type: 'chess',
      name: 'Cờ Vua',
      icon: (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white/90 to-amber-50/70 shadow-inner flex items-center justify-center text-2xl drop-shadow">
          ♟️
        </div>
      ),
    },
    {
      type: 'xiangqi',
      name: 'Cờ Tướng',
      icon: (
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-50 to-amber-100/90 border-2 border-red-500/80 shadow flex items-center justify-center font-bold text-red-600 text-lg">
          將
        </div>
      ),
    },
    {
      type: 'gomoku',
      name: 'Caro',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center relative">
          <span className="w-7 h-7 rounded-full bg-slate-950 shadow-md absolute left-1 top-2" />
          <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-300 shadow-md absolute right-1 bottom-2" />
        </div>
      ),
    },
    {
      type: 'checkers',
      name: 'Cờ Đam',
      icon: (
        <div className="w-12 h-12 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-[#5c3826] border-2 border-[#825239] shadow-md flex items-center justify-center text-xs text-amber-200 font-bold">
            👑
          </div>
        </div>
      ),
    },
  ];

  const handleSelectGame = (type: GameType) => {
    if (type !== game) {
      initGame(type, mode, aiLevel);
    }
  };

  return (
    <div className="flex flex-col items-center pointer-events-auto transition-all duration-300">
      {/* Hero Title Box */}
      <div className="liquid-glass-card rounded-3xl px-8 py-3.5 flex flex-col items-center shadow-glass relative group border border-white/80">
        {/* Glowing Knight Icon */}
        <div className="w-11 h-11 -mt-8 mb-1 rounded-2xl bg-gradient-to-tr from-white via-amber-50 to-white flex items-center justify-center shadow-lg border border-white/90 text-2xl animate-pulse">
          ♘
        </div>

        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide text-slate-900 drop-shadow-sm">
            Board Game Lounge
          </h1>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-white/50 text-slate-600 transition"
            title={collapsed ? 'Mở rộng menu trò chơi' : 'Thu gọn'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        <p className="text-xs font-semibold text-emerald-950/80 tracking-wider">
          — Relax • Play • Enjoy —
        </p>
      </div>

      {/* 4 Game Cards Grid */}
      {!collapsed && (
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 mt-3">
          {games.map((g) => {
            const isSelected = game === g.type;
            return (
              <button
                key={g.type}
                onClick={() => handleSelectGame(g.type)}
                type="button"
                className={`liquid-glass-card rounded-2xl p-2.5 sm:p-3 flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 bg-white/75 scale-105 shadow-xl'
                    : 'hover:bg-white/60 hover:scale-102 opacity-90'
                }`}
              >
                {g.icon}
                <span className={`text-xs font-bold tracking-tight ${isSelected ? 'text-emerald-950 font-extrabold' : 'text-slate-800'}`}>
                  {g.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
