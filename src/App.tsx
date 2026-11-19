import React, { useState } from 'react';
import { SceneContainer }      from '@/three/SceneContainer';
import { GameSelectorCard }    from '@/features/lobby/GameSelectorCard';
import { CameraDropdown }      from '@/features/camera/CameraDropdown';
import { WeatherDropdown }     from '@/features/environment/WeatherDropdown';
import { GameControlOverlay }  from '@/features/game-shell/GameControlOverlay';
import { VinylMusicPlayer }    from '@/features/music/VinylMusicPlayer';
import { SettingsModal }       from '@/features/settings/SettingsModal';
import { HistoryModal }        from '@/features/history/HistoryModal';
import { GlassIconButton }     from '@/components/glass/GlassIconButton';
import { useMusicStore }       from '@/stores/useMusicStore';
import { useSettingsStore }    from '@/stores/useSettingsStore';
import { useGameStore }        from '@/stores/useGameStore';
import { Home, Music, Volume2, VolumeX, Sun, Settings, Moon, CloudSun, Sunset } from 'lucide-react';

// Weather icon cycle: morning → noon → sunset → night → morning
const TIME_CYCLE = ['morning', 'noon', 'sunset', 'night'] as const;
const TIME_ICONS: Record<string, React.ReactNode> = {
  morning: <CloudSun className="w-5 h-5 text-amber-500" />,
  noon:    <Sun      className="w-5 h-5 text-amber-500" />,
  sunset:  <Sunset   className="w-5 h-5 text-orange-500" />,
  night:   <Moon     className="w-5 h-5 text-indigo-400" />,
};

export const App: React.FC = () => {
  const [isMusicOpen,    setIsMusicOpen]    = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen,  setIsHistoryOpen]  = useState(false);

  const { isPlaying, muted, toggleMute } = useMusicStore();
  const { environment, setTimePreset, setCameraPreset } = useSettingsStore();
  const { gameState, game } = useGameStore();

  // "In game" = a game has started (at least one move made or status isn't initial lobby)
  // We detect this by checking if historyStates > 0 OR if the current game is active
  const { historyStates } = useGameStore();
  const isInGame = historyStates.length > 0 ||
    (gameState.status !== 'playing' && gameState.status !== 'check'
      ? false                        // terminal states: still show compact
      : false);
  // Simple rule: if game is selected and board has been interacted with → compact
  // We'll track this with a "lobby" flag stored in component state
  const [inGameMode, setInGameMode] = useState(false);

  // When a game card is clicked and game starts, switch to game mode
  // GameSelectorCard will call onStartGame prop
  const handleStartGame = () => setInGameMode(true);
  const handleHome      = () => {
    setInGameMode(false);
    setCameraPreset('isometric');
  };

  const handleCycleWeather = () => {
    const idx     = TIME_CYCLE.indexOf(environment.timePreset as any);
    const next    = TIME_CYCLE[(idx + 1) % TIME_CYCLE.length];
    setTimePreset(next);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-gradient-to-b from-[#2e8ee8] via-[#7ae39a] to-[#1f6834]">
      {/* 3D Scene */}
      <SceneContainer />

      {/* UI Shell — pointer-events-none so clicks pass through to canvas */}
      <div className="absolute inset-0 pointer-events-none flex flex-col z-10">

        {/* ── TOP BAR ── */}
        <header className="w-full flex items-center justify-between p-3 sm:p-4 pointer-events-auto">
          {/* Home / Back button */}
          <GlassIconButton
            onClick={handleHome}
            tooltip={inGameMode ? 'Quay về trang chủ' : 'Đặt lại góc nhìn'}
          >
            <Home className="w-5 h-5 text-emerald-950" />
          </GlassIconButton>

          {/* Right icon cluster */}
          <div className="flex items-center gap-2">
            <GlassIconButton
              onClick={() => setIsMusicOpen(true)}
              tooltip="Nhạc thư giãn"
              active={isPlaying}
              className={isPlaying ? 'ring-2 ring-emerald-400' : ''}
            >
              <Music className={`w-5 h-5 ${isPlaying ? 'text-emerald-600 animate-pulse' : 'text-emerald-950'}`} />
            </GlassIconButton>

            <GlassIconButton onClick={toggleMute} tooltip={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}>
              {muted
                ? <VolumeX className="w-5 h-5 text-rose-500" />
                : <Volume2 className="w-5 h-5 text-emerald-950" />
              }
            </GlassIconButton>

            {/* Weather cycle button — shows current weather icon */}
            <GlassIconButton onClick={handleCycleWeather} tooltip="Đổi thời gian / ánh sáng">
              {TIME_ICONS[environment.timePreset] ?? <Sun className="w-5 h-5 text-amber-500" />}
            </GlassIconButton>

            <GlassIconButton onClick={() => setIsSettingsOpen(true)} tooltip="Cài đặt">
              <Settings className="w-5 h-5 text-emerald-950" />
            </GlassIconButton>
          </div>
        </header>

        {/* ── CENTER AREA ── */}
        <div className="flex-1 flex flex-col items-center justify-start pt-2 sm:pt-3 pointer-events-none">

          {/* LOBBY MODE: hero card + 4 game selectors */}
          {!inGameMode && (
            <div className="pointer-events-auto">
              <GameSelectorCard onStartGame={handleStartGame} />
            </div>
          )}

          {/* GAME MODE: minimal floating controls — no hero, no selector blocking board */}
          {inGameMode && (
            <div className="pointer-events-auto w-full flex flex-col items-center gap-2 px-3">
              <GameControlOverlay onBackToLobby={handleHome} />
            </div>
          )}
        </div>

        {/* ── BOTTOM BAR ── */}
        <footer className="w-full flex items-end justify-between p-3 sm:p-4 pointer-events-auto">
          <CameraDropdown />
          <WeatherDropdown />
        </footer>
      </div>

      {/* Modals */}
      <VinylMusicPlayer    isOpen={isMusicOpen}    onClose={() => setIsMusicOpen(false)} />
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
