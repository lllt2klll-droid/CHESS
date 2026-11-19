# WEATHER & ENVIRONMENT

## 1. Modes
### Grass Only
- Không hiển thị sky dome/horizon.
- Ground/grass phủ toàn khung nhìn.
- Ánh sáng vẫn thay đổi theo preset.
### Grass & Sky
- Sky gradient hoặc sky dome đơn giản.
- Mây nhẹ tùy chọn, không cần volumetric clouds ở MVP.
- Đường chân trời mềm, không có vật thể trang trí.

## 2. Auto time
Mặc định `Auto` dựa trên giờ địa phương của thiết bị:
- Morning: 05:00–09:59.
- Noon: 10:00–15:59.
- Sunset: 16:00–18:29.
- Night: 18:30–04:59.

Các mốc này có thể cấu hình. Không cần gọi API để xác định thời gian trong ngày.

## 3. Manual presets
- Morning: ánh sáng vàng nhạt.
- Noon: ánh sáng sáng, trung tính.
- Sunset: tông cam hồng dịu.
- Night: ánh sáng xanh tím nhẹ, trăng là thành phần sky tùy chọn.
- Clear/Breeze/Mist/Light Rain là preset hiệu ứng, không phải dự báo thời tiết thật.

## 4. Wind
- Toggle on/off.
- Slider intensity 0..1.
- Direction preset hoặc hướng thay đổi rất chậm.
- Cỏ phản ứng nhẹ theo gió.
- Có thể thêm âm thanh gió tùy chọn, mặc định tắt hoặc rất nhỏ.

## 5. Real weather API
Không bắt buộc trong MVP. Nếu bổ sung:
- Chỉ gọi khi người dùng bật “Use local weather”.
- Giải thích quyền vị trí và dữ liệu được gửi.
- Có fallback khi từ chối quyền/API lỗi.
- Không hiển thị “đang mưa ngoài trời” nếu chỉ đang dùng visual preset.
- API key phải qua serverless function nếu nhà cung cấp yêu cầu secret; không commit key vào client.

## 6. Rain/mist effects
- Mưa nhẹ: particle count giới hạn, không che board.
- Sương: fog nhẹ, giảm opacity; không làm quân cờ mất tương phản.
- Có thể tắt effects để tăng hiệu năng.
- Không cần mô phỏng giọt nước va chạm vật lý.

## 7. Settings persistence
Lưu world mode, time mode, preset, wind enabled/intensity, quality. Áp dụng ngay mà không restart ván cờ.
