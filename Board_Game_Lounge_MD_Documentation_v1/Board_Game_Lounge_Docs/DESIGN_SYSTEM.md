# DESIGN SYSTEM — MINIMAL LIQUID GLASS

## 1. Design direction
**Minimalist Grass Chess**: thảm cỏ và bàn cờ là nội dung chính. Không thêm cây, nhà, hồ, núi hoặc vật trang trí không cần thiết. Với chế độ Grass & Sky chỉ thêm bầu trời và ánh sáng tự nhiên.

Phong cách: trong trẻo, xanh dịu, ánh sáng mềm, Liquid Glass nhẹ. Tránh neon, viền phát sáng dày, blur quá mạnh và panel quá lớn.

## 2. UI density — yêu cầu ưu tiên cao
- Càng ít nút thường trực càng tốt.
- Nút nhỏ về mặt thị giác; vùng chạm trên mobile vẫn đạt tối thiểu khoảng 44×44 CSS px.
- Chỉ hiển thị 3–5 hành động chính tại một thời điểm.
- Chức năng phụ gom vào menu, popover hoặc bottom sheet.
- Panel có thể thu gọn và nhớ trạng thái.
- Không để nhãn văn bản dài cạnh mọi icon; dùng tooltip trên desktop và accessible label.
- Tránh toolbar dày đặc ở đáy màn hình.
- Không dùng nút nổi chồng lên ô cờ.

## 3. Layout

### Desktop
- Canvas chiếm khoảng 88–94% viewport.
- Brand nhỏ ở góc trên trái hoặc chỉ hiện trong Home.
- Game selector là panel compact, có thể thu gọn.
- Music player ở góc trên phải, mặc định thu gọn thành đĩa than/icon.
- Camera actions chỉ xuất hiện khi mở menu camera.
- Environment và settings nằm trong một panel.
- Bàn cờ luôn là tiêu điểm.

### Mobile
- Canvas full viewport, safe-area aware.
- Top bar mỏng: Back, tên game/turn, More.
- Music player mặc định icon/mini vinyl; mở thành bottom sheet.
- Game selector mở dạng bottom sheet.
- Camera điều khiển bằng gesture; nút reset nhỏ.
- Settings trong drawer/bottom sheet.
- Không đặt các panel cố định ở cả bốn góc.
- Không làm vùng bàn cờ quá nhỏ; ưu tiên bàn cờ hơn panel.

## 4. Tokens

```css
:root {
  --grass-900: #163d2b;
  --grass-700: #286343;
  --grass-500: #4f9866;
  --grass-300: #9bc99b;
  --sky-300: #b9dcf5;
  --cream-100: #f8f5eb;
  --wood-700: #5b3b2b;
  --ink-900: #1d2b24;

  --glass-bg: rgba(245, 250, 247, 0.20);
  --glass-bg-strong: rgba(245, 250, 247, 0.34);
  --glass-border: rgba(255, 255, 255, 0.48);
  --glass-shadow: 0 8px 28px rgba(15, 40, 27, 0.12);
  --glass-blur: 14px;

  --radius-sm: 10px;
  --radius-md: 16px;
  --radius-lg: 22px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
}
```

## 5. Glass component rules
- Background translucent with backdrop-filter blur.
- Thin light border; no thick white outline.
- Shadow soft and low contrast.
- Ensure text contrast against variable grass/sky backgrounds; use subtle dark/bright scrim behind text if needed.
- Fallback background when backdrop-filter unsupported.
- Reduced transparency option for readability/performance.
- Active state uses a subtle tint, not a large glow.
- Hover only on devices with hover support.

## 6. Components
- `GlassIconButton`: icon-only, tooltip/aria-label, compact.
- `GlassButton`: primary/secondary/quiet.
- `GlassPanel`: compact content panel, collapsible.
- `GlassPopover`: contextual options.
- `GlassBottomSheet`: mobile settings/game selector/music.
- `MiniVinylPlayer`: compact/expanded states.
- `GameBoardOverlay`: turn/status/history controls.
- `SegmentedControl`: small choice sets.
- `Slider`: wind/volume/brightness.
- `Toast`: short non-blocking feedback.

## 7. Typography
- Use a legible sans-serif such as Inter or system UI.
- Headings small and restrained; avoid oversized marketing text inside game screen.
- Use tabular numbers for timers/counters.
- Vietnamese diacritics must render correctly.

## 8. Motion
- UI transitions 140–220ms, ease-out.
- Piece move animation 160–280ms, configurable.
- Grass motion continuous but low amplitude.
- Avoid parallax that competes with board.
- Respect `prefers-reduced-motion`.
- No mandatory loading animation longer than necessary.

## 9. Responsive breakpoints
- Small mobile: <= 390px.
- Mobile: 391–767px.
- Tablet: 768–1023px.
- Desktop: >= 1024px.
Use fluid sizing and safe-area insets; do not depend only on fixed breakpoint values.

## 10. Accessibility
- Keyboard focus visible.
- All icon-only controls have accessible names.
- Color is not the only indicator of selected/legal moves.
- Touch targets remain usable despite visually small buttons.
- Text contrast checked over grass and sky.
- Provide 2D board interaction option for users who cannot use 3D controls.
