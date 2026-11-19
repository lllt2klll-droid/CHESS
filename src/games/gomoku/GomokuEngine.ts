import { BaseGameState, BoardCoordinate, GameEngine, GenericMove, PlayerId, GameStatus } from '@/types/game';

export const GOMOKU_BOARD_SIZE = 15;

export interface GomokuGameState extends BaseGameState {
  game: 'gomoku';
  boardSize: number;
  grid: (PlayerId | null)[][]; // 15x15: grid[y][x]
  winningLine?: BoardCoordinate[];
}

export class GomokuEngineImpl implements GameEngine<GomokuGameState, GenericMove> {
  createInitialState(boardSize: number = GOMOKU_BOARD_SIZE): GomokuGameState {
    const grid: (PlayerId | null)[][] = Array.from({ length: boardSize }, () =>
      Array.from({ length: boardSize }, () => null)
    );

    return {
      game: 'gomoku',
      boardSize,
      grid,
      currentPlayer: 'p1', // Black moves first
      status: 'playing',
      moveHistory: [],
      capturedP1: [],
      capturedP2: [],
    };
  }

  getLegalMoves(state: GomokuGameState): GenericMove[] {
    if (state.status !== 'playing') return [];
    const moves: GenericMove[] = [];
    const size = state.boardSize;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (state.grid[y][x] === null) {
          moves.push({ to: { x, y } });
        }
      }
    }
    return moves;
  }

  validateMove(state: GomokuGameState, move: GenericMove): boolean {
    if (state.status !== 'playing') return false;
    const { x, y } = move.to;
    if (x < 0 || x >= state.boardSize || y < 0 || y >= state.boardSize) return false;
    return state.grid[y][x] === null;
  }

  applyMove(state: GomokuGameState, move: GenericMove): GomokuGameState {
    if (!this.validateMove(state, move)) return state;

    const { x, y } = move.to;
    const player = state.currentPlayer;
    const size = state.boardSize;

    // Clone grid
    const newGrid = state.grid.map(row => [...row]);
    newGrid[y][x] = player;

    const appliedMove: GenericMove = {
      to: { x, y },
      notation: `${String.fromCharCode(65 + x)}${y + 1}`,
    };

    const newHistory = [...state.moveHistory, appliedMove];

    // Check win condition
    const winLine = this.checkWin(newGrid, size, x, y, player);
    let status: GameStatus = 'playing';
    let winner: PlayerId | undefined = undefined;

    if (winLine) {
      status = 'won';
      winner = player;
    } else if (newHistory.length === size * size) {
      status = 'draw';
    }

    const nextPlayer: PlayerId = player === 'p1' ? 'p2' : 'p1';

    return {
      ...state,
      grid: newGrid,
      currentPlayer: status === 'playing' ? nextPlayer : player,
      status,
      winner,
      winningLine: winLine || undefined,
      lastMove: appliedMove,
      moveHistory: newHistory,
    };
  }

  private checkWin(
    grid: (PlayerId | null)[][],
    size: number,
    lastX: number,
    lastY: number,
    player: PlayerId
  ): BoardCoordinate[] | null {
    const directions = [
      { dx: 1, dy: 0 },  // Horizontal
      { dx: 0, dy: 1 },  // Vertical
      { dx: 1, dy: 1 },  // Diagonal \
      { dx: 1, dy: -1 }, // Anti-diagonal /
    ];

    for (const { dx, dy } of directions) {
      const line: BoardCoordinate[] = [{ x: lastX, y: lastY }];

      // Look forward
      let step = 1;
      while (true) {
        const nx = lastX + dx * step;
        const ny = lastY + dy * step;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] === player) {
          line.push({ x: nx, y: ny });
          step++;
        } else {
          break;
        }
      }

      // Look backward
      step = 1;
      while (true) {
        const nx = lastX - dx * step;
        const ny = lastY - dy * step;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] === player) {
          line.unshift({ x: nx, y: ny });
          step++;
        } else {
          break;
        }
      }

      // 5 or more continuous stones = Win (Freestyle rule)
      if (line.length >= 5) {
        return line;
      }
    }

    return null;
  }

  getCurrentPlayer(state: GomokuGameState): PlayerId {
    return state.currentPlayer;
  }

  getStatus(state: GomokuGameState): GameStatus {
    return state.status;
  }

  serialize(state: GomokuGameState): string {
    return JSON.stringify({
      grid: state.grid,
      currentPlayer: state.currentPlayer,
      status: state.status,
      winner: state.winner,
      history: state.moveHistory,
    });
  }

  deserialize(data: string): GomokuGameState {
    const parsed = JSON.parse(data);
    return {
      game: 'gomoku',
      boardSize: parsed.grid.length,
      grid: parsed.grid,
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

export const gomokuEngine = new GomokuEngineImpl();
