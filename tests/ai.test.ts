import { describe, it, expect } from 'vitest';
import { computeAIMove } from '../src/ai/aiOpponent';
import { chessEngine } from '../src/games/chess/ChessEngine';
import { gomokuEngine } from '../src/games/gomoku/GomokuEngine';
import { checkersEngine } from '../src/games/checkers/CheckersEngine';
import { xiangqiEngine } from '../src/games/xiangqi/XiangqiEngine';

describe('AI Opponents Test Suite', () => {
  it('computes legal move for Chess at medium level', async () => {
    const state = chessEngine.createInitialState();
    const move = await computeAIMove('chess', state, 'medium');
    expect(move).not.toBeNull();
    expect(chessEngine.validateMove(state, move!)).toBe(true);
  });

  it('computes legal move for Gomoku at medium level', async () => {
    const state = gomokuEngine.createInitialState(15);
    const move = await computeAIMove('gomoku', state, 'medium');
    expect(move).not.toBeNull();
    expect(gomokuEngine.validateMove(state, move!)).toBe(true);
  });

  it('computes legal move for Checkers at medium level', async () => {
    const state = checkersEngine.createInitialState();
    const move = await computeAIMove('checkers', state, 'medium');
    expect(move).not.toBeNull();
    expect(checkersEngine.validateMove(state, move!)).toBe(true);
  });

  it('computes legal move for Xiangqi at medium level', async () => {
    const state = xiangqiEngine.createInitialState();
    const move = await computeAIMove('xiangqi', state, 'medium');
    expect(move).not.toBeNull();
    expect(xiangqiEngine.validateMove(state, move!)).toBe(true);
  });
});
