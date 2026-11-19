import React from 'react';
import { GameType, GameMode } from '@/types/game';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ChevronRight, Gamepad2, Users, Bot } from 'lucide-react';

interface Props {
  onStartGame?: () => void;
}

interface GameItem {
  type: GameType;
  name: string;
  renderIcon: () => React.ReactNode;
}

const GAMES: GameItem[] = [
  {
    type: 'chess',
    name: 'Cờ Vua',
    renderIcon: () => (
      <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-lg drop-shadow shrink-0">
        ♘
      </div>
    ),
  },
  {
    type: 'xiangqi',
    name: 'Cờ Tướng',
    renderIcon: () => (
      <div className="w-8 h-8 rounded-full bg-amber-50 border border-red-500/80 flex items-center justify-center text-red-600 font-bold text-sm shadow-sm shrink-0">
        將
      </div>
    ),
  },
  {
    type: 'gomoku',
    name: 'Caro',
    renderIcon: () => (
      <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 tracking-tighter">
        #
      </div>
    ),
  },
  {
    type: 'checkers',
    name: 'Cờ Đam',
    renderIcon: () => (
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <div className="w-6 h-6 rounded-full bg-[#d4a86a] border-2 border-[#5c3826] flex items-center justify-center text-[10px] text-white shadow-sm font-bold">
          ●
        </div>
      </div>
    ),
  },
];

export const LeftGameMenu: React.FC<Props> = ({ onStartGame }) => {
  const { game, mode, aiLevel, initGame } = useGameStore();
  const { setPreferredMode } = useSettingsStore();

  const handleSelectGame = (type: GameType) => {
    initGame(type, mode, aiLevel);
    if (onStartGame) onStartGame();
  };

  const handleSelectMode = (newMode: GameMode) => {
    setPreferredMode(newMode);
    initGame(game, newMode, aiLevel);
  };

  return (
    <div className="flex flex-col gap-3 pointer-events-auto select-none">
      {/* ── 4-Game Vertical Card ── */}
      <div className="liquid-glass-card rounded-[28px] p-2.5 w-52 sm:w-56 flex flex-col gap-1.5 shadow-glass border border-white/80">
        {GAMES.map((item) => {
          const isSelected = game === item.type;
          return (
            <button
              key={item.type}
              onClick={() => handleSelectGame(item.type)}
              type="button"
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                isSelected
                  ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white font-bold shadow-md scale-[1.02]'
                  : 'hover:bg-white/50 text-slate-800 font-semibold'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.renderIcon()}
                <span className="text-sm tracking-wide">{item.name}</span>
              </div>
              <ChevronRight
                className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`}
              />
            </button>
          );
        })}
      </div>

      {/* ── Chế độ chơi (Game Mode Selector) ── */}
      <div className="liquid-glass-card rounded-[24px] p-3 w-52 sm:w-56 flex flex-col gap-2 shadow-glass border border-white/80">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 px-1">
          <Gamepad2 className="w-4 h-4 text-emerald-800" />
          <span>Chế độ chơi</span>
        </div>

        {/* 2-Mode Pills */}
        <div className="grid grid-cols-2 gap-1.5 bg-black/5 p-1 rounded-2xl">
          <button
            onClick={() => handleSelectMode('local')}
            type="button"
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === 'local'
                ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/40'
            }`}
          >
            <Users className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Hai người</span>
          </button>

          <button
            onClick={() => handleSelectMode('ai')}
            type="button"
            className={`py-2 px-1.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
              mode === 'ai'
                ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-sm'
                : 'text-slate-700 hover:bg-white/40'
            }`}
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Vs Máy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
