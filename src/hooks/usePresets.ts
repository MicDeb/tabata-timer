import { useState, useCallback } from 'react';
import type { Preset, WorkoutConfig } from '../types/workout';

const STORAGE_KEY = 'office-timer:presets';

const DEFAULT_PRESETS: Preset[] = [
  {
    id: 'default-tabata',
    name: 'Tabata klasyczna',
    config: { mode: 'tabata', workSeconds: 40, restSeconds: 20, rounds: 8 },
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'default-amrap',
    name: 'AMRAP 20min',
    config: { mode: 'countdown', totalSeconds: 1200 },
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'default-warmup',
    name: 'Rozgrzewka 5min',
    config: { mode: 'countdown', totalSeconds: 300 },
    createdAt: 0,
    isDefault: true,
  },
  {
    id: 'default-strength',
    name: 'Trening siłowy',
    config: { mode: 'rounds', roundSeconds: 180, restSeconds: 90, totalRounds: 5 },
    createdAt: 0,
    isDefault: true,
  },
];

function loadPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Preset[];
  } catch {
    // ignore
  }
  return [];
}

function savePresets(presets: Preset[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(loadPresets);

  const allPresets = [...DEFAULT_PRESETS, ...presets];

  const savePreset = useCallback((name: string, config: WorkoutConfig) => {
    const preset: Preset = {
      id: `preset-${Date.now()}`,
      name,
      config,
      createdAt: Date.now(),
      isDefault: false,
    };
    setPresets((prev) => {
      const updated = [...prev, preset];
      savePresets(updated);
      return updated;
    });
    return preset;
  }, []);

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePresets(updated);
      return updated;
    });
  }, []);

  const duplicatePreset = useCallback(
    (id: string) => {
      const source = allPresets.find((p) => p.id === id);
      if (!source) return;
      const copy: Preset = {
        id: `preset-${Date.now()}`,
        name: `${source.name} (kopia)`,
        config: { ...source.config },
        createdAt: Date.now(),
        isDefault: false,
      };
      setPresets((prev) => {
        const updated = [...prev, copy];
        savePresets(updated);
        return updated;
      });
    },
    [allPresets]
  );

  return { presets, allPresets, savePreset, deletePreset, duplicatePreset };
}
