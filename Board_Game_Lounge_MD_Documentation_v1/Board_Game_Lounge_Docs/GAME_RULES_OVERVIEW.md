# GAME RULES OVERVIEW

## 1. Game architecture
Mỗi trò chơi là một engine độc lập. Không dùng một engine chung để xử lý luật khác nhau. Chỉ chia sẻ interface, session lifecycle, history, AI adapter và UI primitives.

## 2. Shared game lifecycle
- Select game.
- Select mode: local two-player hoặc vs AI.
- Create initial state.
- Accept legal move.
- Update turn and status.
- Undo/restart/resign.
- Complete game.
- Persist record.
- Replay.

## 3. Input model
Mọi input từ 3D board, 2D board, keyboard hoặc touch đều chuyển thành `GameAction`. Controller xác thực trước khi gọi engine.

## 4. Common status
- `playing`
- `check` (chỉ game có khái niệm chiếu)
- `checkmate`
- `won`
- `draw`
- `stalemate`
- `resigned`

## 5. Notation
- Chess: UCI/SAN hoặc FEN/PGN theo thư viện.
- Xiangqi: lưu move theo tọa độ nội bộ; notation hiển thị theo chuẩn được chọn.
- Gomoku: tọa độ hàng/cột.
- Checkers: tọa độ ô playable và notation dạng from-to/jump sequence.

## 6. Undo
- Local two-player: undo một ply hoặc hai ply theo lựa chọn UX; mặc định undo một nước.
- Vs AI: undo cả lượt người + lượt AI để trở về trạng thái người chơi có thể đi.
- Engine phải giữ snapshot hoặc state immutable để undo chính xác.

## 7. Draw and terminal states
Không cho phép move sau khi game terminal. Hiển thị lý do kết thúc. Không tự suy diễn hòa nếu luật chưa định nghĩa.

## 8. AI
AI nhận state, side, legal moves và profile. AI chỉ trả move; engine xác thực. Nếu timeout hoặc lỗi, cung cấp retry hoặc fallback move hợp lệ.
