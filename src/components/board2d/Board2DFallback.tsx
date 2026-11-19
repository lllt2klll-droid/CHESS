import React from 'react';
import { useGameStore } from '@/stores/useGameStore';
import { Chess } from 'chess.js';

export const Board2DFallback: React.FC = () => {
  const { game, gameState, selectedCoord, legalTargets, selectCoord } = useGameStore();

  if (game === 'chess') {
    const chess = new Chess(gameState.fen);
    const board = chess.board();

    return (
      <div className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] grid grid-cols-8 grid-rows-8 border-4 border-amber-900 rounded-xl overflow-hidden shadow-2xl bg-amber-100">
        {board.map((row, rIdx) =>
          row.map((piece, cIdx) => {
            const coord = { x: cIdx, y: 7 - rIdx };
            const isDark = (cIdx + rIdx) % 2 === 1;
            const isSelected = selectedCoord?.x === coord.x && selectedCoord?.y === coord.y;
            const isTarget = legalTargets.some((t) => t.x === coord.x && t.y === coord.y);

            const pieceSymbols: Record<string, string> = {
              wp: '♙', wn: '♘', wb: '♗', wr: '♖', wq: '♕', wk: '♔',
              bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
            };
            const symbol = piece ? pieceSymbols[`${piece.color}${piece.type}`] : '';

            return (
              <button
                key={`c-${cIdx}-${rIdx}`}
                onClick={() => selectCoord(coord)}
                className={`flex items-center justify-center text-3xl sm:text-4xl transition-colors relative ${
                  isSelected
                    ? 'bg-emerald-400'
                    : isTarget
                    ? 'bg-sky-300'
                    : isDark
                    ? 'bg-[#855335] text-amber-50'
                    : 'bg-[#f7eed8] text-amber-950'
                }`}
              >
                {symbol}
                {isTarget && !piece && (
                  <span className="w-3 h-3 rounded-full bg-sky-600 opacity-80" />
                )}
              </button>
            );
          })
        )}
      </div>
    );
  }

  if (game === 'gomoku') {
    const grid: (('p1' | 'p2') | null)[][] = gameState.grid;
    return (
      <div className="w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] grid grid-cols-15 grid-rows-15 border-4 border-amber-950 bg-[#e8c799] p-2 rounded-xl shadow-2xl">
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <button
              key={`g-${x}-${y}`}
              onClick={() => selectCoord({ x, y })}
              className="border border-amber-900/30 flex items-center justify-center relative hover:bg-amber-400/20"
            >
              {cell === 'p1' && <span className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />}
              {cell === 'p2' && <span className="w-4 h-4 rounded-full bg-slate-50 border border-slate-300 shadow-md" />}
            </button>
          ))
        )}
      </div>
    );
  }

  if (game === 'checkers') {
    const board = gameState.board;
    return (
      <div className="w-[360px] h-[360px] sm:w-[440px] sm:h-[440px] grid grid-cols-8 grid-rows-8 border-4 border-amber-900 rounded-xl overflow-hidden shadow-2xl">
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            const isDark = (x + y) % 2 === 1;
            const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
            const isTarget = legalTargets.some((t) => t.x === x && t.y === y);

            return (
              <button
                key={`chk-${x}-${y}`}
                onClick={() => selectCoord({ x, y })}
                className={`flex items-center justify-center transition-colors relative ${
                  isSelected
                    ? 'bg-emerald-400'
                    : isTarget
                    ? 'bg-sky-300'
                    : isDark
                    ? 'bg-[#5c3826]'
                    : 'bg-[#f5edd6]'
                }`}
              >
                {piece && (
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full shadow-lg flex items-center justify-center font-bold text-xs ${
                      piece.player === 'p1'
                        ? 'bg-amber-100 border-2 border-amber-300 text-amber-900'
                        : 'bg-stone-900 border-2 border-stone-700 text-amber-400'
                    }`}
                  >
                    {piece.type === 'king' ? '👑' : ''}
                  </div>
                )}
                {isTarget && !piece && (
                  <span className="w-3 h-3 rounded-full bg-sky-500" />
                )}
              </button>
            );
          })
        )}
      </div>
    );
  }

  if (game === 'xiangqi') {
    const board = gameState.board;
    const labels: Record<string, { red: string; black: string }> = {
      general: { red: '帥', black: '將' },
      advisor: { red: '仕', black: '士' },
      elephant: { red: '相', black: '象' },
      horse: { red: '傌', black: '馬' },
      chariot: { red: '俥', black: '車' },
      cannon: { red: '炮', black: '砲' },
      soldier: { red: '兵', black: '卒' },
    };

    return (
      <div className="w-[360px] h-[400px] sm:w-[440px] sm:h-[490px] grid grid-cols-9 grid-rows-10 border-4 border-amber-900 bg-[#edd5b3] p-1 rounded-xl shadow-2xl">
        {board.map((row: any[], y: number) =>
          row.map((piece: any, x: number) => {
            const isSelected = selectedCoord?.x === x && selectedCoord?.y === y;
            const isTarget = legalTargets.some((t) => t.x === x && t.y === y);
            const isRed = piece?.player === 'p1';
            const label = piece ? (isRed ? labels[piece.type].red : labels[piece.type].black) : '';

            return (
              <button
                key={`xq-${x}-${y}`}
                onClick={() => selectCoord({ x, y })}
                className={`border border-amber-950/20 flex items-center justify-center text-sm sm:text-base font-bold relative ${
                  isSelected ? 'bg-emerald-300/60' : isTarget ? 'bg-sky-300/60' : ''
                }`}
              >
                {piece && (
                  <div
                    className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shadow bg-amber-50 border-2 ${
                      isRed ? 'border-red-600 text-red-600' : 'border-slate-900 text-slate-900'
                    }`}
                  >
                    {label}
                  </div>
                )}
                {isTarget && !piece && (
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600" />
                )}
              </button>
            );
          })
        )}
      </div>
    );
  }

  return null;
};
