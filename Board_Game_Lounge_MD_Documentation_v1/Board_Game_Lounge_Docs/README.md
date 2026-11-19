# Board Game Lounge — Bộ tài liệu dự án

**Phiên bản:** 1.0  
**Mục tiêu:** Xây dựng website chơi cờ 3D thư giãn, triển khai trên Vercel, chạy tốt trên desktop và mobile.

## 1. Tầm nhìn sản phẩm

Board Game Lounge là không gian chơi cờ tối giản: một bàn cờ 3D đặt trên thảm cỏ, cỏ chuyển động nhẹ theo gió, ánh sáng và bầu trời có thể thay đổi. Người dùng có thể chơi Cờ vua, Cờ tướng, Caro và Cờ đam; chơi hai người trên cùng thiết bị hoặc đấu với máy.

Giao diện sử dụng Liquid Glass nhưng tiết chế: bàn cờ luôn là tâm điểm, các nút nhỏ, ít thành phần thường trực, chức năng phụ nằm trong popover/drawer có thể thu gọn.

## 2. Phạm vi phiên bản đầu

### Bắt buộc (MVP)
- Bốn trò chơi: Cờ vua, Cờ tướng, Caro, Cờ đam.
- Hai chế độ: hai người cùng thiết bị, đấu với máy.
- Bàn cờ 3D tương tác: xoay, zoom, pan có giới hạn, reset camera.
- Camera presets: trên xuống, nghiêng, ngang thấp; góc nhìn quân cờ ở mức camera gần quân.
- Hai môi trường: Grass Only và Grass & Sky.
- Cỏ lay nhẹ theo gió; cường độ gió tùy chỉnh.
- Ánh sáng/thời gian: tự động theo giờ địa phương và điều chỉnh thủ công; nắng, hoàng hôn, đêm trăng, mưa/sương là preset hình ảnh.
- Music player: nhạc từ URL hợp lệ, file người dùng chọn, YouTube embed hợp lệ.
- Lưu cài đặt và lịch sử ván cờ trên thiết bị.
- Fullscreen, responsive desktop/mobile.
- Giao diện ít nút; panel có thể thu gọn; hỗ trợ bàn phím và cảm ứng.
- Deploy Vercel qua GitHub.

### Chưa thuộc MVP
- Tài khoản, đồng bộ lịch sử đa thiết bị, matchmaking, phòng online, chat.
- Nhiều người chơi online thời gian thực.
- Tải nhạc lên máy chủ hoặc chia sẻ file nhạc.
- Weather API bắt buộc. Chế độ tự động ban đầu dựa trên giờ địa phương; dữ liệu thời tiết thật là tùy chọn và cần quyền/vị trí hoặc API.

## 3. Nguyên tắc không được phá vỡ
1. Luật chơi phải chính xác; không tự viết luật bằng kiểm tra di chuyển đơn giản.
2. Game state là nguồn dữ liệu duy nhất; giao diện 2D/3D chỉ hiển thị và gửi hành động.
3. Không làm hỏng tính năng đang hoạt động khi thêm module mới.
4. 3D phải có chế độ giảm chất lượng và fallback 2D/ảnh tĩnh nếu thiết bị yếu.
5. Không tự phát âm thanh khi chưa có tương tác người dùng.
6. Không tự tải/đọc URL bất kỳ như thể mọi link YouTube đều có thể phát.
7. Không lưu nội dung file nhạc lớn vào LocalStorage.
8. Không để hiệu ứng hoặc panel che khuất bàn cờ và vùng thao tác.
9. Tất cả nút phải có hành động thật, trạng thái disabled/loading rõ ràng.
10. Mọi module phải có kiểm thử trước khi tích hợp.

## 4. Cấu trúc tài liệu

| Tài liệu | Mục đích |
|---|---|
| `PROJECT_PLAN.md` | Mục tiêu, phạm vi, roadmap, tiêu chí hoàn thành |
| `TECHNICAL_ARCHITECTURE.md` | Kiến trúc ứng dụng và luồng dữ liệu |
| `TASKS.md` | Công việc chia nhỏ theo sprint và thứ tự |
| `DATABASE_SCHEMA.md` | Mô hình dữ liệu và lưu trữ local |
| `DESIGN_SYSTEM.md` | Visual language, Liquid Glass, responsive |
| `GAME_RULES_OVERVIEW.md` | Quy tắc và kiến trúc chung của 4 trò chơi |
| `CHESS_MODULE.md` | Cờ vua |
| `XIANGQI_MODULE.md` | Cờ tướng |
| `GOMOKU_MODULE.md` | Caro |
| `CHECKERS_MODULE.md` | Cờ đam |
| `THREE_D_WORLD.md` | Thế giới 3D, cỏ, bàn cờ, ánh sáng |
| `CAMERA_SYSTEM.md` | Điều khiển camera và góc nhìn quân cờ |
| `WEATHER_ENVIRONMENT.md` | Thời gian, thời tiết, gió và môi trường |
| `MUSIC_PLAYER.md` | Đĩa than, file nhạc và YouTube |
| `AI_OPPONENT.md` | AI mức dễ/trung bình/khó |
| `PERFORMANCE_ACCESSIBILITY.md` | Hiệu năng, mobile, accessibility |
| `TESTING_DEPLOYMENT.md` | Kiểm thử, bảo mật cơ bản, Vercel |
| `AI_CODING_GUIDE.md` | Prompt và quy tắc giao việc cho AI lập trình |

## 5. Định nghĩa hoàn thành tổng thể
Dự án chỉ được xem là hoàn thành khi:
- Cả bốn trò chơi chạy đúng luật, chơi được từ đầu đến kết thúc.
- Hai chế độ người-người và người-máy hoạt động.
- Lịch sử có thể xem lại và xóa; cài đặt tồn tại sau khi tải lại trang.
- Camera hoạt động bằng chuột, trackpad và cảm ứng.
- Môi trường và cỏ có chuyển động ổn định, không làm giảm khả năng chơi.
- YouTube/file nhạc có xử lý lỗi và không làm hỏng game khi không phát được.
- Giao diện dùng được ở chiều rộng 360px trở lên.
- Không có lỗi console nghiêm trọng, không có nút giả.
- Build production thành công và deploy được trên Vercel.
