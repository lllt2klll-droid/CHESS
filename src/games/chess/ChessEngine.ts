import { Chess, Square, PieceSymbol } from 'chess.js';
import { BaseGameState, BoardCoordinate, GameEngine, GenericMove, PlayerId, GameStatus } from '@/types/game';

export interface ChessGameState extends BaseGameState {
  game: 'chess';
  fen: string;
  board: (PieceSymbol | null)[][]; // 8x8 (row 0=rank 8 to row 7=rank 1, or indexed by y)
  turn: 'w' | 'b';
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
}

export const coordToSquare = (coord: BoardCoordinate): Square => {
  const files = 'abcdefgh';
  return `${files[coord.x]}${coord.y + 1}` as Square;
};

export const squareToCoord = (square: string): BoardCoordinate => {
  const files = 'abcdefgh';
  return {
    x: files.indexOf(square[0]),
    y: parseInt(square[1], 10) - 1,
  };
};

export class ChessEngineImpl implements GameEngine<ChessGameState, GenericMove> {
  createInitialState(fen?: string): ChessGameState {
    const chess = new Chess(fen);
    return this.mapChessToState(chess);
  }

  private mapChessToState(chess: Chess, lastMove?: GenericMove, history: GenericMove[] = []): ChessGameState {
    const isCheckmate = chess.isCheckmate();
    const isStalemate = chess.isStalemate();
    const isDraw = chess.isDraw();
    const isCheck = chess.inCheck();
    const turn = chess.turn(); // 'w' | 'b'
    const currentPlayer: PlayerId = turn === 'w' ? 'p1' : 'p2';

    let status: GameStatus = 'playing';
    let winner: PlayerId | undefined = undefined;

    if (isCheckmate) {
      status = 'checkmate';
      winner = turn === 'w' ? 'p2' : 'p1';
    } else if (isStalemate) {
      status = 'stalemate';
    } else if (isDraw) {
      status = 'draw';
    } else if (isCheck) {
      status = 'check';
    }

    const board = chess.board().map(row => row.map(cell => cell ? cell.type : null));

    return {
      game: 'chess',
      currentPlayer,
      status,
      winner,
      fen: chess.fen(),
      board,
      turn,
      isCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      moveHistory: history,
      capturedP1: [],
      capturedP2: [],
      lastMove,
    };
  }

  getLegalMoves(state: ChessGameState, player?: PlayerId): GenericMove[] {
    const chess = new Chess(state.fen);
    const moves = chess.moves({ verbose: true });
    return moves.map(m => ({
      from: squareToCoord(m.from),
      to: squareToCoord(m.to),
      promotion: m.promotion,
      captured: m.captured,
      notation: m.san,
    }));
  }

  getLegalMovesForSquare(state: ChessGameState, square: BoardCoordinate): BoardCoordinate[] {
    const chess = new Chess(state.fen);
    const sq = coordToSquare(square);
    const moves = chess.moves({ square: sq, verbose: true });
    return moves.map(m => squareToCoord(m.to));
  }

  applyMove(state: ChessGameState, move: GenericMove): ChessGameState {
    const chess = new Chess(state.fen);
    if (!move.from) return state;

    const fromSq = coordToSquare(move.from);
    const toSq = coordToSquare(move.to);

    try {
      const result = chess.move({
        from: fromSq,
        to: toSq,
        promotion: move.promotion || 'q',
      });

      if (!result) return state;

      const appliedMove: GenericMove = {
        from: move.from,
        to: move.to,
        promotion: result.promotion,
        captured: result.captured,
        notation: result.san,
      };

      const newHistory = [...state.moveHistory, appliedMove];
      const newState = this.mapChessToState(chess, appliedMove, newHistory);
      return newState;
    } catch {
      return state;
    }
  }

  getCurrentPlayer(state: ChessGameState): PlayerId {
    return state.currentPlayer;
  }

  getStatus(state: ChessGameState): GameStatus {
    return state.status;
  }

  serialize(state: ChessGameState): string {
    return JSON.stringify({
      fen: state.fen,
      history: state.moveHistory,
    });
  }

  deserialize(data: string): ChessGameState {
    const parsed = JSON.parse(data);
    const chess = new Chess(parsed.fen);
    return this.mapChessToState(chess, parsed.history[parsed.history.length - 1], parsed.history || []);
  }

  validateMove(state: ChessGameState, move: GenericMove): boolean {
    if (!move.from) return false;
    const legalMoves = this.getLegalMoves(state);
    return legalMoves.some(
      m => m.from?.x === move.from?.x && m.from?.y === move.from?.y && m.to.x === move.to.x && m.to.y === move.to.y
    );
  }
}

export const chessEngine = new ChessEngineImpl();
