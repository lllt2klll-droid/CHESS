# AI CODING GUIDE — HƯỚNG DẪN GIAO VIỆC CHO AI LẬP TRÌNH

## 1. Vai trò AI
Bạn là senior frontend/game engineer. Hãy xây dựng Board Game Lounge theo từng task trong `TASKS.md`. Đọc các tài liệu liên quan trước khi sửa code. Không tự ý thay đổi phạm vi.

## 2. Quy tắc bắt buộc
1. Không tạo toàn bộ dự án trong một câu trả lời hoặc một commit khổng lồ.
2. Trước mỗi task: nêu file sẽ tạo/sửa và lý do.
3. Chỉ thực hiện task hiện tại; không tự nhảy sang module sau.
4. Không xóa tính năng đang có.
5. Không thay luật game bằng logic giả hoặc kiểm tra di chuyển sơ sài.
6. Không để 3D scene nắm game state riêng.
7. Không hardcode board coordinate ở nhiều nơi.
8. Không lưu Three.js objects vào LocalStorage.
9. Không thêm dependency nếu chưa giải thích lợi ích và license.
10. Sau khi code: chạy typecheck, lint, unit tests và build phù hợp.
11. Nếu test thất bại, sửa nguyên nhân trước khi báo hoàn thành.
12. Không dùng placeholder cho nút được mô tả là hoạt động thật.
13. Không đưa secret API key vào client.
14. Không dùng link YouTube như direct audio URL.
15. Tối ưu mobile ngay từ component đầu tiên.

## 3. Prompt khởi tạo dự án

> Đọc toàn bộ README.md, PROJECT_PLAN.md, TECHNICAL_ARCHITECTURE.md, DESIGN_SYSTEM.md và TASKS.md. Trước tiên chỉ thực hiện Sprint 0. Kiểm tra môi trường hiện tại, tạo Vite + React + TypeScript project theo cấu trúc phù hợp, cấu hình lint/format/test và xác minh build. Không triển khai game, 3D, AI hoặc music ở sprint này. Không xóa file hiện có nếu chưa kiểm tra. Cuối cùng báo cáo file đã tạo/sửa, lệnh đã chạy, kết quả test và task tiếp theo.

## 4. Prompt cho mỗi sprint

> Đọc task tương ứng trong TASKS.md và tài liệu module liên quan. Chỉ triển khai các checkbox thuộc sprint hiện tại. Trước khi code, liệt kê kế hoạch file. Giữ nguyên public API đã được sprint trước xác nhận. Viết test cho hành vi mới và regression test cho hành vi liên quan. Chạy typecheck, lint, test và build. Nếu có yêu cầu mơ hồ hoặc xung đột giữa tài liệu, dừng và báo rõ; không tự bịa luật hoặc hành vi. Kết thúc bằng báo cáo: hoàn thành, chưa hoàn thành, test, rủi ro, commit đề xuất.

## 5. Prompt kiểm tra không phá tính năng

> Thực hiện regression audit. So sánh hành vi hiện tại với acceptance criteria và các module đã hoàn thành. Tìm lỗi về state synchronization, game rules, mobile input, camera-vs-board gesture, persistence migration, audio lifecycle, WebGL fallback. Không refactor diện rộng. Chỉ sửa lỗi có bằng chứng và thêm test tái hiện lỗi. Báo rõ file thay đổi.

## 6. Definition of Done cho một task
- Code chạy được.
- TypeScript không có lỗi.
- Có test cho logic quan trọng.
- Không có nút giả.
- Responsive phù hợp.
- Không phá task đã hoàn thành.
- Có mô tả cách kiểm thử thủ công.
- Cập nhật TASKS.md.

## 7. Quy trình debug
1. Tái hiện lỗi.
2. Xác định module chịu trách nhiệm.
3. Tạo test tái hiện.
4. Tìm root cause.
5. Sửa nhỏ nhất có thể.
6. Chạy test liên quan và regression.
7. Không che lỗi bằng `any`, timeout tùy tiện hoặc disable test.

## 8. Lưu ý cho AI coding agent
AI có thể tạo sai luật cờ, camera mapping và touch handling. Những phần này cần test rõ ràng. Với cờ vua nên dùng thư viện luật đã kiểm chứng. Với cờ tướng/cờ đam, không chấp nhận engine chưa có test cho từng quân và luật đặc biệt.
