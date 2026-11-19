# MUSIC PLAYER — VINYL, LOCAL FILE, YOUTUBE

## 1. UX
- Default collapsed: đĩa than nhỏ hoặc icon music; không chiếm góc lớn.
- Expanded: vinyl xoay, tên track, source label, play/pause, volume, playlist.
- Trên mobile mở thành bottom sheet.
- Không autoplay khi mới vào website.
- Khi track đang phát, đĩa xoay; pause thì dừng hoặc giảm tốc theo motion preference.

## 2. Supported sources

### Built-in / direct audio
- Dùng HTMLAudioElement.
- Chỉ nhận URL audio trực tiếp có định dạng/response phù hợp.
- CORS có thể ảnh hưởng một số nguồn; hiển thị lỗi rõ.
- Không giả định mọi URL webpage là file audio.

### Local file
- `<input type="file" accept="audio/*">`.
- Tạo object URL và revoke khi thay track/thoát.
- File mặc định chỉ phát trong phiên; không upload.
- Nếu muốn lưu file lâu dài, cần opt-in và IndexedDB quota handling.

### YouTube
- Dùng YouTube IFrame Player API/embed chính thức.
- Chấp nhận URL video hoặc youtu.be, parse video ID an toàn.
- Không tải/giải mã audio từ YouTube, không bypass ads, không ép phát nền.
- Một số video bị chủ sở hữu chặn embed hoặc có giới hạn vùng; phải hiển thị trạng thái không phát được.
- Tuân thủ autoplay policy; yêu cầu click Play.
- Nền tảng có thể giới hạn phát khi tab background hoặc trên mobile.

## 3. Player state
```ts
type MusicState = {
  sourceType: "builtin" | "direct-audio" | "local-file" | "youtube" | null;
  title: string;
  status: "idle" | "loading" | "playing" | "paused" | "error";
  volume: number;
  muted: boolean;
  currentTime?: number;
  duration?: number;
  errorCode?: string;
};
```

## 4. Vinyl animation
- CSS transform rotate hoặc animation trong DOM.
- Không cần render đĩa than bằng Three.js.
- Animation chỉ chạy khi player status = playing.
- Respect reduced motion.

## 5. Playlist
- Metadata: title, source type, source URL/asset id.
- Next/previous chỉ hoạt động khi có playlist.
- Không lưu file blob lớn mặc định.
- Không tự tải nội dung playlist từ link lạ.

## 6. Errors
- Invalid URL.
- Unsupported audio MIME.
- Network/CORS error.
- YouTube embed disabled.
- Playback blocked until user gesture.
- Local file removed/unavailable.
Mọi lỗi chỉ ảnh hưởng Music Player, không ảnh hưởng game.

## 7. Privacy
- Không gửi file local lên server.
- Không lưu URL nhạy cảm nếu không cần.
- Cho phép xóa playlist và lịch sử nguồn nhạc.
