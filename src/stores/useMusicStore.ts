import { create } from 'zustand';
import { MusicTrack } from '@/types/game';

const DEFAULT_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Peaceful Forest Breeze',
    artist: 'Lounge Acoustic',
    sourceType: 'builtin',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'track-2',
    title: 'Gentle Morning Sunlight',
    artist: 'Ambient Piano',
    sourceType: 'builtin',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxed-vlog-night-street-131746.mp3',
  },
  {
    id: 'track-3',
    title: 'Afternoon Rain on Grass',
    artist: 'Nature Chill',
    sourceType: 'builtin',
    sourceUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-amp-strings-10711.mp3',
  },
];

interface MusicStoreState {
  playlist: MusicTrack[];
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number; // 0..1
  muted: boolean;
  isExpanded: boolean;
  youtubeId: string | null;
  audioElement: HTMLAudioElement | null;

  // Actions
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setExpanded: (expanded: boolean) => void;
  addCustomTrack: (track: MusicTrack) => void;
  setYouTubeVideo: (url: string) => boolean;
  clearYouTubeVideo: () => void;
}

export const useMusicStore = create<MusicStoreState>((set, get) => {
  const audio = typeof Audio !== 'undefined' ? new Audio() : null;
  if (audio) {
    audio.loop = true;
    audio.volume = 0.5;
  }

  return {
    playlist: DEFAULT_TRACKS,
    currentTrackIndex: 0,
    isPlaying: false,
    volume: 0.5,
    muted: false,
    isExpanded: false,
    youtubeId: null,
    audioElement: audio,

    togglePlay: () => {
      const { isPlaying, audioElement, playlist, currentTrackIndex, youtubeId } = get();
      if (youtubeId) {
        set({ isPlaying: !isPlaying });
        return;
      }

      if (!audioElement) return;

      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        const track = playlist[currentTrackIndex];
        if (track && audioElement.src !== track.sourceUrl) {
          audioElement.src = track.sourceUrl;
        }
        audioElement.play().then(() => {
          set({ isPlaying: true });
        }).catch((err) => {
          console.warn('Playback blocked until user interaction', err);
          set({ isPlaying: false });
        });
      }
    },

    nextTrack: () => {
      const { playlist, currentTrackIndex, audioElement, isPlaying } = get();
      const nextIdx = (currentTrackIndex + 1) % playlist.length;
      set({ currentTrackIndex: nextIdx, youtubeId: null });
      if (audioElement) {
        audioElement.src = playlist[nextIdx].sourceUrl;
        if (isPlaying) {
          audioElement.play().catch(() => {});
        }
      }
    },

    prevTrack: () => {
      const { playlist, currentTrackIndex, audioElement, isPlaying } = get();
      const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
      set({ currentTrackIndex: prevIdx, youtubeId: null });
      if (audioElement) {
        audioElement.src = playlist[prevIdx].sourceUrl;
        if (isPlaying) {
          audioElement.play().catch(() => {});
        }
      }
    },

    setVolume: (volume: number) => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.volume = volume;
      }
      set({ volume, muted: volume === 0 });
    },

    toggleMute: () => {
      const { muted, volume, audioElement } = get();
      const nextMuted = !muted;
      if (audioElement) {
        audioElement.muted = nextMuted;
      }
      set({ muted: nextMuted });
    },

    setExpanded: (isExpanded: boolean) => {
      set({ isExpanded });
    },

    addCustomTrack: (track: MusicTrack) => {
      set((s) => ({
        playlist: [track, ...s.playlist],
        currentTrackIndex: 0,
        youtubeId: null,
      }));
      const { audioElement, isPlaying } = get();
      if (audioElement) {
        audioElement.src = track.sourceUrl;
        if (isPlaying) audioElement.play().catch(() => {});
      }
    },

    setYouTubeVideo: (url: string): boolean => {
      // Parse youtube url (regular or youtu.be)
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        const videoId = match[2];
        const { audioElement } = get();
        if (audioElement) audioElement.pause();
        set({
          youtubeId: videoId,
          isPlaying: true,
        });
        return true;
      }
      return false;
    },

    clearYouTubeVideo: () => {
      set({ youtubeId: null });
    },
  };
});
