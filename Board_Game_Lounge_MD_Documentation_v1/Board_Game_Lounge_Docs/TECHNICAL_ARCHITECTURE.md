# TECHNICAL ARCHITECTURE

## 1. Kiến trúc tổng quan

Frontend-first, local-first, deploy static trên Vercel.

- UI: React + TypeScript + Vite.
- 3D: Three.js + React Three Fiber + Drei.
- State: Zustand hoặc Context có phân miền; không đưa toàn bộ scene object vào React state.
- Game rules: engine thuần TypeScript, độc lập UI và Three.js.
- Persistence: repository abstraction dùng LocalStorage/IndexedDB.
- Audio: HTMLAudioElement/Web Audio API; YouTube IFrame Player API.
- Tests: Vitest + Testing Library; Playwright cho E2E.
- Deploy: Vercel static build.

## 2. Sơ đồ module

```text
src/
  app/
    App.tsx
    routes/
    providers/
  components/
    glass/
    layout/
    icons/
    overlays/
  features/
    lobby/
    game-shell/
    game-selector/
    history/
    settings/
    music/
    environment/
    camera/
  games/
    core/
      GameEngine.ts
      GameState.ts
      Move.ts
      GameResult.ts
    chess/
    xiangqi/
    gomoku/
    checkers/
  ai/
    common/
    chess/
    xiangqi/
    gomoku/
    checkers/
  three/
    scene/
    boards/
    pieces/
    grass/
    lighting/
    effects/
    camera/
  persistence/
    repositories/
    migrations/
  hooks/
  utils/
  styles/
  test/
```

## 3. Luồng dữ liệu chính

1. Người dùng chọn trò chơi/chế độ.
2. `GameSessionStore` tạo session và yêu cầu game engine tạo initial state.
3. UI 2D và scene 3D subscribe cùng một `GameState`.
4. Người dùng chọn ô/điểm; `GameController` gọi `engine.getLegalMoves()` hoặc `engine.applyMove()`.
5. Engine xác thực nước đi và trả state mới; UI không tự thay đổi bàn cờ.
6. 3D renderer nhận state mới và chạy animation tương ứng.
7. Persistence lưu snapshot/checkpoint và metadata theo debounce.
8. Khi ván kết thúc, tạo history record.

AI chỉ nhận state bất biến và trả về một move hợp lệ. Controller phải xác thực move lần cuối trước khi apply.

## 4. Interface engine chung

```ts
type PlayerId = "p1" | "p2";

interface GameEngine<State, Move, Config> {
  createInitialState(config: Config): State;
  getLegalMoves(state: State, player: PlayerId): Move[];
  applyMove(state: State, move: Move): State;
  getCurrentPlayer(state: State): PlayerId;
  getStatus(state: State): GameStatus;
  serialize(state: State): string;
  deserialize(data: string): State;
  validateMove(state: State, move: Move): boolean;
}
```

`GameStatus` cần biểu diễn: playing, check/checkmate nếu game có khái niệm, win, draw, stalemate, resign. Trạng thái game-specific đặt trong metadata có kiểu.

## 5. State management
Tách store:
- `uiStore`: active panel, modal, selected game.
- `sessionStore`: game id, mode, current state, move list, player turn.
- `environmentStore`: grass mode, wind, lighting, weather preset.
- `cameraStore`: preset, zoom preference, camera controls.
- `musicStore`: source metadata, volume, muted, player status.
- `settingsStore`: quality, reduced motion, sound, theme.
- `historyStore`: danh sách metadata; nội dung lớn lưu IndexedDB.

Không lưu `THREE.Scene`, `Camera`, `Mesh`, `Audio` object trong Zustand persistence.

## 6. Ranh giới 2D và 3D
Game engine là nguồn chân lý. 3D chỉ là renderer và input adapter.
- Click/tap lên mesh => chuyển raycast intersection thành board coordinate.
- Board coordinate => controller gửi action.
- Engine kiểm tra luật.
- State mới => renderer cập nhật mesh.
- Không cho phép mesh tự thay đổi vị trí lâu dài nếu engine từ chối nước đi.

## 7. Lưu trữ
- LocalStorage: cài đặt nhỏ, lựa chọn gần nhất, metadata playlist.
- IndexedDB: game records, move list, replay snapshots, file nhạc không lưu lâu dài mặc định.
- File nhạc local: object URL trong phiên; không persist blob trừ khi người dùng chủ động bật lưu offline và trình duyệt cho phép.
- Có schema version và migration.

## 8. Rendering strategy
- Một Canvas R3F duy nhất cho scene chính.
- Dùng instancing/shader cho cỏ.
- Chỉ render panel HTML qua DOM overlay; không dựng chữ UI trong WebGL.
- Dùng `frameloop="demand"` cho scene ít chuyển động; chuyển sang continuous khi cỏ/gió/animation đang chạy.
- Tạm dừng render khi tab hidden nếu có thể.
- DPR clamp theo thiết bị; không luôn dùng devicePixelRatio đầy đủ.

## 9. Error boundaries
Có ErrorBoundary riêng cho:
- Game module.
- 3D Canvas.
- Music player.
- Persistence.

Nếu 3D lỗi, cung cấp fallback bàn cờ 2D thay vì làm hỏng toàn bộ ứng dụng. Nếu nhạc lỗi, game tiếp tục hoạt động.

## 10. Security/privacy
- Không có secret API key trong frontend.
- Validate URL protocol; chỉ chấp nhận https/http theo từng nguồn.
- YouTube embed dùng domain/API chính thức.
- Không chạy HTML/script từ URL người dùng nhập.
- Không gửi lịch sử ván cờ đi nơi khác trong MVP.
