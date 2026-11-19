import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Youtube, Disc } from 'lucide-react';
import { useMusicStore } from '@/stores/useMusicStore';
import { GlassModal } from '@/components/glass/GlassModal';

interface VinylMusicPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VinylMusicPlayer: React.FC<VinylMusicPlayerProps> = ({ isOpen, onClose }) => {
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
    setYouTubeVideo,
    clearYouTubeVideo,
  } = useMusicStore();

  const [ytInput, setYtInput] = useState('');
  const [ytError, setYtError] = useState('');

  const currentTrack = playlist[currentTrackIndex];

  const handleApplyYouTube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytInput.trim()) return;
    const success = setYouTubeVideo(ytInput.trim());
    if (success) {
      setYtError('');
      setYtInput('');
    } else {
      setYtError('Link YouTube không hợp lệ. Vui lòng thử link dạng https://www.youtube.com/watch?v=...');
    }
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Trình phát nhạc thư giãn">
      <div className="flex flex-col items-center gap-5 py-2">
        {/* Spinning Vinyl Record Visual */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          {/* Vinyl Body */}
          <div
            className={`w-40 h-40 rounded-full bg-stone-900 border-4 border-stone-800 shadow-2xl flex items-center justify-center relative ${
              isPlaying ? 'animate-vinyl-spin' : 'animate-vinyl-spin-paused'
            }`}
          >
            {/* Vinyl Grooves */}
            <div className="w-32 h-32 rounded-full border border-stone-700/60 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border border-stone-700/60 flex items-center justify-center">
                {/* Center Label */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 border-2 border-stone-900 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  <Disc className="w-6 h-6 text-white/90" />
                </div>
              </div>
            </div>
            {/* Center Spindle Hole */}
            <div className="w-3 h-3 rounded-full bg-stone-950 absolute" />
          </div>

          {/* Tonearm */}
          <div
            className={`absolute top-0 right-4 w-12 h-20 origin-top-right transition-transform duration-500 pointer-events-none ${
              isPlaying ? 'rotate-12' : '-rotate-12'
            }`}
          >
            <div className="w-1 h-14 bg-amber-200/90 rounded shadow ml-auto mr-2" />
            <div className="w-3 h-4 bg-amber-400 rounded-sm ml-auto mr-1 shadow" />
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center px-4">
          <div className="text-base font-bold text-slate-800">
            {youtubeId ? 'Đang phát từ YouTube Embed' : currentTrack?.title || 'Không gian yên tĩnh'}
          </div>
          <div className="text-xs text-emerald-800 font-medium">
            {youtubeId ? 'YouTube Player' : currentTrack?.artist || 'Board Game Lounge'}
          </div>
        </div>

        {/* YouTube Embed Player (if active) */}
        {youtubeId && (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/60">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&enablejsapi=1`}
                title="YouTube Audio Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <button
              onClick={clearYouTubeVideo}
              className="text-xs text-red-600 hover:underline font-semibold"
            >
              Dừng phát YouTube và quay lại nhạc tích hợp
            </button>
          </div>
        )}

        {/* Playback Controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevTrack}
            disabled={!!youtubeId}
            className="p-2.5 rounded-full hover:bg-white/60 text-slate-700 transition active:scale-95 disabled:opacity-40"
            title="Bài trước"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg hover:shadow-emerald-900/30 active:scale-95 transition"
            title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            disabled={!!youtubeId}
            className="p-2.5 rounded-full hover:bg-white/60 text-slate-700 transition active:scale-95 disabled:opacity-40"
            title="Bài tiếp theo"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="w-full max-w-xs flex items-center gap-3 px-2">
          <button onClick={toggleMute} className="text-slate-600 hover:text-emerald-900">
            {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Custom YouTube URL Input */}
        <div className="w-full border-t border-white/40 pt-4 mt-1">
          <form onSubmit={handleApplyYouTube} className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Youtube className="w-4 h-4 text-red-600" />
              <span>Phát nhạc từ link YouTube:</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dán link YouTube (ví dụ: lofi, piano chill)..."
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-white/60 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button
                type="submit"
                className="px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition shadow-sm"
              >
                Phát
              </button>
            </div>
            {ytError && <div className="text-[11px] text-red-600 mt-1">{ytError}</div>}
          </form>
        </div>
      </div>
    </GlassModal>
  );
};
