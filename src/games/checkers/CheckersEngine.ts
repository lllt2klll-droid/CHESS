import { BaseGameState, BoardCoordinate, GameEngine, GenericMove, PlayerId, GameStatus } from '@/types/game';

export type CheckersPieceType = 'man' | 'king';

export interface CheckersPiece {
  player: PlayerId;
  type: CheckersPieceType;
}

export interface CheckersGameState extends BaseGameState {
  game: 'checkers';
  board: (CheckersPiece | null)[][]; // 8x8: board[y][x]
  activePieceForJump?: BoardCoordinate; // When in the middle of a multi-jump sequence
}

export class CheckersEngineImpl implements GameEngine<CheckersGameState, GenericMove> {
  createInitialState(): CheckersGameState {
    const board: (CheckersPiece | null)[][] = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );

    // Dark squares have (x + y) % 2 === 1
    // P2 on rows 0, 1, 2
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 1) {
          board[y][x] = { player: 'p2', type: 'man' };
        }
      }
    }

    // P1 on rows 5, 6, 7
    for (let y = 5; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        if ((x + y) % 2 === 1) {
          board[y][x] = { player: 'p1', type: 'man' };
        }
      }
    }

    return {
      game: 'checkers',
      board,
      currentPlayer: 'p1',
      status: 'playing',
      moveHistory: [],
      capturedP1: [],
      capturedP2: [],
    };
  }

  getLegalMoves(state: CheckersGameState, player?: PlayerId): GenericMove[] {
    if (state.status !== 'playing') return [];
    const activePlayer = player || state.currentPlayer;
    const jumps: GenericMove[] = [];
    const regularMoves: GenericMove[] = [];

    // If locked into multi-jump
    if (state.activePieceForJump) {
      const from = state.activePieceForJump;
      const piece = state.board[from.y][from.x];
      if (piece && piece.player === activePlayer) {
        return this.getJumpsForPiece(state.board, from, piece);
      }
      return [];
    }

    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const piece = state.board[y][x];
        if (piece && piece.player === activePlayer) {
          const pieceJumps = this.getJumpsForPiece(state.board, { x, y }, piece);
          jumps.push(...pieceJumps);

          if (jumps.length === 0) {
            const pieceMoves = this.getRegularMovesForPiece(state.board, { x, y }, piece);
            regularMoves.push(...pieceMoves);
          }
        }
      }
    }

    // Mandatory capture rule: If jumps are available, only jumps are legal
    if (jumps.length > 0) {
      return jumps;
    }

    return regularMoves;
  }

  private getJumpsForPiece(
    board: (CheckersPiece | null)[][],
    from: BoardCoordinate,
    piece: CheckersPiece
  ): GenericMove[] {
    const jumps: GenericMove[] = [];
    const forwardDirs = piece.player === 'p1' ? [-1] : [1];
    const dyDirs = piece.type === 'king' ? [-1, 1] : forwardDirs;
    const dxDirs = [-1, 1];

    for (const dy of dyDirs) {
      for (const dx of dxDirs) {
        const midX = from.x + dx;
        const midY = from.y + dy;
        const destX = from.x + dx * 2;
        const destY = from.y + dy * 2;

        if (destX >= 0 && destX < 8 && destY >= 0 && destY < 8) {
          const midPiece = board[midY][midX];
          const destPiece = board[destY][destX];

          if (midPiece && midPiece.player !== piece.player && destPiece === null) {
            jumps.push({
              from,
              to: { x: destX, y: destY },
              captured: `${midX},${midY}`,
              notation: `${String.fromCharCode(65 + from.x)}${from.y + 1}x${String.fromCharCode(65 + destX)}${destY + 1}`,
            });
          }
        }
      }
    }

    return jumps;
  }

  private getRegularMovesForPiece(
    board: (CheckersPiece | null)[][],
    from: BoardCoordinate,
    piece: CheckersPiece
  ): GenericMove[] {
    const moves: GenericMove[] = [];
    const forwardDirs = piece.player === 'p1' ? [-1] : [1];
    const dyDirs = piece.type === 'king' ? [-1, 1] : forwardDirs;
    const dxDirs = [-1, 1];

    for (const dy of dyDirs) {
      for (const dx of dxDirs) {
        const destX = from.x + dx;
        const destY = from.y + dy;

        if (destX >= 0 && destX < 8 && destY >= 0 && destY < 8) {
          if (board[destY][destX] === null) {
            moves.push({
              from,
              to: { x: destX, y: destY },
              notation: `${String.fromCharCode(65 + from.x)}${from.y + 1}-${String.fromCharCode(65 + destX)}${destY + 1}`,
            });
          }
        }
      }
    }

    return moves;
  }

  validateMove(state: CheckersGameState, move: GenericMove): boolean {
    if (!move.from) return false;
    const legalMoves = this.getLegalMoves(state);
    return legalMoves.some(
      m => m.from?.x === move.from?.x && m.from?.y === move.from?.y && m.to.x === move.to.x && m.to.y === move.to.y
    );
  }

  applyMove(state: CheckersGameState, move: GenericMove): CheckersGameState {
    if (!move.from || !this.validateMove(state, move)) return state;

    const from = move.from;
    const to = move.to;
    const board = state.board.map(row => [...row]);
    const piece = board[from.y][from.x];
    if (!piece) return state;

    // Remove from source
    board[from.y][from.x] = null;

    // Check if jump
    const isJump = Math.abs(to.x - from.x) === 2 && Math.abs(to.y - from.y) === 2;
    const capturedPiecesP1 = [...state.capturedP1];
    const capturedPiecesP2 = [...state.capturedP2];

    if (isJump) {
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const captured = board[midY][midX];
      board[midY][midX] = null;
      if (captured) {
        if (state.currentPlayer === 'p1') {
          capturedPiecesP1.push(captured.type);
        } else {
          capturedPiecesP2.push(captured.type);
        }
      }
    }

    // Check King promotion
    let isCrowned = false;
    if (piece.type === 'man') {
      if ((piece.player === 'p1' && to.y === 0) || (piece.player === 'p2' && to.y === 7)) {
        piece.type = 'king';
        isCrowned = true;
      }
    }

    // Place at destination
    board[to.y][to.x] = piece;

    // Check multi-jump continuation (if jumped, and not just crowned, and has further jump)
    let nextActiveJump: BoardCoordinate | undefined = undefined;
    if (isJump && !isCrowned) {
      const moreJumps = this.getJumpsForPiece(board, to, piece);
      if (moreJumps.length > 0) {
        nextActiveJump = to;
      }
    }

    const nextPlayer: PlayerId = nextActiveJump ? state.currentPlayer : (state.currentPlayer === 'p1' ? 'p2' : 'p1');
    const newHistory = [...state.moveHistory, move];

    // Check if game terminal for next player
    const tempState: CheckersGameState = {
      ...state,
      board,
      currentPlayer: nextPlayer,
      activePieceForJump: nextActiveJump,
    };

    const nextLegalMoves = this.getLegalMoves(tempState);
    let status: GameStatus = 'playing';
    let winner: PlayerId | undefined = undefined;

    if (nextLegalMoves.length === 0) {
      status = 'won';
      winner = state.currentPlayer;
    }

    return {
      game: 'checkers',
      board,
      currentPlayer: nextPlayer,
      status,
      winner,
      activePieceForJump: nextActiveJump,
      moveHistory: newHistory,
      capturedP1: capturedPiecesP1,
      capturedP2: capturedPiecesP2,
      lastMove: move,
    };
  }

  getCurrentPlayer(state: CheckersGameState): PlayerId {
    return state.currentPlayer;
  }

  getStatus(state: CheckersGameState): GameStatus {
    return state.status;
  }

  serialize(state: CheckersGameState): string {
    return JSON.stringify({
      board: state.board,
      currentPlayer: state.currentPlayer,
      status: state.status,
      winner: state.winner,
      activePieceForJump: state.activePieceForJump,
      history: state.moveHistory,
    });
  }

  deserialize(data: string): CheckersGameState {
    const parsed = JSON.parse(data);
    return {
      game: 'checkers',
      board: parsed.board,
      currentPlayer: parsed.currentPlayer,
      status: parsed.status,
      winner: parsed.winner,
      activePieceForJump: parsed.activePieceForJump,
      moveHistory: parsed.history || [],
      capturedP1: [],
      capturedP2: [],
      lastMove: parsed.history?.[parsed.history.length - 1],
    };
  }
}

export const checkersEngine = new CheckersEngineImpl();
