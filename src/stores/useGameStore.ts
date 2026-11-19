import { create } from 'zustand';
import { GameType, GameMode, BoardCoordinate, GenericMove, AILevel } from '@/types/game';
import { chessEngine } from '@/games/chess/ChessEngine';
import { xiangqiEngine } from '@/games/xiangqi/XiangqiEngine';
import { gomokuEngine } from '@/games/gomoku/GomokuEngine';
import { checkersEngine } from '@/games/checkers/CheckersEngine';
import { computeAIMove } from '@/ai/aiOpponent';
import { saveGameSession } from '@/persistence/gameHistoryStorage';
import { soundFX } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';

interface GameStoreState {
  game: GameType;
  mode: GameMode;
  aiLevel: AILevel;
  gameState: any;
  historyStates: any[];
  selectedCoord: BoardCoordinate | null;
  legalTargets: BoardCoordinate[];
  lastMove: GenericMove | null;
  lastMoveTime: number;
  isAIThinking: boolean;
  sessionId: string;
  abortController: AbortController | null;

  // Actions
  initGame: (game: GameType, mode?: GameMode, aiLevel?: AILevel) => void;
  selectCoord: (coord: BoardCoordinate | null) => void;
  playMove: (move: GenericMove) => void;
  undo: () => void;
  restart: () => void;
  setAILevel: (level: AILevel) => void;
}

const getEngine = (game: GameType) => {
  switch (game) {
    case 'chess': return chessEngine;
    case 'xiangqi': return xiangqiEngine;
    case 'gomoku': return gomokuEngine;
    case 'checkers': return checkersEngine;
  }
};

export const useGameStore = create<GameStoreState>((set, get) => ({
  game: 'chess',
  mode: 'local',
  aiLevel: 'medium',
  gameState: chessEngine.createInitialState(),
  historyStates: [],
  selectedCoord: null,
  legalTargets: [],
  lastMove: null,
  lastMoveTime: 0,
  isAIThinking: false,
  sessionId: `session_${Date.now()}`,
  abortController: null,

  initGame: (game: GameType, mode: GameMode = 'local', aiLevel: AILevel = 'medium') => {
    const engine = getEngine(game);
    const initial = engine.createInitialState();

    const prevCtrl = get().abortController;
    if (prevCtrl) prevCtrl.abort();

    set({
      game,
      mode,
      aiLevel,
      gameState: initial,
      historyStates: [],
      selectedCoord: null,
      legalTargets: [],
      lastMove: null,
      lastMoveTime: 0,
      isAIThinking: false,
      sessionId: `session_${Date.now()}`,
      abortController: null,
    });
  },

  selectCoord: (coord: BoardCoordinate | null) => {
    const { game, gameState, selectedCoord, legalTargets, playMove } = get();
    if (gameState.status !== 'playing' && gameState.status !== 'check') {
      set({ selectedCoord: null, legalTargets: [] });
      return;
    }

    // In Gomoku, clicking empty intersection immediately makes a move
    if (game === 'gomoku') {
      if (coord && gomokuEngine.validateMove(gameState, { to: coord })) {
        playMove({ to: coord });
      }
      return;
    }

    if (!coord) {
      set({ selectedCoord: null, legalTargets: [] });
      return;
    }

    // If already selected, check if clicked target is a legal destination
    if (selectedCoord) {
      const isLegal = legalTargets.some(t => t.x === coord.x && t.y === coord.y);
      if (isLegal) {
        playMove({ from: selectedCoord, to: coord });
        set({ selectedCoord: null, legalTargets: [] });
        return;
      }
    }

    // Otherwise, select piece if it belongs to current player
    const engine = getEngine(game);
    const allMoves = engine.getLegalMoves(gameState, gameState.currentPlayer);
    const pieceMoves = allMoves.filter(m => m.from?.x === coord.x && m.from?.y === coord.y);

    if (pieceMoves.length > 0) {
      soundFX.playSelect();
      set({
        selectedCoord: coord,
        legalTargets: pieceMoves.map(m => m.to),
      });
    } else {
      set({ selectedCoord: null, legalTargets: [] });
    }
  },

  playMove: (move: GenericMove) => {
    const { game, mode, aiLevel, gameState, historyStates, sessionId } = get();
    const engine = getEngine(game);

    if (!engine.validateMove(gameState, move)) return;

    // Detect if this move is a capture
    const isCapture = !!move.captured ||
      (gameState.capturedP1 && gameState.capturedP1.length < (gameState.capturedP1.length + (move.captured ? 1 : 0)));

    const nextState = engine.applyMove(gameState, move);
    const newHistoryStates = [...historyStates, gameState];
    const now = Date.now();

    // Trigger appropriate sound
    if (nextState.status === 'checkmate' || nextState.status === 'won') {
      soundFX.playVictory();
    } else if (nextState.isCheck) {
      soundFX.playCheck();
    } else if (isCapture) {
      soundFX.playCapture();
    } else {
      soundFX.playMove();
    }

    set({
      gameState: nextState,
      historyStates: newHistoryStates,
      selectedCoord: null,
      legalTargets: [],
      lastMove: move,
      lastMoveTime: now,
    });

    // Check game over
    if (nextState.status === 'checkmate' || nextState.status === 'won') {
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 } });
      } catch {}
      saveGameSession({
        id: sessionId,
        game,
        mode,
        status: 'completed',
        createdAt: Date.now(),
        winner: nextState.winner,
        reason: nextState.status,
        moveCount: nextState.moveHistory.length,
        moves: nextState.moveHistory,
      });
      return;
    }

    // AI opponent turn
    if (mode === 'ai' && nextState.currentPlayer === 'p2' && (nextState.status === 'playing' || nextState.status === 'check')) {
      const abortCtrl = new AbortController();
      set({ isAIThinking: true, abortController: abortCtrl });

      computeAIMove(game, nextState, aiLevel, abortCtrl.signal)
        .then((aiMove) => {
          if (!aiMove || abortCtrl.signal.aborted) {
            set({ isAIThinking: false });
            return;
          }

          const isAICapture = !!aiMove.captured;
          const afterAIMove = engine.applyMove(nextState as any, aiMove);
          const aiHistoryStates = [...newHistoryStates, nextState];
          const aiMoveTime = Date.now();

          if (afterAIMove.status === 'checkmate' || afterAIMove.status === 'won') {
            soundFX.playVictory();
          } else if (afterAIMove.isCheck) {
            soundFX.playCheck();
          } else if (isAICapture) {
            soundFX.playCapture();
          } else {
            soundFX.playMove();
          }

          set({
            gameState: afterAIMove,
            historyStates: aiHistoryStates,
            isAIThinking: false,
            abortController: null,
            lastMove: aiMove,
            lastMoveTime: aiMoveTime,
          });

          if (afterAIMove.status === 'checkmate' || afterAIMove.status === 'won') {
            try {
              confetti({ particleCount: 75, spread: 65, origin: { y: 0.65 } });
            } catch {}
            saveGameSession({
              id: sessionId,
              game,
              mode,
              status: 'completed',
              createdAt: Date.now(),
              winner: afterAIMove.winner,
              reason: afterAIMove.status,
              moveCount: afterAIMove.moveHistory.length,
              moves: afterAIMove.moveHistory,
            });
          }
        })
        .catch(() => {
          set({ isAIThinking: false });
        });
    }
  },

  undo: () => {
    const { mode, historyStates, abortController } = get();
    if (abortController) abortController.abort();
    if (historyStates.length === 0) return;

    soundFX.playMove();
    const popCount = mode === 'ai' && historyStates.length >= 2 ? 2 : 1;
    const targetIndex = historyStates.length - popCount;
    const prevState = historyStates[Math.max(0, targetIndex)];
    const newHistory = historyStates.slice(0, Math.max(0, targetIndex));

    set({
      gameState: prevState,
      historyStates: newHistory,
      selectedCoord: null,
      legalTargets: [],
      lastMove: null,
      isAIThinking: false,
    });
  },

  restart: () => {
    const { game, mode, aiLevel, initGame } = get();
    soundFX.playMove();
    initGame(game, mode, aiLevel);
  },

  setAILevel: (aiLevel: AILevel) => {
    set({ aiLevel });
  },
}));
