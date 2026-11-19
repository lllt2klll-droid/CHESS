# AI OPPONENT — EASY / MEDIUM / HARD

## 1. UX
- AI level mặc định Medium theo yêu cầu.
- Người dùng chọn Easy/Medium/Hard khi bắt đầu ván.
- Hiển thị “Máy đang suy nghĩ…” bằng indicator nhỏ.
- Không hiển thị chuỗi suy nghĩ nội bộ; chỉ có thể hiển thị giải thích nước đi ngắn nếu tính năng được bật.
- Có giới hạn thời gian và nút hủy/restart.

## 2. Architecture
```ts
interface AIPlayer<State, Move> {
  chooseMove(input: {
    state: State;
    legalMoves: Move[];
    difficulty: "easy" | "medium" | "hard";
    timeLimitMs: number;
    signal?: AbortSignal;
  }): Promise<Move>;
}
```
AI chạy trong Web Worker. Controller kiểm tra move trả về bằng engine trước khi apply.

## 3. Difficulty profile
- Easy: heuristic đơn giản, đôi khi chọn nước không tối ưu; vẫn phải hợp lệ.
- Medium: search/heuristic có chiều sâu vừa phải, ưu tiên chiến thuật cơ bản.
- Hard: search sâu hơn và time budget lớn hơn.
Các mức phải có khác biệt thực tế, không chỉ đổi tên.

## 4. Per-game strategy
### Chess
- Dùng engine nhẹ hoặc WASM engine phù hợp license.
- Easy depth thấp/limited time.
- Medium depth vừa và evaluation cơ bản.
- Hard tăng depth/time, move ordering.
### Xiangqi
- Minimax + alpha-beta.
- Evaluation: material, king safety, mobility, cannon/horse activity, pawn advancement.
### Gomoku
- Candidate moves gần quân hiện có.
- Threat detection: win-now, block-now, open four, double threats.
- Medium search giới hạn.
### Checkers
- Minimax/alpha-beta.
- Evaluation: pieces, kings, mobility, promotion distance, forced capture.

## 5. Time budgets
Gợi ý ban đầu:
- Easy: 100–250ms.
- Medium: 300–800ms.
- Hard: 800–1800ms.
Điều chỉnh theo thiết bị; ưu tiên phản hồi nhanh hơn search dài trên mobile.

## 6. Reliability
- AI chỉ trả legal move.
- Nếu Worker lỗi/timeout, thử fallback legal move.
- Nếu không còn legal moves, engine xác định terminal; AI không được tự kết luận.
- Hủy tác vụ cũ khi game session đổi.
- Không block main thread.

## 7. Tests
- AI output luôn thuộc legalMoves.
- AI không đi sau terminal state.
- Timeout không khóa app.
- Restart trong lúc AI nghĩ không làm nước cũ xuất hiện.
- Cùng state/seed có thể reproducible trong test.
