import React, { useState } from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { RotateCcw, Undo2, Loader2, Trophy, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

interface Props {
  onBackToLobby: () => void;
}

const GAME_LABELS: Record<string, string> = {
  chess: 'Cờ Vua', xiangqi: 'Cờ Tướng', gomoku: 'Caro', checkers: 'Cờ Đam',
};

export const GameControlOverlay: React.FC<Props> = ({ onBackToLobby }) => {
  const { gameState, game, mode, aiLevel, undo, restart, isAIThinking, historyStates, setAILevel } = useGameStore();
  const { aiLevel: settingsAI } = useSettingsStore();
  const [expanded, setExpanded] = useState(false);

  const isTerminal =
    gameState.status === 'checkmate' ||
    gameState.status === 'won'       ||
    gameState.status === 'draw'      ||
    gameState.status === 'stalemate';

  const currentPlayerLabel =
    gameState.currentPlayer === 'p1'
      ? 'Người chơi 1'
      : mode === 'ai' ? '🤖 Máy' : 'Người chơi 2';

  const statusDot = (
    <span
      className={`w-2 h-2 rounded-full shrink-0 ${
        gameState.currentPlayer === 'p1' ? 'bg-amber-400 ring-2 ring-amber-300' : 'bg-slate-800'
      }`}
    />
  );

  return (
    <div className="flex flex-col items-center gap-1.5 w-full max-w-xs sm:max-w-sm">

      {/* ── Main HUD pill ── */}
      <div className="liquid-glass-pill w-full px-3 py-2 rounded-2xl flex items-center justify-between gap-2 border border-white/80 shadow-glass">

        {/* Back button */}
        <button
          onClick={onBackToLobby}
          className="p-1.5 rounded-full hover:bg-white/50 transition shrink-0"
          title="Quay về chọn trò chơi"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>

        {/* Game name + status */}
        <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
          {isAIThinking ? (
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Máy đang nghĩ...</span>
            </div>
          ) : isTerminal ? (
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>
                {gameState.winner
                  ? `${gameState.winner === 'p1' ? 'Người chơi 1' : (mode === 'ai' ? '🤖 Máy' : 'Người chơi 2')} thắng!`
                  : 'Ván cờ Hòa'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              {statusDot}
              <span className="truncate">{GAME_LABELS[game]} · {currentPlayerLabel}</span>
              {gameState.isCheck && (
                <span className="text-red-600 bg-red-100/80 px-1.5 py-0.5 rounded-full text-[10px] animate-pulse font-bold">
                  Chiếu!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons inline */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={undo}
            disabled={historyStates.length === 0 || isAIThinking}
            title="Đi lại"
            className="p-1.5 rounded-full hover:bg-white/50 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <Undo2 className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={restart}
            title="Ván mới"
            className="p-1.5 rounded-full hover:bg-white/50 transition"
          >
            <RotateCcw className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Thu gọn' : 'Mở rộng'}
            className="p-1.5 rounded-full hover:bg-white/50 transition"
          >
            {expanded
              ? <ChevronUp   className="w-4 h-4 text-slate-500" />
              : <ChevronDown className="w-4 h-4 text-slate-500" />
            }
          </button>
        </div>
      </div>

      {/* ── Expanded panel (AI level, move count) ── */}
      {expanded && (
        <div className="liquid-glass-card w-full rounded-2xl px-4 py-3 border border-white/80 shadow-glass animate-fade-in">
          {/* Move counter */}
          <div className="flex justify-between text-xs text-slate-600 mb-2">
            <span>Nước đi:</span>
            <span className="font-bold text-slate-800">{gameState.moveHistory?.length ?? 0}</span>
          </div>

          {/* AI level picker — only in AI mode */}
          {mode === 'ai' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 shrink-0">Độ khó:</span>
              <div className="flex gap-1 flex-1">
                {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setAILevel(lvl)}
                    className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition ${
                      aiLevel === lvl
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-white/50 text-slate-600 hover:bg-white/70'
                    }`}
                  >
                    {lvl === 'easy' ? 'Dễ' : lvl === 'medium' ? 'TB' : 'Khó'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick restart */}
          <button
            onClick={() => { restart(); setExpanded(false); }}
            className="mt-2 w-full py-1.5 rounded-xl bg-white/50 hover:bg-white/70 text-xs font-bold text-slate-700 transition"
          >
            🔄 Bắt đầu lại
          </button>
          <button
            onClick={onBackToLobby}
            className="mt-1 w-full py-1.5 rounded-xl bg-white/30 hover:bg-white/50 text-xs font-semibold text-slate-600 transition"
          >
            ← Chọn trò chơi khác
          </button>
        </div>
      )}
    </div>
  );
};
