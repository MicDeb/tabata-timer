
import type { RoundsConfig as RoundsConfigType } from '../../types/workout';

interface RoundsConfigProps {
  config: RoundsConfigType;
  onChange: (config: RoundsConfigType) => void;
}

export function RoundsConfig({ config, onChange }: RoundsConfigProps) {
  const roundMinutes = Math.floor(config.roundSeconds / 60);
  const roundSecs = config.roundSeconds % 60;
  const restMinutes = Math.floor(config.restSeconds / 60);
  const restSecs = config.restSeconds % 60;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Rundy z przerwami</h3>

      <div>
        <label className="label-text">Czas rundy</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="input-field"
            min={0}
            max={99}
            placeholder="min"
            value={roundMinutes}
            onChange={(e) =>
              onChange({
                ...config,
                roundSeconds: Math.max(0, parseInt(e.target.value) || 0) * 60 + roundSecs,
              })
            }
          />
          <input
            type="number"
            className="input-field"
            min={0}
            max={59}
            placeholder="sek"
            value={roundSecs}
            onChange={(e) =>
              onChange({
                ...config,
                roundSeconds: roundMinutes * 60 + Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
              })
            }
          />
        </div>
      </div>

      <div>
        <label className="label-text">Czas przerwy</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            className="input-field"
            min={0}
            max={99}
            placeholder="min"
            value={restMinutes}
            onChange={(e) =>
              onChange({
                ...config,
                restSeconds: Math.max(0, parseInt(e.target.value) || 0) * 60 + restSecs,
              })
            }
          />
          <input
            type="number"
            className="input-field"
            min={0}
            max={59}
            placeholder="sek"
            value={restSecs}
            onChange={(e) =>
              onChange({
                ...config,
                restSeconds: restMinutes * 60 + Math.max(0, Math.min(59, parseInt(e.target.value) || 0)),
              })
            }
          />
        </div>
      </div>

      <div>
        <label className="label-text">Liczba rund</label>
        <input
          type="number"
          className="input-field"
          min={1}
          max={99}
          value={config.totalRounds}
          onChange={(e) =>
            onChange({ ...config, totalRounds: Math.max(1, parseInt(e.target.value) || 1) })
          }
        />
      </div>

      <p className="text-xs text-gray-500">
        {config.totalRounds} rund × {Math.floor(config.roundSeconds / 60)}:{String(config.roundSeconds % 60).padStart(2, '0')} pracy
      </p>
    </div>
  );
}
