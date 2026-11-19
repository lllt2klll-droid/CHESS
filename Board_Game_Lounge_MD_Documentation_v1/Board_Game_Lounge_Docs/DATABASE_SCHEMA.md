# DATABASE SCHEMA & LOCAL PERSISTENCE

## 1. Nguyên tắc
MVP không cần server database. Dữ liệu lưu trên thiết bị người dùng:
- LocalStorage cho settings nhỏ.
- IndexedDB cho lịch sử, move list, replay.
- Không lưu file nhạc lớn vào LocalStorage.
- Không lưu object runtime như Three.js mesh hoặc Audio element.

## 2. LocalStorage keys

```ts
type AppSettings = {
  schemaVersion: number;
  selectedGame: "chess" | "xiangqi" | "gomoku" | "checkers";
  preferredMode: "local" | "ai";
  quality: "auto" | "low" | "medium" | "high";
  reducedMotion: boolean;
  soundEffectsEnabled: boolean;
  environment: {
    worldMode: "grass-only" | "grass-sky";
    timeMode: "auto" | "manual";
    timePreset: "morning" | "noon" | "sunset" | "night";
    weatherPreset: "clear" | "breeze" | "mist" | "light-rain";
    windEnabled: boolean;
    windIntensity: number; // 0..1
  };
  camera: {
    preferredPreset: "top" | "isometric" | "low" | "piece";
    autoRotate: boolean;
    sensitivity: number;
  };
  music: {
    volume: number; // 0..1
    muted: boolean;
    lastSourceType?: "builtin" | "url" | "youtube";
    lastTrackId?: string;
  };
  ui: {
    compactMode: true;
    collapsedPanels: string[];
  };
};
```

Key đề xuất: `bgl.settings.v1`.

## 3. IndexedDB
Database: `board-game-lounge`; version tăng khi schema thay đổi.

### Object store: `gameSessions`
```ts
type GameSessionRecord = {
  id: string;
  game: "chess" | "xiangqi" | "gomoku" | "checkers";
  mode: "local" | "ai";
  status: "in-progress" | "completed" | "abandoned";
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  players: Array<{
    id: "p1" | "p2";
    label: string;
    type: "human" | "ai";
    aiLevel?: "easy" | "medium" | "hard";
  }>;
  result?: {
    winner?: "p1" | "p2";
    reason: "checkmate" | "five-in-row" | "no-legal-moves" | "resign" | "draw" | "other";
  };
  initialState: string;
  finalState?: string;
  moveCount: number;
};
```

### Object store: `gameMoves`
```ts
type GameMoveRecord = {
  id: string;
  sessionId: string;
  ply: number;
  move: string;       // serialized engine move
  notation?: string;  // SAN hoặc notation game-specific
  stateAfter?: string; // snapshot theo chu kỳ, không nhất thiết mỗi nước
  createdAt: number;
};
```
Index: `sessionId`, `[sessionId, ply]`.

### Object store: `playlists`
```ts
type PlaylistRecord = {
  id: string;
  name: string;
  items: Array<{
    id: string;
    type: "builtin" | "direct-audio" | "youtube";
    title: string;
    source: string; // URL hoặc asset id; không chứa secret
    addedAt: number;
  }>;
  updatedAt: number;
};
```

### Object store: `userAssets` (tùy chọn)
Chỉ lưu metadata hoặc Blob nhỏ khi người dùng chủ động yêu cầu lưu offline. Mặc định không lưu file nhạc.

## 4. Index và truy vấn
- `gameSessions.updatedAt` để lấy lịch sử gần nhất.
- `gameSessions.game` để lọc theo game.
- `gameMoves.sessionId + ply` để tải replay theo thứ tự.
- Phân trang lịch sử; không tải toàn bộ move list ngay khi mở app.

## 5. Repository API

```ts
interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
  reset(): Promise<void>;
}

interface GameHistoryRepository {
  createSession(record: GameSessionRecord): Promise<void>;
  appendMove(move: GameMoveRecord): Promise<void>;
  completeSession(id: string, result: GameSessionRecord["result"], finalState: string): Promise<void>;
  list(options?: { game?: string; limit?: number; cursor?: number }): Promise<GameSessionRecord[]>;
  getReplay(sessionId: string): Promise<GameMoveRecord[]>;
  deleteSession(sessionId: string): Promise<void>;
  clearAll(): Promise<void>;
}
```

## 6. Data lifecycle
- Lưu session khi bắt đầu.
- Lưu nước đi sau khi engine xác nhận.
- Debounce autosave tối đa 300–700ms; không làm mất move đã xác nhận.
- Khi kết thúc, cập nhật result và final state.
- Khi người dùng xóa, xóa session và moves liên quan trong transaction.
- Có nút xóa toàn bộ dữ liệu với xác nhận rõ ràng.

## 7. Migration
Mỗi record có `schemaVersion`. Migration phải:
1. Đọc version cũ.
2. Chuyển đổi theo từng bước.
3. Không xóa dữ liệu nếu migration lỗi.
4. Có backup/export JSON trước migration lớn khi phù hợp.

## 8. Giới hạn
Local data gắn với trình duyệt và thiết bị; xóa browser data có thể làm mất dữ liệu. Không đồng bộ đa thiết bị trong MVP. Hiển thị thông tin này trong Settings/Privacy.
