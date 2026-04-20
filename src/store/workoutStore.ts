import { create } from 'zustand';
import type { WorkoutConfig, WorkoutMode, AppSettings } from '../types/workout';

interface WorkoutStore {
  config: WorkoutConfig;
  mode: WorkoutMode;
  settings: AppSettings;
  setConfig: (config: WorkoutConfig) => void;
  setMode: (mode: WorkoutMode) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const defaultConfig: WorkoutConfig = {
  mode: 'tabata',
  workSeconds: 40,
  restSeconds: 20,
  rounds: 8,
};

const defaultSettings: AppSettings = {
  soundEnabled: true,
  voiceEnabled: true,
  volume: 80,
  darkMode: true,
  progressBarStyle: 'linear',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch {
    // ignore
  }
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

const initialConfig = loadFromStorage<WorkoutConfig>('office-timer:last-config', defaultConfig);
const initialMode = loadFromStorage<WorkoutMode>('office-timer:last-mode', 'tabata');
const initialSettings = loadFromStorage<AppSettings>('office-timer:settings', defaultSettings);

// Merge with defaults to fill in any missing keys
const mergedSettings: AppSettings = { ...defaultSettings, ...initialSettings };

export const useWorkoutStore = create<WorkoutStore>((set) => ({
  config: initialConfig,
  mode: initialMode,
  settings: mergedSettings,

  setConfig: (config) => {
    saveToStorage('office-timer:last-config', config);
    set({ config });
  },

  setMode: (mode) => {
    saveToStorage('office-timer:last-mode', mode);
    set({ mode });
  },

  updateSettings: (patch) => {
    set((state) => {
      const updated = { ...state.settings, ...patch };
      saveToStorage('office-timer:settings', updated);
      return { settings: updated };
    });
  },
}));
