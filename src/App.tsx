import React, { useState } from 'react';
import { SceneContainer } from '@/three/SceneContainer';
import { GameSelectorCard } from '@/features/lobby/GameSelectorCard';
import { CameraDropdown } from '@/features/camera/CameraDropdown';
import { WeatherDropdown } from '@/features/environment/WeatherDropdown';
import { GameControlOverlay } from '@/features/game-shell/GameControlOverlay';
import { VinylMusicPlayer } from '@/features/music/VinylMusicPlayer';
import { SettingsModal } from '@/features/settings/SettingsModal';
import { HistoryModal } from '@/features/history/HistoryModal';
import { GlassIconButton } from '@/components/glass/GlassIconButton';
import { useMusicStore } from '@/stores/useMusicStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Home, Music, Volume2, VolumeX, Sun, Settings } from 'lucide-react';

export const App: React.FC = () => {
  const [isMusicOpen, setIsMusicOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const { isPlaying, muted, toggleMute } = useMusicStore();
  const { environment, setTimePreset, setCameraPreset } = useSettingsStore();

  const handleCycleWeather = () => {
    const times: Array<'morning' | 'noon' | 'sunset' | 'night'> = [
      'morning',
      'noon',
      'sunset',
      'night',
    ];
    const nextIdx = (times.indexOf(environment.timePreset) + 1) % times.length;
    setTimePreset(times[nextIdx]);
  };

  const handleHomeClick = () => {
    setCameraPreset('isometric');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-gradient-to-b from-[#76bce8] via-[#a3d9a5] to-[#204e33]">
      {/* 3D Scene Background / 2D Fallback */}
      <SceneContainer />

      {/* Floating UI Shell (Pointer-events-none container so clicks pass through to 3D board) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10">
        {/* TOP BAR */}
        <header className="w-full flex items-start justify-between pointer-events-auto">
          {/* Home Button (Top Left) */}
          <GlassIconButton onClick={handleHomeClick} tooltip="Trang chủ / Đặt lại góc nhìn">
            <Home className="w-5 h-5 text-emerald-950" />
          </GlassIconButton>

          {/* 4 Icon Buttons (Top Right) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GlassIconButton
              onClick={() => setIsMusicOpen(true)}
              tooltip="Nhạc thư giãn"
              active={isPlaying}
              className={isPlaying ? 'ring-2 ring-emerald-500' : ''}
            >
              <Music className={`w-5 h-5 ${isPlaying ? 'text-emerald-700 animate-pulse' : 'text-emerald-950'}`} />
            </GlassIconButton>

            <GlassIconButton onClick={toggleMute} tooltip={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
              {muted ? (
                <VolumeX className="w-5 h-5 text-rose-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-emerald-950" />
              )}
            </GlassIconButton>

            <GlassIconButton onClick={handleCycleWeather} tooltip="Đổi thời gian / ánh sáng">
              <Sun className="w-5 h-5 text-amber-600" />
            </GlassIconButton>

            <GlassIconButton onClick={() => setIsSettingsOpen(true)} tooltip="Cài đặt">
              <Settings className="w-5 h-5 text-emerald-950" />
            </GlassIconButton>
          </div>
        </header>

        {/* CENTER HERO AREA & GAME SELECTOR */}
        <div className="w-full flex flex-col items-center gap-4 my-auto">
          <GameSelectorCard />
          <GameControlOverlay />
        </div>

        {/* BOTTOM BAR */}
        <footer className="w-full flex items-end justify-between pointer-events-auto pb-1">
          {/* Camera Dropdown (Bottom Left) */}
          <CameraDropdown />

          {/* Weather / Wind Dropdown (Bottom Right) */}
          <WeatherDropdown />
        </footer>
      </div>

      {/* Modals & Dialogs */}
      <VinylMusicPlayer isOpen={isMusicOpen} onClose={() => setIsMusicOpen(false)} />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};

export default App;
