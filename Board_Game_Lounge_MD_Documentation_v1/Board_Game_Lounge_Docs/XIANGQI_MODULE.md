# XIANGQI MODULE — CỜ TƯỚNG

## 1. Board
- 9 đường dọc × 10 đường ngang; quân đặt trên giao điểm.
- Sông nằm giữa hàng 4 và 5 (index convention phải thống nhất).
- Hai cung tướng ở hai đầu, mỗi cung 3×3 điểm.
- Coordinate model: file 0..8, rank 0..9.

## 2. Pieces and movement
- Tướng: một điểm trực giao trong cung; không được đối mặt tướng nếu cùng cột không có quân chắn.
- Sĩ: đi chéo một điểm trong cung.
- Tượng: đi chéo hai điểm; không qua sông; bị cản bởi mắt tượng.
- Xe: đi ngang/dọc như rook, không nhảy qua quân.
- Pháo: đi ngang/dọc; khi đi không ăn thì không nhảy; khi ăn phải đúng một quân làm ngòi.
- Mã: đi dạng chữ L; bị cản chân mã.
- Tốt: tiến một điểm; qua sông được đi ngang; không đi lùi.

## 3. Game rules
- Không để tướng bị chiếu sau nước đi.
- Chiếu, chiếu bí, hết nước hợp lệ.
- Quy tắc lặp/chiếu dai cần được định nghĩa rõ; MVP có thể áp dụng bộ luật đơn giản đã công bố và không tuyên bố hỗ trợ đầy đủ giải đấu.
- Phân biệt checkmate và stalemate theo luật cờ tướng được chọn; cờ tướng thường bên hết nước hợp lệ bị xử thua.
- Không cho tướng đối mặt trực tiếp.

## 4. 3D presentation
- Board là mặt phẳng có lưới đường, không phải 9×10 ô vuông kín.
- Sông có nhãn “楚河 / 漢界” tùy skin, có thể tắt.
- Pieces dạng trụ tròn khắc chữ; màu đỏ/đen.
- Input raycast vào giao điểm; legal target marker nằm trên giao điểm.

## 5. AI
- Easy: chọn legal move có heuristic đơn giản.
- Medium: minimax/alpha-beta với evaluation vật chất, an toàn tướng, kiểm soát trung tâm, tốt qua sông; giới hạn depth/time.
- Hard: tăng depth và transposition table nếu hiệu năng cho phép.
- Web Worker bắt buộc.

## 6. Tests
- Mỗi loại quân có bộ test riêng.
- Mã, tượng, pháo bị cản đúng.
- Tượng không qua sông.
- Sĩ/tướng ở trong cung.
- Tốt không lùi.
- Tướng không đối mặt.
- Không được tự đưa tướng vào thế bị chiếu.
