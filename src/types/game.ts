export type GameType = 'chess' | 'xiangqi' | 'gomoku' | 'checkers';

export type GameMode = 'local' | 'ai';

export type AILevel = 'easy' | 'medium' | 'hard';

export type PlayerId = 'p1' | 'p2';

export type GameStatus = 'playing' | 'check' | 'checkmate' | 'won' | 'draw' | 'stalemate' | 'resigned';

export interface BoardCoordinate {
  x: number; // Col or File (0-indexed)
  y: number; // Row or Rank (0-indexed)
}

export interface GenericMove {
  from?: BoardCoordinate;
  to: BoardCoordinate;
  promotion?: string;
  captured?: string;
  notation?: string;
  jumps?: BoardCoordinate[]; // For checkers multi-jump
}

export interface GameResult {
  winner?: PlayerId;
  reason: 'checkmate' | 'five-in-row' | 'no-legal-moves' | 'resign' | 'draw' | 'other';
}

export interface BaseGameState {
  game: GameType;
  currentPlayer: PlayerId;
  status: GameStatus;
  winner?: PlayerId;
  moveHistory: GenericMove[];
  capturedP1: string[]; // Pieces captured by P1
  capturedP2: string[]; // Pieces captured by P2
  lastMove?: GenericMove;
  isCheck?: boolean;
}

export interface GameEngine<State extends BaseGameState, Move extends GenericMove, Config = unknown> {
  createInitialState(config?: Config): State;
  getLegalMoves(state: State, player: PlayerId): Move[];
  applyMove(state: State, move: Move): State;
  getCurrentPlayer(state: State): PlayerId;
  getStatus(state: State): GameStatus;
  serialize(state: State): string;
  deserialize(data: string): State;
  validateMove(state: State, move: Move): boolean;
}

export type WeatherPreset = 'clear' | 'breeze' | 'mist' | 'light-rain';
export type TimePreset = 'morning' | 'noon' | 'sunset' | 'night';
export type CameraPreset = 'top' | 'isometric' | 'low' | 'piece';
export type QualityTier = 'auto' | 'low' | 'medium' | 'high';
export type WorldMode = 'grass-only' | 'grass-sky';

export interface AppSettings {
  schemaVersion: number;
  selectedGame: GameType;
  preferredMode: GameMode;
  aiLevel: AILevel;
  quality: QualityTier;
  reducedMotion: boolean;
  soundEffectsEnabled: boolean;
  environment: {
    worldMode: WorldMode;
    timeMode: 'auto' | 'manual';
    timePreset: TimePreset;
    weatherPreset: WeatherPreset;
    windEnabled: boolean;
    windIntensity: number; // 0..1
  };
  camera: {
    preferredPreset: CameraPreset;
    autoRotate: boolean;
    sensitivity: number;
  };
  music: {
    volume: number; // 0..1
    muted: boolean;
    lastSourceType?: 'builtin' | 'url' | 'youtube';
    lastTrackId?: string;
  };
  ui: {
    compactMode: boolean;
    collapsedPanels: string[];
    board2DFallback: boolean;
  };
}

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  sourceType: 'builtin' | 'direct-audio' | 'local-file' | 'youtube';
  sourceUrl: string; // URL, YouTube ID or blob URL
  duration?: number;
}
