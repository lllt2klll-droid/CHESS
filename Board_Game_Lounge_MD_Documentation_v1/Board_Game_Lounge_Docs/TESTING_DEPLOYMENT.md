# TESTING & VERCEL DEPLOYMENT

## 1. Test layers
### Unit tests
- Game rules, legal moves, terminal states.
- Coordinate mapping.
- Persistence serializers/migrations.
- URL parsers.
- Camera coordinate helpers.

### Component tests
- Buttons, panels, bottom sheets.
- Game selector.
- Music player error states.
- Settings persistence.
- History list and replay controls.

### Integration tests
- Human move -> engine -> state -> 3D renderer.
- AI move -> engine validation -> state.
- Undo/restart -> history.
- Reload -> restore settings and history.
- YouTube unavailable -> game remains usable.

### E2E
- Open app.
- Start each game in local mode.
- Play sample sequence.
- Start vs AI and receive legal response.
- Reload and inspect settings/history.
- Open mobile viewport and use board.
- Toggle environment and fullscreen.

## 2. Required edge cases
- Double tap/click.
- Rapid restart while AI thinking.
- Click board while camera dragging.
- Resize during active game.
- WebGL context lost.
- IndexedDB unavailable/quota exceeded.
- Local file removed.
- YouTube embed blocked.
- Browser autoplay blocked.
- Reduced motion enabled.
- Fullscreen unavailable.

## 3. Vercel
- Push source to GitHub.
- Import repository into Vercel.
- Framework preset: Vite.
- Build command: `npm run build`.
- Output directory: `dist`.
- Install command: `npm install` (hoặc package manager tương ứng).
- Không cần environment variable nếu MVP không dùng API bên ngoài có secret.
- Nếu bổ sung weather proxy/serverless, đặt secrets trong Vercel Environment Variables; không commit `.env`.

## 4. Suggested scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```
Điều chỉnh theo cấu hình TypeScript/Vite thực tế; không copy máy móc nếu template khác.

## 5. Release checklist
- [ ] `npm run typecheck` pass.
- [ ] `npm run lint` pass.
- [ ] `npm run test` pass.
- [ ] `npm run build` pass.
- [ ] E2E critical flows pass.
- [ ] Không có secret trong repo.
- [ ] License assets/dependencies đã kiểm tra.
- [ ] Mobile smoke test.
- [ ] 3D fallback test.
- [ ] Vercel production deploy success.
