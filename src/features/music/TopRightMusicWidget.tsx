import React from 'react';
import { useMusicStore } from '@/stores/useMusicStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  ChevronRight,
  Sun,
  Music,
  Settings,
  Disc3,
} from 'lucide-react';

interface Props {
  onOpenMusicModal: () => void;
  onOpenSettingsModal: () => void;
}

export const TopRightMusicWidget: React.FC<Props> = ({
  onOpenMusicModal,
  onOpenSettingsModal,
}) => {
  const {
    playlist,
    currentTrackIndex,
    isPlaying,
    volume,
    muted,
    youtubeId,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    toggleMute,
  } = useMusicStore();

  const { environment, setTimePreset } = useSettingsStore();

  const currentTrack = playlist[currentTrackIndex] || {
    title: 'Lo-fi Chill',
    artist: 'Relaxing Vibes',
    sourceType: 'builtin',
  };

  const isYouTube = !!youtubeId || currentTrack.sourceType === 'youtube';

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

  return (
    <div className="flex flex-col items-end gap-2.5 pointer-events-auto select-none">
      {/* ── 3 Circular Glass Quick Action Buttons ── */}
      <div className="liquid-glass-pill rounded-full p-1.5 flex items-center gap-1.5 shadow-glass border border-white/80">
        <button
          onClick={handleCycleWeather}
          className="w-8 h-8 rounded-full hover:bg-white/50 active:scale-95 flex items-center justify-center transition cursor-pointer text-amber-500"
          title="Đổi thời gian / ánh sáng"
        >
          <Sun className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-slate-400/30" />

        <button
          onClick={onOpenMusicModal}
          className={`w-8 h-8 rounded-full hover:bg-white/50 active:scale-95 flex items-center justify-center transition cursor-pointer ${
            isPlaying ? 'text-blue-600' : 'text-slate-700'
          }`}
          title="Mở danh sách nhạc / Nhập YouTube"
        >
          <Music className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettingsModal}
          className="w-8 h-8 rounded-full hover:bg-white/50 active:scale-95 flex items-center justify-center transition cursor-pointer text-slate-700"
          title="Cài đặt hệ thống"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* ── Floating Vinyl Music Player Card ── */}
      <div className="liquid-glass-card rounded-[28px] p-3 w-64 sm:w-72 shadow-glass border border-white/80 flex items-center gap-3">
        {/* Spinning Vinyl Record with Tonearm */}
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          {/* Black Vinyl Disc */}
          <div
            className={`w-16 h-16 rounded-full bg-gradient-to-tr from-[#111] via-[#222] to-[#0a0a0a] shadow-md border border-white/20 flex items-center justify-center ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin-paused'
            }`}
          >
            {/* Vinyl grooves */}
            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center">
                {/* Center White Music Label */}
                <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-inner">
                  <Disc3 className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* White Tonearm Needle */}
          <div
            className={`absolute -top-1 -right-1 w-6 h-8 pointer-events-none transition-transform duration-500 origin-top-right ${
              isPlaying ? 'rotate-[18deg]' : 'rotate-[-10deg]'
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm absolute right-0 top-0" />
            <div className="w-0.5 h-6 bg-white/90 shadow-sm absolute right-0.5 top-1 rotate-[15deg]" />
            <div className="w-1.5 h-1.5 bg-slate-800 rounded-sm absolute left-1 bottom-1" />
          </div>
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Title & Source Clickable Header */}
          <button
            onClick={onOpenMusicModal}
            type="button"
            className="flex items-center justify-between text-left group cursor-pointer"
            title="Đổi nhạc"
          >
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition">
                {currentTrack.title || 'Lo-fi Chill'}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span>{isYouTube ? '🔗 YouTube' : '🎵 Built-in'}</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
          </button>

          {/* Control Buttons (Prev, Play/Pause, Next) */}
          <div className="flex items-center justify-center gap-3 my-1">
            <button
              onClick={prevTrack}
              type="button"
              className="p-1 text-slate-700 hover:text-blue-600 active:scale-95 transition cursor-pointer"
              title="Bài trước"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            {/* Glowing Blue Play/Pause Button */}
            <button
              onClick={togglePlay}
              type="button"
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
              title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-white" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              )}
            </button>

            <button
              onClick={nextTrack}
              type="button"
              className="p-1 text-slate-700 hover:text-blue-600 active:scale-95 transition cursor-pointer"
              title="Bài tiếp theo"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={toggleMute}
              type="button"
              className="text-slate-600 hover:text-slate-900"
              title={muted ? 'Bật âm' : 'Tắt âm'}
            >
              {muted ? (
                <VolumeX className="w-3 h-3 text-red-500" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/40 rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
