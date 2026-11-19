# THREE-D WORLD — SCENE, BOARD, PIECES, GRASS

## 1. Visual target
Một mặt cỏ xanh rộng, bàn cờ ở trung tâm. Không có props trang trí. Grass & Sky bổ sung bầu trời đơn giản; Grass Only loại bỏ đường chân trời và giữ mặt cỏ liên tục.

## 2. Scene hierarchy

```text
Scene
 ├─ EnvironmentRoot
 │   ├─ GrassGround
 │   ├─ GrassInstancesOrShader
 │   ├─ SkyDome (optional)
 │   └─ EnvironmentLighting
 ├─ BoardRoot
 │   ├─ BoardBase
 │   ├─ BoardSurface
 │   ├─ GridOrSquares
 │   ├─ CoordinateLabels (optional)
 │   └─ LegalMoveMarkers
 ├─ PiecesRoot
 │   └─ PieceMeshes
 ├─ EffectsRoot
 │   ├─ SelectionRing
 │   └─ MoveEffects
 └─ CameraRig
```

## 3. Board
- Bàn cờ tối giản, viền mỏng, không chân bàn cồng kềnh.
- Cờ vua/cờ đam: ô sáng kem và nâu gỗ đậm.
- Cờ tướng: đường lưới trên mặt phẳng, sông và cung.
- Caro: lưới giao điểm.
- Board dimensions được tính từ game definition, không hardcode vào camera.
- Mesh board không phải nguồn chân lý cho luật.

## 4. Pieces
- Cờ vua: silhouette cổ điển, ivory và dark walnut.
- Cờ tướng: quân tròn có chữ, đỏ/đen.
- Caro: quân đá/đĩa hai màu.
- Cờ đam: đĩa tròn, crown khi phong vua.
- Dùng model GLTF/GLB tối ưu hoặc procedural geometry cho MVP.
- Reuse geometry/material; không tạo material mới mỗi render.
- Có thể chọn skin sau này, nhưng MVP chỉ cần một bộ nhất quán.

## 5. Grass
Không tạo hàng triệu mesh React riêng lẻ.
Ưu tiên:
- Shader vertex displacement trên patch/plane; hoặc
- InstancedMesh với số lượng giới hạn và LOD.
- Chuyển động theo wind direction + time + vertex position.
- Biên độ nhỏ, tần số chậm; cỏ không che bàn cờ.
- Dùng nhiều patch/LOD để tạo cảm giác rộng.
- Grass Only dùng camera/ground treatment để không lộ mép plane.

## 6. Lighting
- Hemisphere/ambient fill.
- Directional key light mô phỏng nắng.
- Shadow map chất lượng tùy thiết bị.
- Tone mapping và color space đúng.
- Không dùng bloom mạnh; chỉ highlight rất nhẹ nếu có.
- Night preset giảm cường độ key light, đổi màu môi trường, giữ board đủ sáng.

## 7. Interaction
- Raycast pointer/touch vào board surface.
- Chuyển intersection point sang board coordinate.
- Kiểm tra UI overlay trước khi nhận input board.
- Khi camera đang drag, không gửi click nước đi.
- Chọn quân: ring/outline nhẹ.
- Legal targets: marker nhỏ, rõ.
- Move animation: interpolate transform; state cuối vẫn do engine quyết định.

## 8. Loading and fallback
- Lazy-load 3D assets.
- Loading state tối giản.
- Nếu WebGL không hỗ trợ hoặc context lost, chuyển sang 2D board.
- Có nút quality Low/Medium/High/Auto.
- Không để Canvas lỗi làm sập toàn app.

## 9. Asset pipeline
- Ưu tiên GLB/GLTF.
- Nén geometry/texture khi phù hợp.
- Texture kích thước hợp lý; tránh 4K nếu không cần.
- Ghi rõ nguồn, license và attribution cho asset ngoài.
- Không sử dụng asset có license không rõ ràng.
