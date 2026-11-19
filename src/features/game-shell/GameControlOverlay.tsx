import React from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { RotateCcw, Undo2, Loader2, Trophy } from 'lucide-react';
import { GlassPill } from '@/components/glass/GlassPill';

export const GameControlOverlay: React.FC = () => {
  const { gameState, mode, undo, restart, isAIThinking, historyStates } = useGameStore();

  const isTerminal =
    gameState.status === 'checkmate' ||
    gameState.status === 'won' ||
    gameState.status === 'draw' ||
    gameState.status === 'stalemate';

  const currentPlayerLabel =
    gameState.currentPlayer === 'p1' ? 'Người chơi 1' : mode === 'ai' ? 'Máy' : 'Người chơi 2';

  return (
    <div className="flex flex-col items-center gap-2 pointer-events-auto">
      {/* Game Status Banner */}
      <div className="liquid-glass-pill px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-slate-800 shadow-glass border border-white/80">
        {isAIThinking ? (
          <div className="flex items-center gap-2 text-amber-700">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Máy đang suy nghĩ...</span>
          </div>
        ) : isTerminal ? (
          <div className="flex items-center gap-1.5 text-emerald-700">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              {gameState.winner
                ? `${gameState.winner === 'p1' ? 'Người chơi 1' : 'Người chơi 2'} Chiến thắng!`
                : 'Ván cờ kết thúc Hòa'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                gameState.currentPlayer === 'p1' ? 'bg-amber-400 ring-2 ring-amber-300' : 'bg-slate-800'
              }`}
            />
            <span>Lượt đi: {currentPlayerLabel}</span>
            {gameState.isCheck && (
              <span className="text-red-600 bg-red-100/80 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                Chiếu!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Undo & Restart Controls */}
      <div className="flex items-center gap-2">
        <GlassPill
          onClick={undo}
          disabled={historyStates.length === 0 || isAIThinking}
          className={historyStates.length === 0 || isAIThinking ? 'opacity-40 cursor-not-allowed' : ''}
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="text-xs">Đi lại</span>
        </GlassPill>

        <GlassPill onClick={restart}>
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-xs">Ván mới</span>
        </GlassPill>
      </div>
    </div>
  );
};
