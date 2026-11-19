import { describe, it, expect } from 'vitest';
import { chessEngine } from '../src/games/chess/ChessEngine';
import { gomokuEngine } from '../src/games/gomoku/GomokuEngine';
import { checkersEngine } from '../src/games/checkers/CheckersEngine';
import { xiangqiEngine } from '../src/games/xiangqi/XiangqiEngine';

describe('Game Engines Test Suite', () => {
  describe('Chess Engine', () => {
    it('creates initial chess state with 20 legal moves for white', () => {
      const state = chessEngine.createInitialState();
      expect(state.game).toBe('chess');
      expect(state.currentPlayer).toBe('p1');
      expect(state.status).toBe('playing');
      const legalMoves = chessEngine.getLegalMoves(state);
      expect(legalMoves.length).toBe(20);
    });

    it('applies e2-e4 and changes turn to p2', () => {
      const state = chessEngine.createInitialState();
      // e2 is x: 4, y: 1; e4 is x: 4, y: 3
      const move = { from: { x: 4, y: 1 }, to: { x: 4, y: 3 } };
      expect(chessEngine.validateMove(state, move)).toBe(true);
      const nextState = chessEngine.applyMove(state, move);
      expect(nextState.currentPlayer).toBe('p2');
      expect(nextState.moveHistory.length).toBe(1);
    });
  });

  describe('Gomoku Engine', () => {
    it('starts with empty 15x15 board and 225 legal moves', () => {
      const state = gomokuEngine.createInitialState(15);
      expect(state.currentPlayer).toBe('p1');
      expect(state.status).toBe('playing');
      const moves = gomokuEngine.getLegalMoves(state);
      expect(moves.length).toBe(225);
    });

    it('detects horizontal win with 5 stones', () => {
      let state = gomokuEngine.createInitialState(15);
      // P1 plays (0,0), (1,0), (2,0), (3,0), (4,0)
      // P2 plays (0,1), (1,1), (2,1), (3,1)
      for (let i = 0; i < 4; i++) {
        state = gomokuEngine.applyMove(state, { to: { x: i, y: 0 } }); // P1
        state = gomokuEngine.applyMove(state, { to: { x: i, y: 1 } }); // P2
      }
      expect(state.status).toBe('playing');
      state = gomokuEngine.applyMove(state, { to: { x: 4, y: 0 } }); // P1 5th stone
      expect(state.status).toBe('won');
      expect(state.winner).toBe('p1');
    });
  });

  describe('Checkers Engine', () => {
    it('creates initial 8x8 checkers board on dark squares', () => {
      const state = checkersEngine.createInitialState();
      expect(state.game).toBe('checkers');
      expect(state.currentPlayer).toBe('p1');
      const legalMoves = checkersEngine.getLegalMoves(state);
      expect(legalMoves.length).toBeGreaterThan(0);
      // All piece coordinates should be on dark squares
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          if (state.board[y][x] !== null) {
            expect((x + y) % 2).toBe(1);
          }
        }
      }
    });

    it('enforces mandatory jump when capture is available', () => {
      const state = checkersEngine.createInitialState();
      // Put a P1 piece at (2,3) and a P2 piece at (3,2), empty at (4,1)
      state.board = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null));
      state.board[3][2] = { player: 'p1', type: 'man' };
      state.board[2][3] = { player: 'p2', type: 'man' };
      // P1 can jump from (2,3) to (4,1)
      const moves = checkersEngine.getLegalMoves(state, 'p1');
      expect(moves.length).toBe(1);
      expect(moves[0].to).toEqual({ x: 4, y: 1 });
      expect(moves[0].captured).toBe('3,2');
    });
  });

  describe('Xiangqi Engine', () => {
    it('initializes 9x10 board with generals in palaces', () => {
      const state = xiangqiEngine.createInitialState();
      expect(state.board[0][4]?.type).toBe('general');
      expect(state.board[0][4]?.player).toBe('p2');
      expect(state.board[9][4]?.type).toBe('general');
      expect(state.board[9][4]?.player).toBe('p1');
    });

    it('blocks horse movement when horse leg is obstructed', () => {
      const state = xiangqiEngine.createInitialState();
      // In initial state, red horse is at (1, 9) and (7, 9)
      // Leg at (1, 8) is empty, but leg at (2, 9) or (0, 9) has pieces
      const moves = xiangqiEngine.getLegalMoves(state);
      const horseMoves = moves.filter(m => m.from?.x === 1 && m.from?.y === 9);
      // Initial legal moves for Red horse at (1, 9): can go to (0, 7) or (2, 7)
      expect(horseMoves.length).toBe(2);
    });
  });
});
