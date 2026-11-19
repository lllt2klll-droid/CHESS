# PERFORMANCE, RESPONSIVENESS & ACCESSIBILITY

## 1. Performance targets
Mục tiêu tham khảo, đo trên thiết bị thực:
- Desktop tầm trung: 50–60 FPS.
- Mobile tầm trung: 30–45 FPS ở Medium/Low.
- First interactive UI nhanh; không đợi toàn bộ 3D assets mới cho phép dùng menu.
- Không để AI search chạy main thread.
- Không render scene liên tục khi không cần thiết, trừ lúc cỏ/animation đang hoạt động.

## 2. Quality tiers
### Low
- Grass density thấp.
- Shadow map tắt hoặc thấp.
- Không post-processing.
- DPR giới hạn khoảng 1.
- Giảm particle.
### Medium
- Grass density trung bình.
- Soft shadows vừa.
- DPR giới hạn khoảng 1.25–1.5.
### High
- Grass density cao hơn.
- Shadows chất lượng cao.
- Effects nhẹ.
- DPR có giới hạn để tránh GPU quá tải.
### Auto
- Đo capability/viewport và điều chỉnh.
- Nếu FPS giảm liên tục, giảm quality theo bậc.
- Không tự tăng giảm liên tục gây nhấp nháy.

## 3. Rendering optimization
- InstancedMesh/shader cho cỏ.
- Reuse geometry/material.
- Frustum culling.
- LOD hoặc grass patch density theo khoảng cách.
- Lazy load GLB.
- Texture compression khi phù hợp.
- Clamp pixel ratio.
- Pause/slow render khi tab hidden.
- Không tạo object trong render loop.
- Tránh setState React mỗi frame.

## 4. Responsive
- Desktop: hover tooltips, orbit mouse, keyboard shortcuts.
- Mobile: touch gestures, bottom sheets, safe-area insets.
- Nút nhỏ về hình thức nhưng vùng chạm khoảng 44×44px.
- Board resize theo viewport, giữ aspect ratio.
- Không có horizontal scroll.
- Không để keyboard mobile che input URL hoặc tên người chơi.

## 5. Accessibility
- `prefers-reduced-motion`.
- Keyboard navigation.
- Focus visible.
- ARIA labels cho icon-only controls.
- Contrast đủ trên background động; dùng scrim.
- Không chỉ dùng màu để phân biệt legal/selected.
- 2D fallback và lựa chọn điều khiển không cần orbit.

## 6. Browser support
Kiểm thử phiên bản hiện hành của Chrome, Edge, Safari, Firefox; iOS Safari và Android Chrome. WebGL context loss phải được xử lý.

## 7. Monitoring
- Dev performance overlay chỉ bật trong development.
- Đo frame time, draw calls, triangles, memory khi profiling.
- Không thu thập analytics cá nhân trong MVP nếu chưa có thông báo/consent.
