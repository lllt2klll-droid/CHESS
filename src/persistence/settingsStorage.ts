import { AppSettings } from '@/types/game';

const SETTINGS_KEY = 'bgl.settings.v1';

export const defaultSettings: AppSettings = {
  schemaVersion: 1,
  selectedGame: 'chess',
  preferredMode: 'local',
  aiLevel: 'medium',
  quality: 'auto',
  reducedMotion: false,
  soundEffectsEnabled: true,
  environment: {
    worldMode: 'grass-sky',
    timeMode: 'auto',
    timePreset: 'noon',
    weatherPreset: 'clear',
    windEnabled: true,
    windIntensity: 0.5,
  },
  camera: {
    preferredPreset: 'isometric',
    autoRotate: false,
    sensitivity: 1.0,
  },
  music: {
    volume: 0.6,
    muted: false,
    lastSourceType: 'builtin',
  },
  ui: {
    compactMode: true,
    collapsedPanels: [],
    board2DFallback: false,
  },
};

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed, environment: { ...defaultSettings.environment, ...parsed.environment } };
  } catch {
    return defaultSettings;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // LocalStorage write error handling
  }
};
