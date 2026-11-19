import React, { useState } from 'react';
import { SceneContainer } from '@/three/SceneContainer';
import { TopLeftBrand } from '@/features/header/TopLeftBrand';
import { LeftGameMenu } from '@/features/lobby/LeftGameMenu';
import { BottomCameraToolbar } from '@/features/camera/BottomCameraToolbar';
import { BottomWeatherWidget } from '@/features/environment/BottomWeatherWidget';
import { TopRightMusicWidget } from '@/features/music/TopRightMusicWidget';
import { GameControlOverlay } from '@/features/game-shell/GameControlOverlay';
import { VinylMusicPlayer } from '@/features/music/VinylMusicPlayer';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { HistoryModal } from '@/features/history/HistoryModal';

export const App: React.FC = () => {
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [inGameMode, setInGameMode] = useState(false);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-gradient-to-b from-[#2e8ee8] via-[#7ae39a] to-[#1f6834]">
      {/* ── 3D Scene Layer ── */}
      <SceneContainer />

      {/* ── UI Shell Layer ── */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-5 z-10">

        {/* ── TOP BAR ── */}
        <header className="w-full flex items-start justify-between gap-2">
          {/* Top Left: Logo / Brand */}
          <div className="pointer-events-auto shrink-0">
            <TopLeftBrand onHomeClick={() => setInGameMode(false)} />
          </div>

          {/* Top Center: In-Game Turn & Status Pill (when playing) */}
          {inGameMode && (
            <div className="pointer-events-auto max-w-[50%] sm:max-w-none">
              <GameControlOverlay onBackToLobby={() => setInGameMode(false)} />
            </div>
          )}

          {/* Top Right: Quick Actions + Docked Vinyl Music Widget */}
          <div className="pointer-events-auto shrink-0">
            <TopRightMusicWidget
              onOpenMusicModal={() => setIsMusicOpen(true)}
              onOpenSettingsModal={() => setIsSettingsOpen(true)}
            />
          </div>
        </header>

        {/* ── MIDDLE / LEFT MENU ── */}
        <main className="w-full flex items-center justify-between my-auto">
          {/* Left Side: 4 Games Card + Mode Selector */}
          {!inGameMode && (
            <div className="pointer-events-auto animate-fade-in">
              <LeftGameMenu onStartGame={() => setInGameMode(true)} />
            </div>
          )}
          {/* Center and right are kept totally open for 3D interactions */}
        </main>

        {/* ── BOTTOM BAR (Mobile Optimized & Neat) ── */}
        <footer className="w-full flex items-end justify-between gap-1.5 sm:gap-3">
          {/* Bottom Left: Quick Exit / Change Game button when in game */}
          <div className="pointer-events-auto shrink-0">
            {inGameMode && (
              <button
                onClick={() => setInGameMode(false)}
                type="button"
                className="liquid-glass-pill rounded-full px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-slate-800 shadow-glass border border-white/80 hover:bg-white/60 active:scale-95 transition cursor-pointer"
              >
                <span>← <span className="hidden sm:inline">Chọn trò chơi</span></span>
              </button>
            )}
          </div>

          {/* Bottom Center: Camera Toolbar */}
          <div className="pointer-events-auto">
            <BottomCameraToolbar />
          </div>

          {/* Bottom Right: Weather & Realtime Clock Widget */}
          <div className="pointer-events-auto">
            <BottomWeatherWidget />
          </div>
        </footer>
      </div>

      {/* ── Modals & Popups ── */}
      <VinylMusicPlayer
        isOpen={isMusicOpen}
        onClose={() => setIsMusicOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default App;
