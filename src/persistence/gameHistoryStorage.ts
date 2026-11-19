import { openDB, DBSchema } from 'idb';
import { GameType, GameMode, PlayerId, GenericMove } from '@/types/game';

export interface GameSessionRecord {
  id: string;
  game: GameType;
  mode: GameMode;
  status: 'completed' | 'abandoned';
  createdAt: number;
  completedAt?: number;
  winner?: PlayerId;
  reason?: string;
  moveCount: number;
  moves: GenericMove[];
}

interface BoardGameLoungeDB extends DBSchema {
  gameSessions: {
    key: string;
    value: GameSessionRecord;
    indexes: { 'by-date': number; 'by-game': string };
  };
}

const DB_NAME = 'board-game-lounge';
const DB_VERSION = 1;

async function getDB() {
  return openDB<BoardGameLoungeDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('gameSessions')) {
        const store = db.createObjectStore('gameSessions', { keyPath: 'id' });
        store.createIndex('by-date', 'createdAt');
        store.createIndex('by-game', 'game');
      }
    },
  });
}

export async function saveGameSession(session: GameSessionRecord): Promise<void> {
  try {
    const db = await getDB();
    await db.put('gameSessions', session);
  } catch (err) {
    console.error('Failed to save game session to IndexedDB', err);
  }
}

export async function getAllGameSessions(): Promise<GameSessionRecord[]> {
  try {
    const db = await getDB();
    const records = await db.getAllFromIndex('gameSessions', 'by-date');
    return records.reverse(); // Most recent first
  } catch (err) {
    console.error('Failed to load sessions from IndexedDB', err);
    return [];
  }
}

export async function deleteGameSession(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('gameSessions', id);
  } catch (err) {
    console.error('Failed to delete session', err);
  }
}

export async function clearAllGameSessions(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear('gameSessions');
  } catch (err) {
    console.error('Failed to clear sessions', err);
  }
}
