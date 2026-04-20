import { useState } from 'react';
import type { Preset, WorkoutConfig } from '../../types/workout';
import { usePresets } from '../../hooks/usePresets';

interface PresetManagerProps {
  currentConfig: WorkoutConfig;
  onLoad: (config: WorkoutConfig) => void;
}

function presetSummary(config: WorkoutConfig): string {
  if (config.mode === 'tabata') {
    return `Tabata • ${config.workSeconds}s/${config.restSeconds}s • ${config.rounds} rund`;
  }
  if (config.mode === 'countdown') {
    const m = Math.floor(config.totalSeconds / 60);
    const s = config.totalSeconds % 60;
    return `Odliczanie • ${m}:${String(s).padStart(2, '0')}`;
  }
  if (config.mode === 'rounds') {
    const m = Math.floor(config.roundSeconds / 60);
    const s = config.roundSeconds % 60;
    return `Rundy • ${config.totalRounds}×${m}:${String(s).padStart(2, '0')}`;
  }
  if (config.mode === 'sequence') {
    return `Sekwencja • ${config.steps.length} kroków ×${config.repeatTimes}`;
  }
  return '';
}

function modeLabel(mode: WorkoutConfig['mode']): string {
  const labels: Record<string, string> = {
    countdown: 'Odliczanie',
    tabata: 'Tabata',
    rounds: 'Rundy',
    sequence: 'Sekwencja',
  };
  return labels[mode] ?? mode;
}

export function PresetManager({ currentConfig, onLoad }: PresetManagerProps) {
  const { allPresets, savePreset, deletePreset, duplicatePreset } = usePresets();
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = () => {
    if (!saveName.trim()) return;
    savePreset(saveName.trim(), currentConfig);
    setSaveName('');
    setShowSaveInput(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Szablony</h3>
        <button
          onClick={() => setShowSaveInput(!showSaveInput)}
          className="text-xs btn-secondary py-1 px-3"
        >
          Zapisz bieżący
        </button>
      </div>

      {showSaveInput && (
        <div className="flex gap-2">
          <input
            type="text"
            className="input-field flex-1 text-sm"
            placeholder="Nazwa szablonu..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button onClick={handleSave} className="btn-primary text-sm py-1 px-3">
            Zapisz
          </button>
        </div>
      )}

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {allPresets.map((preset: Preset) => (
          <div
            key={preset.id}
            className="bg-gray-800 rounded-lg p-3 flex flex-col gap-1"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-white truncate">{preset.name}</span>
                  {preset.isDefault && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">
                      domyślny
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  <span className="text-blue-400 mr-1">{modeLabel(preset.config.mode)}</span>
                  {presetSummary(preset.config)}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onLoad(preset.config)}
                  className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Wczytaj
                </button>
                <button
                  onClick={() => duplicatePreset(preset.id)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                  title="Duplikuj"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                {!preset.isDefault && (
                  deleteConfirm === preset.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => { deletePreset(preset.id); setDeleteConfirm(null); }}
                        className="text-xs bg-red-700 hover:bg-red-600 text-white px-2 py-1 rounded"
                      >
                        Tak
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                      >
                        Nie
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(preset.id)}
                      className="text-xs bg-gray-700 hover:bg-red-800 text-gray-400 hover:text-white px-2 py-1 rounded"
                      title="Usuń"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
