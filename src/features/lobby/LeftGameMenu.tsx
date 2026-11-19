import React, { useState } from 'react';
import { GameType, GameMode } from '@/types/game';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { ChevronRight, Gamepad2, Users, Bot, Layers, X } from 'lucide-react';

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
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/40 flex items-center justify-center text-base sm:text-lg drop-shadow shrink-0">
        ♘
      </div>
    ),
  },
  {
    type: 'xiangqi',
    name: 'Cờ Tướng',
    renderIcon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-50 border border-red-500/80 flex items-center justify-center text-red-600 font-bold text-xs sm:text-sm shadow-sm shrink-0">
        將
      </div>
    ),
  },
  {
    type: 'gomoku',
    name: 'Caro',
    renderIcon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/40 flex items-center justify-center text-slate-700 font-bold text-xs sm:text-sm shrink-0 tracking-tighter">
        #
      </div>
    ),
  },
  {
    type: 'checkers',
    name: 'Cờ Đam',
    renderIcon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#d4a86a] border-2 border-[#5c3826] flex items-center justify-center text-[9px] text-white shadow-sm font-bold">
          ●
        </div>
      </div>
    ),
  },
];

export const LeftGameMenu: React.FC<Props> = ({ onStartGame }) => {
  const { game, mode, aiLevel, initGame } = useGameStore();
  const { setPreferredMode } = useSettingsStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelectGame = (type: GameType) => {
    initGame(type, mode, aiLevel);
    setMobileOpen(false);
    if (onStartGame) onStartGame();
  };

  const handleSelectMode = (newMode: GameMode) => {
    setPreferredMode(newMode);
    initGame(game, newMode, aiLevel);
  };

  const currentGameName = GAMES.find((g) => g.type === game)?.name || 'Cờ Vua';

  return (
    <div className="pointer-events-auto select-none">
      {/* ── Mobile Compact Trigger Button (visible only on mobile) ── */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          type="button"
          className="liquid-glass-pill rounded-full px-3 py-1.5 flex items-center gap-2 shadow-glass border border-white/80 active:scale-95 transition cursor-pointer text-slate-800 font-bold text-xs"
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>{currentGameName}</span>
          <span className="text-[10px] text-slate-500 font-normal">
            ({mode === 'local' ? '2 người' : 'Vs Máy'})
          </span>
        </button>
      </div>

      {/* ── Menu Card: Always visible on sm+, and modal overlay on mobile ── */}
      <div
        className={`${
          mobileOpen
            ? 'flex fixed inset-0 z-50 bg-black/30 backdrop-blur-sm items-center justify-center p-4'
            : 'hidden sm:flex flex-col gap-3'
        }`}
      >
        <div className="liquid-glass-card rounded-[28px] p-3 w-64 sm:w-56 flex flex-col gap-2.5 shadow-2xl sm:shadow-glass border border-white/80 relative animate-fade-in">
          {/* Close button on mobile modal */}
          {mobileOpen && (
            <div className="flex items-center justify-between pb-1 border-b border-white/40">
              <span className="text-xs font-bold text-slate-800">Chọn trò chơi</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-6 h-6 rounded-full bg-white/40 hover:bg-white/70 flex items-center justify-center text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 4 Games List */}
          <div className="flex flex-col gap-1.5">
            {GAMES.map((item) => {
              const isSelected = game === item.type;
              return (
                <button
                  key={item.type}
                  onClick={() => handleSelectGame(item.type)}
                  type="button"
                  className={`w-full flex items-center justify-between px-3 py-2 sm:py-2.5 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white font-bold shadow-md scale-[1.02]'
                      : 'hover:bg-white/50 text-slate-800 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {item.renderIcon()}
                    <span className="text-xs sm:text-sm tracking-wide">{item.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                  />
                </button>
              );
            })}
          </div>

          {/* Game Mode Selector */}
          <div className="pt-2 border-t border-white/40 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 px-1">
              <Gamepad2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>Chế độ chơi</span>
            </div>

            <div className="grid grid-cols-2 gap-1 bg-black/5 p-1 rounded-xl">
              <button
                onClick={() => handleSelectMode('local')}
                type="button"
                className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'local'
                    ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/40'
                }`}
              >
                <Users className="w-3 h-3 shrink-0" />
                <span>Hai người</span>
              </button>

              <button
                onClick={() => handleSelectMode('ai')}
                type="button"
                className={`py-1.5 px-1 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
                  mode === 'ai'
                    ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-sm'
                    : 'text-slate-700 hover:bg-white/40'
                }`}
              >
                <Bot className="w-3 h-3 shrink-0" />
                <span>Vs Máy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
