# CAMERA SYSTEM

## 1. Controls
- Desktop: pointer drag để orbit; wheel để zoom; có thể pan bằng chuột phải/shift drag nếu không xung đột.
- Mobile: một ngón orbit; pinch zoom; hai ngón pan tùy cấu hình.
- Có damping nhẹ, không quá trễ.
- Giới hạn polar angle để tránh camera lộn ngược hoặc chui dưới mặt cỏ.
- Zoom min/max theo kích thước board và viewport.

## 2. Presets
- `top`: gần vuông góc từ trên xuống.
- `isometric`: góc 3/4 mặc định, dễ chơi.
- `low`: ngang thấp, thấy chiều cao quân.
- `piece`: camera tiến đến gần quân đang chọn, hướng nhìn dọc mặt bàn.

“Góc nhìn quân cờ” trong MVP là camera cinematic gần vị trí quân và hướng nhìn qua bàn; không phải điều khiển quân như nhân vật FPS và không thay đổi luật chơi.

## 3. Focus piece
- Lấy world position của quân được chọn.
- Tính camera target mới, giữ khoảng cách và góc hợp lý.
- Animate camera target/position.
- Khi kết thúc animation, người dùng tiếp tục orbit.
- Nếu quân bị bắt hoặc state thay đổi, hủy focus transition cũ.

## 4. Reset
Reset về preset mặc định `isometric` hoặc preset được người dùng chọn. Reset không đổi game state.

## 5. Input priority
1. UI controls.
2. Camera gesture.
3. Board selection.
Không phát nước đi nếu gesture vượt ngưỡng drag. Trên mobile, tránh nhận đồng thời pinch và tap.

## 6. Accessibility
- Có nút preset thay cho yêu cầu gesture chính xác.
- Có chế độ khóa camera.
- Có 2D board alternative.
- Giảm motion theo OS preference.

## 7. Implementation notes
Dùng OrbitControls/Drei hoặc camera rig tự quản lý. Chỉ có một nguồn camera state. Không để cả component và controls cùng ghi camera độc lập. Lưu preset và sensitivity, không nhất thiết lưu mọi tọa độ camera.
