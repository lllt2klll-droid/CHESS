# CHESS MODULE — CỜ VUA

## 1. Board and coordinates
- 8×8, files a–h, ranks 1–8.
- White ở dưới theo hướng mặc định.
- Hỗ trợ orientation flip để đổi phía quan sát, không đổi luật.
- 3D coordinate mapping phải thống nhất với engine.

## 2. Rules
- King, Queen, Rook, Bishop, Knight, Pawn.
- Check, checkmate, stalemate.
- Castling: kingside/queenside, điều kiện ô trống và ô không bị tấn công.
- En passant.
- Promotion: Queen/Rook/Bishop/Knight.
- Draw: stalemate, insufficient material, repetition, 50/75 move rules theo thư viện và UX.
- Không cho phép vua tự đi vào ô bị tấn công.

## 3. Engine recommendation
Dùng thư viện đã được kiểm chứng như `chess.js` để xử lý legal moves, SAN, FEN, PGN. Kiểm tra phiên bản và API trước khi code. Không tự viết luật chess sơ sài.

## 4. UI
- Highlight selected square, legal destinations, last move, check.
- Click/tap quân rồi chọn ô; hỗ trợ drag nếu không gây lỗi touch.
- Promotion chooser dạng glass popover.
- History notation panel thu gọn.
- Undo/restart/resign/draw actions trong menu phụ.

## 5. AI
- Easy: chọn nước hợp lệ, ưu tiên phát triển quân và tránh treo quân rõ ràng.
- Medium: search depth giới hạn, alpha-beta hoặc engine nhẹ; ưu tiên thời gian phản hồi.
- Hard (tùy chọn): engine mạnh hơn hoặc WASM chess engine nếu license và kích thước phù hợp.
- Chạy trong Web Worker; không block UI.
- Đánh giá license của mọi engine bên thứ ba trước khi phân phối.

## 6. Tests
- Initial legal move count 20.
- Castling legal/illegal cases.
- En passant.
- Promotion choices.
- Check/checkmate/stalemate.
- Pinned piece cannot expose king.
- Undo restores castling/en-passant/repetition state.
- Random legal playout never creates invalid king state.
