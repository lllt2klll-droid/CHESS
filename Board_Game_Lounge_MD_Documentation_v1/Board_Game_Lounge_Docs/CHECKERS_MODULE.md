# CHECKERS MODULE — CỜ ĐAM

## 1. Rule set mặc định
MVP dùng English/American Checkers:
- Bàn 8×8; chỉ 32 ô tối màu có thể đặt quân.
- Mỗi bên 12 quân.
- Quân thường đi chéo tiến một ô.
- Ăn bằng nhảy qua quân đối phương vào ô trống ngay sau.
- Bắt buộc ăn nếu có nước ăn.
- Nếu sau khi ăn có thể ăn tiếp, phải tiếp tục chuỗi ăn trong cùng lượt.
- Khi quân thường tới hàng cuối, phong vua; lượt kết thúc theo rule set đã chốt.
- Vua đi chéo một ô tiến/lùi và ăn tiến/lùi.
- Thắng khi đối thủ hết quân hoặc không còn nước hợp lệ; hòa theo repetition/position rules nếu triển khai.

Không dùng luật International Draughts (10×10, flying kings) trong cùng engine mặc định.

## 2. Board coordinates
Chỉ map các ô playable. Dùng coordinate helper chung để 2D/3D không lệch parity.

## 3. UI
- Quân dạng đĩa tròn 3D, hai màu tương phản.
- Vua có crown marker rõ ràng.
- Khi chọn quân, highlight mọi đường ăn hợp lệ.
- Chuỗi ăn thể hiện từng bước; không cho kết thúc lượt sớm nếu còn bắt buộc ăn tiếp.

## 4. AI
- Easy: ưu tiên ăn, phong vua, tránh bị ăn ngay.
- Medium: minimax/alpha-beta depth/time bounded, ưu tiên material, king value, mobility, promotion race.
- Hard: sâu hơn, transposition table và move ordering.
- Worker để không block UI.

## 5. Tests
- Chỉ ô tối được sử dụng.
- Đi tiến đúng hướng.
- Bắt buộc ăn.
- Multi-jump.
- King movement.
- Promotion.
- Endgame no legal moves.
