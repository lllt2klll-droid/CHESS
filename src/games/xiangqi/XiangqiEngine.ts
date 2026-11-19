import { BaseGameState, BoardCoordinate, GameEngine, GenericMove, PlayerId, GameStatus } from '@/types/game';

export type XiangqiPieceType = 'general' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier';

export interface XiangqiPiece {
  player: PlayerId;
  type: XiangqiPieceType;
}

export interface XiangqiGameState extends BaseGameState {
  game: 'xiangqi';
  board: (XiangqiPiece | null)[][]; // 10 rows (y=0..9), 9 cols (x=0..8): board[y][x]
}

export class XiangqiEngineImpl implements GameEngine<XiangqiGameState, GenericMove> {
  createInitialState(): XiangqiGameState {
    const board: (XiangqiPiece | null)[][] = Array.from({ length: 10 }, () =>
      Array.from({ length: 9 }, () => null)
    );

    // Black (P2) at top (y = 0..3)
    board[0][0] = { player: 'p2', type: 'chariot' };
    board[0][1] = { player: 'p2', type: 'horse' };
    board[0][2] = { player: 'p2', type: 'elephant' };
    board[0][3] = { player: 'p2', type: 'advisor' };
    board[0][4] = { player: 'p2', type: 'general' };
    board[0][5] = { player: 'p2', type: 'advisor' };
    board[0][6] = { player: 'p2', type: 'elephant' };
    board[0][7] = { player: 'p2', type: 'horse' };
    board[0][8] = { player: 'p2', type: 'chariot' };
    board[2][1] = { player: 'p2', type: 'cannon' };
    board[2][7] = { player: 'p2', type: 'cannon' };
    board[3][0] = { player: 'p2', type: 'soldier' };
    board[3][2] = { player: 'p2', type: 'soldier' };
    board[3][4] = { player: 'p2', type: 'soldier' };
    board[3][6] = { player: 'p2', type: 'soldier' };
    board[3][8] = { player: 'p2', type: 'soldier' };

    // Red (P1) at bottom (y = 6..9)
    board[9][0] = { player: 'p1', type: 'chariot' };
    board[9][1] = { player: 'p1', type: 'horse' };
    board[9][2] = { player: 'p1', type: 'elephant' };
    board[9][3] = { player: 'p1', type: 'advisor' };
    board[9][4] = { player: 'p1', type: 'general' };
    board[9][5] = { player: 'p1', type: 'advisor' };
    board[9][6] = { player: 'p1', type: 'elephant' };
    board[9][7] = { player: 'p1', type: 'horse' };
    board[9][8] = { player: 'p1', type: 'chariot' };
    board[7][1] = { player: 'p1', type: 'cannon' };
    board[7][7] = { player: 'p1', type: 'cannon' };
    board[6][0] = { player: 'p1', type: 'soldier' };
    board[6][2] = { player: 'p1', type: 'soldier' };
    board[6][4] = { player: 'p1', type: 'soldier' };
    board[6][6] = { player: 'p1', type: 'soldier' };
    board[6][8] = { player: 'p1', type: 'soldier' };

    return {
      game: 'xiangqi',
      board,
      currentPlayer: 'p1', // Red moves first
      status: 'playing',
      moveHistory: [],
      capturedP1: [],
      capturedP2: [],
    };
  }

  getLegalMoves(state: XiangqiGameState, player?: PlayerId): GenericMove[] {
    if (state.status !== 'playing' && state.status !== 'check') return [];
    const activePlayer = player || state.currentPlayer;
    const candidates: GenericMove[] = [];

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = state.board[y][x];
        if (piece && piece.player === activePlayer) {
          const pieceMoves = this.getPseudoLegalMoves(state.board, { x, y }, piece);
          for (const m of pieceMoves) {
            // Check if applying this move leaves own king in check or flying general
            if (!this.doesMoveCauseSelfCheck(state.board, m, activePlayer)) {
              candidates.push(m);
            }
          }
        }
      }
    }

    return candidates;
  }

  private getPseudoLegalMoves(
    board: (XiangqiPiece | null)[][],
    from: BoardCoordinate,
    piece: XiangqiPiece
  ): GenericMove[] {
    const moves: GenericMove[] = [];
    const { player, type } = piece;

    const addMoveIfValid = (tx: number, ty: number) => {
      if (tx < 0 || tx > 8 || ty < 0 || ty > 9) return;
      const target = board[ty][tx];
      if (!target || target.player !== player) {
        moves.push({
          from,
          to: { x: tx, y: ty },
          captured: target ? target.type : undefined,
        });
      }
    };

    switch (type) {
      case 'general': {
        // Orthogonal 1 step inside palace (x: 3..5, y: 7..9 for p1, 0..2 for p2)
        const minY = player === 'p1' ? 7 : 0;
        const maxY = player === 'p1' ? 9 : 2;
        const dirs = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];
        for (const { dx, dy } of dirs) {
          const nx = from.x + dx;
          const ny = from.y + dy;
          if (nx >= 3 && nx <= 5 && ny >= minY && ny <= maxY) {
            addMoveIfValid(nx, ny);
          }
        }
        break;
      }

      case 'advisor': {
        // Diagonal 1 step inside palace
        const minY = player === 'p1' ? 7 : 0;
        const maxY = player === 'p1' ? 9 : 2;
        const dirs = [
          { dx: 1, dy: 1 },
          { dx: -1, dy: 1 },
          { dx: 1, dy: -1 },
          { dx: -1, dy: -1 },
        ];
        for (const { dx, dy } of dirs) {
          const nx = from.x + dx;
          const ny = from.y + dy;
          if (nx >= 3 && nx <= 5 && ny >= minY && ny <= maxY) {
            addMoveIfValid(nx, ny);
          }
        }
        break;
      }

      case 'elephant': {
        // Diagonal 2 steps, cannot cross river (p1 cannot go y < 5; p2 cannot go y > 4).
        // Must not be blocked at eye (dx/2, dy/2).
        const dirs = [
          { dx: 2, dy: 2 },
          { dx: -2, dy: 2 },
          { dx: 2, dy: -2 },
          { dx: -2, dy: -2 },
        ];
        for (const { dx, dy } of dirs) {
          const nx = from.x + dx;
          const ny = from.y + dy;
          const canCross = player === 'p1' ? ny >= 5 : ny <= 4;
          if (nx >= 0 && nx <= 8 && ny >= 0 && ny <= 9 && canCross) {
            const eyeX = from.x + dx / 2;
            const eyeY = from.y + dy / 2;
            if (board[eyeY][eyeX] === null) {
              addMoveIfValid(nx, ny);
            }
          }
        }
        break;
      }

      case 'horse': {
        // L-shape: 1 orthogonal, 1 diagonal. Blocked by horse leg at orthogonal step.
        const legDirs = [
          { ox: 1, oy: 0, targets: [{ dx: 2, dy: 1 }, { dx: 2, dy: -1 }] },
          { ox: -1, oy: 0, targets: [{ dx: -2, dy: 1 }, { dx: -2, dy: -1 }] },
          { ox: 0, oy: 1, targets: [{ dx: 1, dy: 2 }, { dx: -1, dy: 2 }] },
          { ox: 0, oy: -1, targets: [{ dx: 1, dy: -2 }, { dx: -1, dy: -2 }] },
        ];
        for (const { ox, oy, targets } of legDirs) {
          const legX = from.x + ox;
          const legY = from.y + oy;
          if (legX >= 0 && legX <= 8 && legY >= 0 && legY <= 9 && board[legY][legX] === null) {
            for (const { dx, dy } of targets) {
              addMoveIfValid(from.x + dx, from.y + dy);
            }
          }
        }
        break;
      }

      case 'chariot': {
        // Orthogonal ray until hit piece
        const dirs = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];
        for (const { dx, dy } of dirs) {
          let step = 1;
          while (true) {
            const nx = from.x + dx * step;
            const ny = from.y + dy * step;
            if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
            const target = board[ny][nx];
            if (target === null) {
              addMoveIfValid(nx, ny);
            } else {
              if (target.player !== player) {
                addMoveIfValid(nx, ny);
              }
              break;
            }
            step++;
          }
        }
        break;
      }

      case 'cannon': {
        // Orthogonal ray. Non-capture until piece. Capture jump over 1 screen piece.
        const dirs = [
          { dx: 1, dy: 0 },
          { dx: -1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: 0, dy: -1 },
        ];
        for (const { dx, dy } of dirs) {
          let step = 1;
          let screenFound = false;
          while (true) {
            const nx = from.x + dx * step;
            const ny = from.y + dy * step;
            if (nx < 0 || nx > 8 || ny < 0 || ny > 9) break;
            const target = board[ny][nx];
            if (!screenFound) {
              if (target === null) {
                moves.push({ from, to: { x: nx, y: ny } });
              } else {
                screenFound = true;
              }
            } else {
              if (target !== null) {
                if (target.player !== player) {
                  moves.push({ from, to: { x: nx, y: ny }, captured: target.type });
                }
                break;
              }
            }
            step++;
          }
        }
        break;
      }

      case 'soldier': {
        // Move 1 step forward. After river, also left/right. Never backward.
        const fwdY = player === 'p1' ? -1 : 1;
        // Forward
        addMoveIfValid(from.x, from.y + fwdY);
        // Across river?
        const acrossRiver = player === 'p1' ? from.y <= 4 : from.y >= 5;
        if (acrossRiver) {
          addMoveIfValid(from.x - 1, from.y);
          addMoveIfValid(from.x + 1, from.y);
        }
        break;
      }
    }

    return moves;
  }

  private doesMoveCauseSelfCheck(
    board: (XiangqiPiece | null)[][],
    move: GenericMove,
    player: PlayerId
  ): boolean {
    if (!move.from) return false;
    // Simulate move on cloned board
    const tempBoard = board.map(r => [...r]);
    const piece = tempBoard[move.from.y][move.from.x];
    tempBoard[move.from.y][move.from.x] = null;
    tempBoard[move.to.y][move.to.x] = piece;

    // Check flying generals
    if (this.areGeneralsFacing(tempBoard)) return true;

    // Check if own general is attacked
    return this.isGeneralAttacked(tempBoard, player);
  }

  private areGeneralsFacing(board: (XiangqiPiece | null)[][]): boolean {
    // Find both generals
    let p1Gen: BoardCoordinate | null = null;
    let p2Gen: BoardCoordinate | null = null;

    for (let y = 0; y < 10; y++) {
      for (let x = 3; x <= 5; x++) {
        const p = board[y][x];
        if (p && p.type === 'general') {
          if (p.player === 'p1') p1Gen = { x, y };
          if (p.player === 'p2') p2Gen = { x, y };
        }
      }
    }

    if (!p1Gen || !p2Gen) return false;
    if (p1Gen.x !== p2Gen.x) return false; // Not in same column

    // Check if pieces in between
    const col = p1Gen.x;
    const startY = Math.min(p1Gen.y, p2Gen.y) + 1;
    const endY = Math.max(p1Gen.y, p2Gen.y);

    for (let y = startY; y < endY; y++) {
      if (board[y][col] !== null) return false; // Obstacle found
    }

    return true; // Flying general violation!
  }

  private isGeneralAttacked(board: (XiangqiPiece | null)[][], player: PlayerId): boolean {
    let generalCoord: BoardCoordinate | null = null;
    for (let y = 0; y < 10; y++) {
      for (let x = 3; x <= 5; x++) {
        const p = board[y][x];
        if (p && p.player === player && p.type === 'general') {
          generalCoord = { x, y };
          break;
        }
      }
      if (generalCoord) break;
    }

    if (!generalCoord) return true;

    const opponent: PlayerId = player === 'p1' ? 'p2' : 'p1';
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const p = board[y][x];
        if (p && p.player === opponent) {
          const moves = this.getPseudoLegalMoves(board, { x, y }, p);
          if (moves.some(m => m.to.x === generalCoord?.x && m.to.y === generalCoord?.y)) {
            return true;
          }
        }
      }
    }

    return false;
  }

  validateMove(state: XiangqiGameState, move: GenericMove): boolean {
    if (!move.from) return false;
    const legalMoves = this.getLegalMoves(state);
    return legalMoves.some(
      m => m.from?.x === move.from?.x && m.from?.y === move.from?.y && m.to.x === move.to.x && m.to.y === move.to.y
    );
  }

  applyMove(state: XiangqiGameState, move: GenericMove): XiangqiGameState {
    if (!move.from || !this.validateMove(state, move)) return state;

    const from = move.from;
    const to = move.to;
    const board = state.board.map(r => [...r]);
    const piece = board[from.y][from.x];
    if (!piece) return state;

    const capturedPiece = board[to.y][to.x];
    board[from.y][from.x] = null;
    board[to.y][to.x] = piece;

    const capturedP1 = [...state.capturedP1];
    const capturedP2 = [...state.capturedP2];
    if (capturedPiece) {
      if (state.currentPlayer === 'p1') {
        capturedP1.push(capturedPiece.type);
      } else {
        capturedP2.push(capturedPiece.type);
      }
    }

    const nextPlayer: PlayerId = state.currentPlayer === 'p1' ? 'p2' : 'p1';
    const newHistory = [...state.moveHistory, move];

    // Check if next player is in check
    const isNextCheck = this.isGeneralAttacked(board, nextPlayer);

    const tempState: XiangqiGameState = {
      ...state,
      board,
      currentPlayer: nextPlayer,
      status: isNextCheck ? 'check' : 'playing',
    };

    const nextLegalMoves = this.getLegalMoves(tempState);
    let status: GameStatus = isNextCheck ? 'check' : 'playing';
    let winner: PlayerId | undefined = undefined;

    if (nextLegalMoves.length === 0) {
      status = isNextCheck ? 'checkmate' : 'stalemate';
      winner = state.currentPlayer; // In xiangqi, no legal moves = lose
    }

    return {
      game: 'xiangqi',
      board,
      currentPlayer: nextPlayer,
      status,
      winner,
      isCheck: isNextCheck,
      moveHistory: newHistory,
      capturedP1,
      capturedP2,
      lastMove: move,
    };
  }

  getCurrentPlayer(state: XiangqiGameState): PlayerId {
    return state.currentPlayer;
  }

  getStatus(state: XiangqiGameState): GameStatus {
    return state.status;
  }

  serialize(state: XiangqiGameState): string {
    return JSON.stringify({
      board: state.board,
      currentPlayer: state.currentPlayer,
      status: state.status,
      winner: state.winner,
      history: state.moveHistory,
    });
  }

  deserialize(data: string): XiangqiGameState {
    const parsed = JSON.parse(data);
    return {
      game: 'xiangqi',
      board: parsed.board,
      currentPlayer: parsed.currentPlayer,
      status: parsed.status,
      winner: parsed.winner,
      moveHistory: parsed.history || [],
      capturedP1: [],
      capturedP2: [],
      lastMove: parsed.history?.[parsed.history.length - 1],
    };
  }
}

export const xiangqiEngine = new XiangqiEngineImpl();
