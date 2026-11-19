# PROJECT PLAN

## 1. Mục tiêu
Tạo một website board-game lounge 3D tối giản, thư giãn, có bốn trò chơi, AI đối thủ, âm nhạc và môi trường tùy chỉnh. Ưu tiên cân bằng giữa gameplay chính xác, thẩm mỹ 3D và hiệu năng đa thiết bị.

## 2. Người dùng mục tiêu
- Người muốn chơi cờ thư giãn một mình hoặc cùng bạn bè trên một thiết bị.
- Người dùng desktop, laptop, tablet và smartphone.
- Người mới chơi cần AI dễ; người có kinh nghiệm cần mức khó cao hơn.

## 3. Phạm vi sản phẩm

### 3.1 Trò chơi
| Trò chơi | Bàn | Chế độ |
|---|---|---|
| Cờ vua | 8×8 | 2 người, AI |
| Cờ tướng | 9 đường dọc × 10 đường ngang, có sông/cung | 2 người, AI |
| Caro | Kích thước cấu hình, mặc định 15×15 | 2 người, AI |
| Cờ đam | Bàn 8×8, biến thể quốc tế/Anh phải chốt luật; MVP dùng American/English checkers | 2 người, AI |

**Lưu ý:** Không trộn luật giữa các biến thể. Với cờ đam, mặc định MVP là English/American checkers 8×8: quân đi chéo tiến một ô, ăn bằng nhảy, vua đi chéo một ô; bắt buộc ăn nếu có nước ăn. Nếu muốn biến thể khác, cấu hình luật phải tách riêng.

### 3.2 Môi trường
- Grass Only: mặt cỏ kéo dài, không có đường chân trời.
- Grass & Sky: mặt cỏ và bầu trời, đường chân trời mềm.
- Gió: nhẹ mặc định; có thể tăng/giảm/tắt.
- Cỏ chuyển động theo gió; không cần mô phỏng vật lý từng lá cỏ.
- Preset ánh sáng: Auto, Morning, Noon, Sunset, Night.
- Preset thời tiết hình ảnh: Clear, Breeze, Mist, Light Rain. Không khẳng định đây là thời tiết thực tế nếu chưa gọi dịch vụ thời tiết.

### 3.3 Âm nhạc
- Mini-player dạng đĩa than ở trạng thái thu gọn.
- Nguồn: nhạc mẫu/URL trực tiếp được phép CORS, file local do người dùng chọn, YouTube embed.
- Điều khiển play/pause, mute, volume, next/previous với playlist nội bộ.
- Không trích xuất âm thanh YouTube, không tải video, không bỏ qua quảng cáo hoặc giới hạn nền tảng.

## 4. UX ưu tiên
- Bàn cờ chiếm phần lớn diện tích.
- Chỉ hiện các nút thường dùng: back/home, game menu, music, settings.
- Camera control xuất hiện khi người dùng tương tác hoặc mở menu camera.
- Mỗi panel có trạng thái collapsed/expanded.
- Desktop: panel nổi ở cạnh, không chiếm trung tâm.
- Mobile: toolbar thấp, gọn; menu dạng bottom sheet; nút icon nhỏ nhưng vùng chạm đủ lớn.
- Không hiển thị đồng thời mọi thiết lập.

## 5. Roadmap đề xuất

### Phase 0 — Khởi tạo và xác minh
- Tạo repo, Vite, React, TypeScript, lint, format, test.
- Xác minh WebGL/WebGPU fallback, mobile layout.
- Chốt luật cờ đam English/American checkers và luật thắng Caro (5 liên tiếp, có/không chặn hai đầu cần cấu hình; mặc định thắng khi có 5 liên tiếp).

### Phase 1 — Core app và design system
- Routing/màn hình Home, Game, Settings.
- Theme tokens, Liquid Glass components.
- Responsive shell, keyboard/focus.
- Local persistence adapter.

### Phase 2 — Game engines (2D trước)
- Tạo interface engine chung.
- Hoàn thiện từng game với unit tests.
- Game history, undo/restart, draw/terminal state.
- Chế độ hai người cùng thiết bị.

### Phase 3 — AI
- AI riêng cho từng trò.
- Mức Easy/Medium/Hard; có giới hạn thời gian tính.
- Không khóa giao diện trong lúc AI tính.
- Có thể hủy tác vụ khi người chơi restart/thoát ván.

### Phase 4 — 3D board
- Scene, camera, renderer, lighting, board mesh, pieces.
- Đồng bộ từ game state sang 3D.
- Animation chọn/di chuyển/ăn quân.
- Chế độ reduced motion và low quality.

### Phase 5 — Environment & camera
- Grass Only/Grass & Sky.
- Grass wind shader/instancing.
- Camera orbit/zoom/presets/focus piece.
- Time-of-day presets và weather effects.

### Phase 6 — Music
- Vinyl UI.
- HTMLAudioElement cho direct audio/file.
- YouTube IFrame Player API cho video cho phép embed.
- Quyền autoplay, lỗi URL, lưu playlist metadata.

### Phase 7 — History, polish, QA
- Lưu ván hoàn tất và ván đang chơi.
- History viewer/replay.
- Fullscreen, mobile, accessibility.
- Kiểm thử hiệu năng và cross-browser.

### Phase 8 — Deploy
- GitHub main branch.
- Vercel preview deployments.
- Production build, smoke tests.
- README vận hành và hướng dẫn cập nhật.

## 6. Chỉ số chấp nhận
- 4/4 game có test luật trọng yếu.
- 2/2 chế độ chơi hoạt động.
- Tải lại trang vẫn giữ cài đặt.
- History có thể mở lại/replay.
- Camera drag/zoom hoạt động trên desktop và touch.
- Mobile 360×800 không có horizontal overflow.
- Không có panel thường trực che vùng chơi.
- Trên thiết bị tầm trung, mục tiêu 30 FPS trở lên ở chế độ 3D Medium; desktop mục tiêu 50–60 FPS.
- Nếu không đạt, giảm mật độ cỏ, bóng động và post-processing trước khi giảm chất lượng bàn cờ/quân cờ.

## 7. Ngoài phạm vi
Không xây dựng backend tài khoản, multiplayer online, chat, ranking cloud hoặc thanh toán trong bản đầu. Thiết kế adapter để có thể bổ sung sau mà không viết lại game engine.
