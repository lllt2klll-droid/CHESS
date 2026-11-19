import { AILevel, GenericMove, PlayerId } from '@/types/game';
import { ChessGameState, chessEngine } from '@/games/chess/ChessEngine';
import { XiangqiGameState, xiangqiEngine } from '@/games/xiangqi/XiangqiEngine';
import { GomokuGameState, gomokuEngine } from '@/games/gomoku/GomokuEngine';
import { CheckersGameState, checkersEngine } from '@/games/checkers/CheckersEngine';

// Generic AI move picker
export async function computeAIMove(
  game: 'chess' | 'xiangqi' | 'gomoku' | 'checkers',
  state: any,
  level: AILevel = 'medium',
  signal?: AbortSignal
): Promise<GenericMove | null> {
  // Check if already aborted
  if (signal?.aborted) return null;

  // Add a slight natural delay so it feels like thinking without blocking (150ms - 400ms)
  const delay = level === 'easy' ? 200 : level === 'medium' ? 400 : 600;
  await new Promise(resolve => setTimeout(resolve, delay));

  if (signal?.aborted) return null;

  switch (game) {
    case 'chess':
      return computeChessMove(state as ChessGameState, level);
    case 'xiangqi':
      return computeXiangqiMove(state as XiangqiGameState, level);
    case 'gomoku':
      return computeGomokuMove(state as GomokuGameState, level);
    case 'checkers':
      return computeCheckersMove(state as CheckersGameState, level);
    default:
      return null;
  }
}

// ----------------------------------------------------
// CHESS AI
// ----------------------------------------------------
function computeChessMove(state: ChessGameState, level: AILevel): GenericMove | null {
  const legalMoves = chessEngine.getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  if (level === 'easy') {
    // 70% random, 30% capture if available
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.3) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Value pieces: p=1, n=3, b=3, r=5, q=9, k=100
  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    // Reward capture
    if (move.captured && pieceValues[move.captured]) {
      score += pieceValues[move.captured] * 10;
    }
    // Center control bonus (d4, d5, e4, e5)
    if (move.to.x >= 2 && move.to.x <= 5 && move.to.y >= 2 && move.to.y <= 5) {
      score += 2;
    }
    // Avoid immediate capture by simple check
    if (level === 'hard') {
      // Simulate move
      const nextState = chessEngine.applyMove(state, move);
      const enemyMoves = chessEngine.getLegalMoves(nextState);
      let maxEnemyReply = 0;
      for (const em of enemyMoves) {
        if (em.captured && pieceValues[em.captured]) {
          maxEnemyReply = Math.max(maxEnemyReply, pieceValues[em.captured] * 10);
        }
      }
      score -= maxEnemyReply;
    }

    // Add small random jitter so moves aren't identical every game
    score += Math.random() * 0.8;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ----------------------------------------------------
// GOMOKU AI
// ----------------------------------------------------
function computeGomokuMove(state: GomokuGameState, level: AILevel): GenericMove | null {
  const legalMoves = gomokuEngine.getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  const size = state.boardSize;
  const grid = state.grid;
  const aiPlayer: PlayerId = state.currentPlayer;
  const humanPlayer: PlayerId = aiPlayer === 'p1' ? 'p2' : 'p1';

  // If first move, play center
  if (state.moveHistory.length === 0) {
    const center = Math.floor(size / 2);
    return { to: { x: center, y: center } };
  }

  // Filter candidate moves to only those near existing stones (radius 2)
  const candidateMoves = legalMoves.filter(m => {
    const { x, y } = m.to;
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx] !== null) {
          return true;
        }
      }
    }
    return false;
  });

  const pool = candidateMoves.length > 0 ? candidateMoves : legalMoves;

  if (level === 'easy') {
    // 60% random near stones, 40% win/block
    if (Math.random() < 0.4) {
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }

  let bestMove = pool[0];
  let bestScore = -Infinity;

  for (const move of pool) {
    const { x, y } = move.to;
    // Score offense (AI) and defense (blocking Human)
    const attackScore = evaluateGomokuSpot(grid, size, x, y, aiPlayer);
    const defendScore = evaluateGomokuSpot(grid, size, x, y, humanPlayer);

    // Defense is slightly weighted so AI blocks immediate 4 or 3
    let score = attackScore + defendScore * 1.15;
    score += Math.random() * 2; // tie-breaker

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function evaluateGomokuSpot(
  grid: (PlayerId | null)[][],
  size: number,
  x: number,
  y: number,
  player: PlayerId
): number {
  let total = 0;
  const directions = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: -1 },
  ];

  for (const { dx, dy } of directions) {
    let count = 1;
    let openEnds = 0;

    // Check forward
    let step = 1;
    while (step <= 4) {
      const nx = x + dx * step;
      const ny = y + dy * step;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (grid[ny][nx] === player) {
          count++;
          step++;
        } else if (grid[ny][nx] === null) {
          openEnds++;
          break;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    // Check backward
    step = 1;
    while (step <= 4) {
      const nx = x - dx * step;
      const ny = y - dy * step;
      if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
        if (grid[ny][nx] === player) {
          count++;
          step++;
        } else if (grid[ny][nx] === null) {
          openEnds++;
          break;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    if (count >= 5) total += 100000; // Immediate win / loss
    else if (count === 4 && openEnds === 2) total += 10000; // Open four
    else if (count === 4 && openEnds === 1) total += 1500;  // Blocked four
    else if (count === 3 && openEnds === 2) total += 1000;  // Open three
    else if (count === 3 && openEnds === 1) total += 100;
    else if (count === 2 && openEnds === 2) total += 50;
    else if (count === 2 && openEnds === 1) total += 10;
  }

  return total;
}

// ----------------------------------------------------
// CHECKERS AI
// ----------------------------------------------------
function computeCheckersMove(state: CheckersGameState, level: AILevel): GenericMove | null {
  const legalMoves = checkersEngine.getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  // If there is only 1 move or it's forced capture
  if (legalMoves.length === 1) return legalMoves[0];

  if (level === 'easy') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    // Capture bonus
    if (move.captured) score += 20;

    // Promotion bonus (advancing towards back row)
    const targetY = state.currentPlayer === 'p1' ? 0 : 7;
    const progress = Math.abs(move.to.y - (state.currentPlayer === 'p1' ? 7 : 0));
    score += progress * 2;

    // Center dark squares preference (columns 2, 3, 4, 5)
    if (move.to.x >= 2 && move.to.x <= 5) score += 3;

    score += Math.random() * 1.5;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// ----------------------------------------------------
// XIANGQI AI
// ----------------------------------------------------
function computeXiangqiMove(state: XiangqiGameState, level: AILevel): GenericMove | null {
  const legalMoves = xiangqiEngine.getLegalMoves(state);
  if (legalMoves.length === 0) return null;

  if (level === 'easy') {
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.4) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const pieceValues: Record<string, number> = {
    general: 1000,
    chariot: 90,
    cannon: 45,
    horse: 40,
    elephant: 20,
    advisor: 20,
    soldier: 10,
  };

  let bestMove = legalMoves[0];
  let bestScore = -Infinity;

  for (const move of legalMoves) {
    let score = 0;
    if (move.captured && pieceValues[move.captured]) {
      score += pieceValues[move.captured] * 3;
    }

    // Soldiers crossing river get more value
    if (move.from) {
      const p = state.board[move.from.y][move.from.x];
      if (p?.type === 'soldier') {
        const across = state.currentPlayer === 'p1' ? move.to.y <= 4 : move.to.y >= 5;
        if (across) score += 15;
      }
    }

    score += Math.random() * 2;

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
