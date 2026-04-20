
import type { TabataConfig as TabataConfigType } from '../../types/workout';

interface TabataConfigProps {
  config: TabataConfigType;
  onChange: (config: TabataConfigType) => void;
}

export function TabataConfig({ config, onChange }: TabataConfigProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Tabata / HIIT</h3>

      <div>
        <label className="label-text">Czas pracy (sekundy)</label>
        <input
          type="number"
          className="input-field"
          min={5}
          max={600}
          value={config.workSeconds}
          onChange={(e) =>
            onChange({ ...config, workSeconds: Math.max(5, parseInt(e.target.value) || 5) })
          }
        />
      </div>

      <div>
        <label className="label-text">Czas odpoczynku (sekundy)</label>
        <input
          type="number"
          className="input-field"
          min={0}
          max={600}
          value={config.restSeconds}
          onChange={(e) =>
            onChange({ ...config, restSeconds: Math.max(0, parseInt(e.target.value) || 0) })
          }
        />
      </div>

      <div>
        <label className="label-text">Liczba rund</label>
        <input
          type="number"
          className="input-field"
          min={1}
          max={100}
          value={config.rounds}
          onChange={(e) =>
            onChange({ ...config, rounds: Math.max(1, parseInt(e.target.value) || 1) })
          }
        />
      </div>

      <p className="text-xs text-gray-500">
        {config.rounds}×{config.workSeconds}s praca / {config.restSeconds}s odpoczynek &bull;{' '}
        Łącznie: ~{Math.round((config.rounds * (config.workSeconds + config.restSeconds)) / 60)}min
      </p>
    </div>
  );
}
