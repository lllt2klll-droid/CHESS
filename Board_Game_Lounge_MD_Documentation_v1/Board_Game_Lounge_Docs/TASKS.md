# TASKS — IMPLEMENTATION BACKLOG

## Quy tắc thực hiện
- Làm theo thứ tự; không triển khai toàn bộ trong một lần.
- Mỗi task phải build và test được trước khi chuyển tiếp.
- Không xóa/đổi hành vi đã hoàn thành nếu không có yêu cầu.
- Mỗi module có `README` hoặc comment về public API.
- Commit theo nhóm chức năng.

## Sprint 0 — Foundation
- [ ] Khởi tạo Vite + React + TypeScript.
- [ ] Cấu hình ESLint, Prettier, strict TypeScript.
- [ ] Cấu hình Vitest và Playwright.
- [ ] Tạo routing Home/Game/Settings/History.
- [ ] Tạo ErrorBoundary toàn app.
- [ ] Kiểm tra build production.
**Done:** app chạy local, test mẫu pass, Vercel preview deploy được.

## Sprint 1 — Design system & responsive shell
- [ ] Color/spacing/type/radius/shadow tokens.
- [ ] GlassButton, GlassIconButton, GlassPanel, GlassPopover, BottomSheet.
- [ ] Focus ring, hover/pressed/disabled/loading.
- [ ] Desktop layout và mobile layout.
- [ ] Collapsible panels.
- [ ] Nút icon có tooltip/aria-label.
**Done:** không horizontal overflow ở 360px; UI ít nút thường trực.

## Sprint 2 — Game core
- [ ] GameEngine interface.
- [ ] Coordinate system chuẩn hóa.
- [ ] Move history, undo, restart.
- [ ] Game status và result model.
- [ ] Serialization/deserialization.
- [ ] Unit test cho engine adapter.
**Done:** engine chạy headless không cần React/Three.

## Sprint 3 — Chess
- [ ] Tích hợp thư viện luật chess đã được kiểm chứng (ví dụ chess.js) hoặc triển khai engine đầy đủ có test.
- [ ] Legal moves, check, checkmate, stalemate.
- [ ] Castling, en passant, promotion.
- [ ] Draw claims/rules theo cấu hình thư viện.
- [ ] PGN/FEN import-export nếu phù hợp.
- [ ] Test perft hoặc bộ test luật.
**Done:** không có nước đi bất hợp pháp; replay được.

## Sprint 4 — Xiangqi
- [ ] Board 9×10 và coordinate mapping.
- [ ] Tướng, sĩ, tượng, xe, pháo, mã, tốt.
- [ ] Cung, sông, đường đi và cản quân.
- [ ] Chiếu, chiếu bí, lộ mặt tướng, hòa.
- [ ] Test từng quân và tình huống biên.
**Done:** luật được kiểm chứng bằng test độc lập.

## Sprint 5 — Gomoku
- [ ] Board 15×15 mặc định.
- [ ] Đặt quân, lượt, undo/restart.
- [ ] Luật 5 liên tiếp.
- [ ] Cấu hình exact-five hoặc overline nếu cần.
- [ ] Test ngang/dọc/chéo và hòa.
**Done:** xác định thắng chính xác, không cho đi sau khi kết thúc.

## Sprint 6 — Checkers
- [ ] Chốt English/American 8×8.
- [ ] Bắt buộc ăn, chuỗi ăn, phong vua.
- [ ] Luật vua và kết thúc.
- [ ] Test forced capture và multi-jump.
**Done:** engine tuân thủ đúng biến thể đã chọn.

## Sprint 7 — Local multiplayer UX
- [ ] Chọn game và mode.
- [ ] Player labels, turn indicator.
- [ ] Highlight selected/legal targets.
- [ ] Undo/restart/confirm exit.
- [ ] Kết thúc ván và lưu history.
**Done:** hai người chơi trên cùng thiết bị cho cả 4 game.

## Sprint 8 — AI opponents
- [ ] AI adapter async.
- [ ] Easy/Medium/Hard profiles.
- [ ] Chess AI integration.
- [ ] Xiangqi AI.
- [ ] Gomoku search.
- [ ] Checkers search.
- [ ] Cancel/timeout/worker.
**Done:** AI luôn trả move hợp lệ và không khóa UI.

## Sprint 9 — Three.js foundation
- [ ] R3F Canvas.
- [ ] Board scene and coordinate mapper.
- [ ] Materials and lighting.
- [ ] 3D piece models.
- [ ] Raycasting pointer/touch.
- [ ] State-to-mesh sync.
- [ ] 2D fallback.
**Done:** chơi được bằng click/tap trên scene 3D.

## Sprint 10 — Camera
- [ ] Orbit controls.
- [ ] Zoom limits.
- [ ] Camera presets.
- [ ] Focus selected piece.
- [ ] First-person-like piece perspective.
- [ ] Reset camera.
- [ ] Touch gesture conflict handling.
**Done:** không làm mất thao tác chọn quân khi xoay camera.

## Sprint 11 — Grass/environment
- [ ] Grass Only / Grass & Sky.
- [ ] Wind shader/instanced grass.
- [ ] Wind intensity control.
- [ ] Lighting presets and local-time auto.
- [ ] Weather visual presets.
- [ ] Reduced motion/low quality.
**Done:** cỏ chuyển động nhẹ, FPS trong ngưỡng mục tiêu.

## Sprint 12 — Music
- [ ] Vinyl compact player.
- [ ] Direct audio URL player.
- [ ] Local file picker.
- [ ] YouTube IFrame embed.
- [ ] Playlist and volume.
- [ ] Error/blocked embed state.
- [ ] User gesture/autoplay policy.
**Done:** lỗi nhạc không ảnh hưởng gameplay.

## Sprint 13 — Persistence/history/settings
- [ ] Settings repository.
- [ ] IndexedDB game history.
- [ ] Save completed game and optional autosave.
- [ ] Replay viewer.
- [ ] Delete/clear with confirmation.
- [ ] Data migration/versioning.
**Done:** dữ liệu tồn tại sau reload và có thể xóa.

## Sprint 14 — Polish & release
- [ ] Fullscreen.
- [ ] Responsive QA.
- [ ] Accessibility QA.
- [ ] Performance profiling.
- [ ] Browser compatibility.
- [ ] Vercel production deploy.
- [ ] User guide and release checklist.
**Done:** tất cả acceptance criteria trong PROJECT_PLAN đạt.
