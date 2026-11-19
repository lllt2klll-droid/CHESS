import { create } from 'zustand';
import { AppSettings, CameraPreset, GameMode, GameType, QualityTier, TimePreset, WeatherPreset, WorldMode } from '@/types/game';
import { getStoredSettings, saveStoredSettings } from '@/persistence/settingsStorage';

interface SettingsStore extends AppSettings {
  setSelectedGame: (game: GameType) => void;
  setPreferredMode: (mode: GameMode) => void;
  setAILevel: (level: 'easy' | 'medium' | 'hard') => void;
  setQuality: (quality: QualityTier) => void;
  setWorldMode: (mode: WorldMode) => void;
  setTimePreset: (time: TimePreset) => void;
  setTimeMode: (mode: 'auto' | 'manual') => void;
  setWeatherPreset: (weather: WeatherPreset) => void;
  setWindEnabled: (enabled: boolean) => void;
  setWindIntensity: (intensity: number) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  set2DFallback: (fallback: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const initial = getStoredSettings();

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...initial,

  setSelectedGame: (selectedGame) => {
    set({ selectedGame });
    saveStoredSettings(get());
  },

  setPreferredMode: (preferredMode) => {
    set({ preferredMode });
    saveStoredSettings(get());
  },

  setAILevel: (aiLevel) => {
    set({ aiLevel });
    saveStoredSettings(get());
  },

  setQuality: (quality) => {
    set({ quality });
    saveStoredSettings(get());
  },

  setWorldMode: (worldMode) => {
    set((s) => ({ environment: { ...s.environment, worldMode } }));
    saveStoredSettings(get());
  },

  setTimePreset: (timePreset) => {
    set((s) => ({ environment: { ...s.environment, timePreset } }));
    saveStoredSettings(get());
  },

  setTimeMode: (timeMode) => {
    set((s) => ({ environment: { ...s.environment, timeMode } }));
    saveStoredSettings(get());
  },

  setWeatherPreset: (weatherPreset) => {
    set((s) => ({ environment: { ...s.environment, weatherPreset } }));
    saveStoredSettings(get());
  },

  setWindEnabled: (windEnabled) => {
    set((s) => ({ environment: { ...s.environment, windEnabled } }));
    saveStoredSettings(get());
  },

  setWindIntensity: (windIntensity) => {
    set((s) => ({ environment: { ...s.environment, windIntensity } }));
    saveStoredSettings(get());
  },

  setCameraPreset: (preferredPreset) => {
    set((s) => ({ camera: { ...s.camera, preferredPreset } }));
    saveStoredSettings(get());
  },

  set2DFallback: (board2DFallback) => {
    set((s) => ({ ui: { ...s.ui, board2DFallback } }));
    saveStoredSettings(get());
  },

  setSoundEnabled: (soundEffectsEnabled) => {
    set({ soundEffectsEnabled });
    saveStoredSettings(get());
  },

  resetToDefaults: () => {
    localStorage.removeItem('bgl.settings.v1');
    const fresh = getStoredSettings();
    set(fresh);
  },
}));
