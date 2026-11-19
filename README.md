# Board Game Lounge — Relax • Play • Enjoy

Một website giải trí chơi cờ 3D tối giản, thư giãn, hiện đại và chuẩn mực trực tiếp trên trình duyệt, hỗ trợ chơi 2 người trên cùng thiết bị và đấu với máy (AI).

![Board Game Lounge Preview](/public/board-icon.svg)

---

## 🌟 Tính năng nổi bật

### 1. Bốn trò chơi cờ kinh điển (Chuẩn luật 100%)
- **Cờ Vua (Chess):** Tích hợp luật FIDE đầy đủ (nhập thành, bắt tốt qua đường, phong cấp, chiếu/chiếu bí, hòa theo luật).
- **Cờ Tướng (Xiangqi):** Bàn cờ 9×10, cung tướng, sông, cản chân mã, cản mắt tượng, tướng không đối mặt, chiếu bí / hết nước đi.
- **Cờ Caro (Gomoku):** Bàn cờ 15×15, luật 5 quân liên tiếp (ngang, dọc, 2 đường chéo).
- **Cờ Đam (Checkers):** Chuẩn English/American Checkers 8×8 trên 32 ô tối, bắt buộc ăn (forced capture), chuỗi ăn liên hoàn (multi-jump), phong vua (King).

### 2. Không gian 3D thư giãn (Minimalist Grass & Sky)
- Thảm cỏ xanh mát với hàng ngàn ngọn cỏ đu đưa theo gió nhẹ (InstancedMesh + Custom Wind Vertex Shader).
- Bàn cờ và quân cờ 3D chất liệu gỗ ấm áp, tối giản.
- 4 Preset thời gian: **Sáng sớm (Morning)**, **Nắng đẹp (Noon)**, **Hoàng hôn (Sunset)**, **Đêm trăng (Night)**.
- Tự động thay đổi ánh sáng theo giờ địa phương hoặc tùy chỉnh thủ công.

### 3. Giao diện Liquid Glass tối giản & Tinh tế
- Phong cách kính mờ (Backdrop Blur, viền mảnh, độ trong trẻo cao).
- Tối giản các nút bấm, không che khuất bàn cờ.
- Responsive hoàn hảo trên Desktop, Tablet và Mobile (từ 360px).
- Hỗ trợ chế độ Toàn màn hình (Fullscreen).
- Chế độ **2D Board Fallback** mượt mà cho thiết bị cấu hình thấp hoặc khi tắt WebGL.

### 4. AI Đối thủ thông minh
- 3 Cấp độ: **Dễ (Easy)**, **Vừa (Medium)**, **Khó (Hard)**.
- Phản hồi nhanh (200ms - 600ms), không gây giật lag giao diện người dùng.

### 5. Trình phát nhạc Vinyl (Music Player)
- Đĩa than xoay tròn khi phát nhạc và kim đĩa than chân thực.
- Tích hợp sẵn các bản nhạc Lofi & Ambient Piano thư giãn.
- Hỗ trợ nhúng link YouTube trực tiếp (YouTube IFrame API chính thức).

### 6. Lưu trữ & Lịch sử ván đấu (Local Persistence)
- Tự động lưu thiết lập, thời tiết, góc camera vào `LocalStorage`.
- Tự động lưu lịch sử các ván đấu hoàn tất vào `IndexedDB`.
- Xem lại lịch sử các ván cờ đã chơi.

---

## 🛠️ Công nghệ sử dụng

- **Frontend Core:** React 18, TypeScript, Vite 6.
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`).
- **Styling:** Tailwind CSS, CSS Backdrop Filters, Lucide Icons.
- **State Management:** Zustand (phân miền State độc lập với 3D render loop).
- **Game Engine & Rules:** `chess.js`, Pure TypeScript Engines.
- **Testing:** Vitest.
- **Persistence:** LocalStorage & IndexedDB (`idb`).

---

## 🚀 Hướng dẫn cài đặt & Chạy Local

```bash
# Cài đặt dependencies
npm install

# Chạy server phát triển
npm run dev

# Chạy unit tests
npm test

# Build production
npm run build
```

---

## 📦 Triển khai lên Vercel

Dự án được cấu hình sẵn cho Vercel Static Deployment:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
