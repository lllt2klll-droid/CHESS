import React, { useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { RotateCcw, Undo2, Loader2, Trophy, ArrowLeft, Bot, Sparkles } from 'lucide-react';

interface Props {
  onBackToLobby: () => void;
}

const GAME_NAMES: Record<string, string> = {
  chess: 'Cờ Vua',
  xiangqi: 'Cờ Tướng',
  gomoku: 'Caro',
  checkers: 'Cờ Đam',
};

export const GameControlOverlay: React.FC<Props> = ({ onBackToLobby }) => {
  const { gameState, game, mode, aiLevel, undo, restart, isAIThinking, historyStates, setAILevel } =
    useGameStore();

  const isTerminal =
    gameState.status === 'checkmate' ||
    gameState.status === 'won' ||
    gameState.status === 'draw' ||
    gameState.status === 'stalemate';

  const currentPlayerLabel =
    gameState.currentPlayer === 'p1'
      ? 'Lượt: Người chơi 1'
      : mode === 'ai'
      ? 'Lượt: Máy 🤖'
      : 'Lượt: Người chơi 2';

  return (
    <div className="flex flex-col items-center gap-1.5 pointer-events-auto select-none">
      {/* ── Floating In-Game Glass Capsule ── */}
      <div className="liquid-glass-pill rounded-full px-3 py-1.5 flex items-center gap-3 shadow-glass border border-white/80">
        {/* Back to lobby */}
        <button
          onClick={onBackToLobby}
          type="button"
          className="w-8 h-8 rounded-full bg-white/40 hover:bg-white/70 active:scale-95 flex items-center justify-center transition cursor-pointer text-slate-700"
          title="Quay lại sảnh"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Game Title + Turn / Status */}
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs text-slate-900">
            {GAME_NAMES[game]}
          </span>
          <span className="text-slate-400 text-xs">•</span>

          {isAIThinking ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Máy đang suy nghĩ...</span>
            </div>
          ) : isTerminal ? (
            <div className="flex items-center gap-1 text-xs font-extrabold text-emerald-700">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>
                {gameState.winner
                  ? `${gameState.winner === 'p1' ? 'Người chơi 1' : mode === 'ai' ? 'Máy' : 'Người chơi 2'} Thắng!`
                  : 'Hòa cờ!'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  gameState.currentPlayer === 'p1'
                    ? 'bg-amber-400 ring-2 ring-amber-300'
                    : 'bg-slate-800'
                }`}
              />
              <span>{currentPlayerLabel}</span>
              {gameState.isCheck && (
                <span className="bg-red-500 text-white font-extrabold text-[10px] px-1.5 py-0.5 rounded-full animate-pulse ml-1">
                  Chiếu!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons: Undo & Restart */}
        <div className="flex items-center gap-1 border-l border-slate-300/40 pl-2">
          <button
            onClick={undo}
            disabled={historyStates.length === 0 || isAIThinking}
            type="button"
            className="p-1.5 rounded-full hover:bg-white/50 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed text-slate-700"
            title="Đi lại (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={restart}
            type="button"
            className="p-1.5 rounded-full hover:bg-white/50 active:scale-95 transition text-slate-700"
            title="Chơi lại ván mới"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
