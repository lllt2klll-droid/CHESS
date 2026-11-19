# GOMOKU MODULE — CARO

## 1. Board
- Mặc định 15×15 giao điểm.
- Cho phép cấu hình 13×13 hoặc 19×19 trong settings nâng cao nếu muốn.
- Hai loại quân: X/O hoặc đá đen/trắng.
- Người chơi đánh vào giao điểm trống.

## 2. Win rule
MVP: thắng khi tạo được ít nhất 5 quân liên tiếp theo ngang, dọc hoặc hai đường chéo. Đây là rule “freestyle five or more”.
Nếu muốn luật Caro Việt Nam chặn hai đầu hoặc exact-five, phải thêm `ruleSet` riêng và test đầy đủ; không trộn rule sets trong cùng một ván.

## 3. Draw
- Hết giao điểm trống mà chưa có người thắng => hòa.
- Không cho đặt quân sau khi terminal.

## 4. UI/3D
- Bàn dạng lưới mảnh trên mặt gỗ/đá trung tính; có thể giữ phong cách board tối giản.
- Quân đá có độ nổi nhẹ và bóng đổ.
- Legal cell highlight chỉ khi chọn/hover.
- Mobile: tap giao điểm, không yêu cầu drag.

## 5. AI
- Easy: chọn ô gần vùng đã có quân, ưu tiên chặn thắng trực tiếp.
- Medium: threat-space heuristic, immediate win/block, open-four/open-three scoring, candidate move pruning; search depth/time capped.
- Hard: alpha-beta/negamax hoặc threat search sâu hơn.
- Không cần duyệt toàn bộ 225 ô ở mọi ply; chỉ xét candidate cells quanh quân hiện có.
- AI chạy Worker.

## 6. Tests
- 5 liên tiếp đủ bốn hướng.
- 4 liên tiếp không thắng.
- Hết bàn hòa.
- Không đặt quân vào ô đã chiếm.
- Rule-set switch không làm thay đổi game đang diễn ra.
