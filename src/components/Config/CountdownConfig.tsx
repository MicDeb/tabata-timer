
import type { CountdownConfig as CountdownConfigType } from '../../types/workout';
import { formatTime } from '../../utils/timeUtils';

interface CountdownConfigProps {
  config: CountdownConfigType;
  onChange: (config: CountdownConfigType) => void;
}

export function CountdownConfig({ config, onChange }: CountdownConfigProps) {
  const minutes = Math.floor(config.totalSeconds / 60);
  const seconds = config.totalSeconds % 60;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Odliczanie w dół</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label-text">Minuty</label>
          <input
            type="number"
            className="input-field"
            min={0}
            max={99}
            value={minutes}
            onChange={(e) => {
              const m = Math.max(0, parseInt(e.target.value) || 0);
              onChange({ ...config, totalSeconds: m * 60 + seconds });
            }}
          />
        </div>
        <div>
          <label className="label-text">Sekundy</label>
          <input
            type="number"
            className="input-field"
            min={0}
            max={59}
            value={seconds}
            onChange={(e) => {
              const s = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
              onChange({ ...config, totalSeconds: minutes * 60 + s });
            }}
          />
        </div>
      </div>
      <p className="text-xs text-gray-500">Łączny czas: {formatTime(config.totalSeconds)}</p>
    </div>
  );
}
