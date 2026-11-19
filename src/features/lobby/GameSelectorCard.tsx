import React, { useState } from 'react';
import { GameType } from '@/types/game';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';

interface Props {
  onStartGame: () => void;
}

const GAMES: Array<{ type: GameType; name: string; emoji: string; desc: string }> = [
  { type: 'chess',    name: 'Cờ Vua',   emoji: '♟️',  desc: 'Chess' },
  { type: 'xiangqi',  name: 'Cờ Tướng', emoji: '將',   desc: 'Xiangqi' },
  { type: 'gomoku',   name: 'Caro',      emoji: '⬛',  desc: 'Gomoku 15×15' },
  { type: 'checkers', name: 'Cờ Đam',   emoji: '🔴',  desc: 'Checkers' },
];

export const GameSelectorCard: React.FC<Props> = ({ onStartGame }) => {
  const { game, initGame, mode, aiLevel } = useGameStore();
  const { preferredMode, aiLevel: settingsAI } = useSettingsStore();
  const [selectedMode, setSelectedMode] = useState<'local' | 'ai'>('local');

  const handlePlay = (type: GameType) => {
    initGame(type, selectedMode, settingsAI);
    onStartGame();
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm">
      {/* Hero title pill */}
      <div className="liquid-glass-card rounded-3xl px-6 py-3 flex flex-col items-center shadow-glass border border-white/80 w-full">
        {/* Knight icon */}
        <div className="w-10 h-10 -mt-7 mb-1 rounded-2xl bg-gradient-to-tr from-white via-amber-50 to-white flex items-center justify-center shadow-lg border border-white/90 text-xl animate-pulse">
          ♘
        </div>
        <h1 className="text-lg sm:text-xl font-extrabold tracking-wide text-slate-900 drop-shadow-sm">
          Board Game Lounge
        </h1>
        <p className="text-[11px] font-semibold text-emerald-900/70 tracking-widest mt-0.5">
          — Relax · Play · Enjoy —
        </p>

        {/* Mode toggle */}
        <div className="flex gap-1.5 mt-2.5 bg-white/30 p-1 rounded-full">
          <button
            onClick={() => setSelectedMode('local')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedMode === 'local'
                ? 'bg-white shadow text-emerald-900'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            👥 2 người
          </button>
          <button
            onClick={() => setSelectedMode('ai')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedMode === 'ai'
                ? 'bg-white shadow text-emerald-900'
                : 'text-slate-600 hover:bg-white/50'
            }`}
          >
            🤖 vs Máy
          </button>
        </div>
      </div>

      {/* 4 game buttons */}
      <div className="grid grid-cols-4 gap-2 w-full">
        {GAMES.map((g) => (
          <button
            key={g.type}
            onClick={() => handlePlay(g.type)}
            type="button"
            className={`liquid-glass-card rounded-2xl py-2.5 px-1 flex flex-col items-center gap-1 transition-all duration-200 active:scale-95 hover:scale-105 hover:bg-white/70 border border-white/70 shadow-glass ${
              game === g.type ? 'ring-2 ring-emerald-500 bg-white/75' : ''
            }`}
          >
            <span className="text-2xl leading-none">{g.emoji}</span>
            <span className="text-[10px] font-bold text-slate-800 leading-tight text-center">
              {g.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
