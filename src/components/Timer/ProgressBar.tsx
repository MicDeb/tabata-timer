

interface ProgressBarProps {
  progress: number; // 0-1
  style: 'linear' | 'circular';
  isLastFive?: boolean;
}

export function ProgressBar({ progress, style, isLastFive }: ProgressBarProps) {
  if (style === 'circular') return null; // Handled in TimerDisplay

  const pct = Math.min(100, Math.max(0, progress * 100));
  const barColor = isLastFive ? 'bg-red-400' : 'bg-white';

  return (
    <div className="w-full h-2 md:h-3 bg-white/20 rounded-full overflow-hidden">
      <div
        className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-linear`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
