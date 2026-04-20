
import type { TimerState } from '../../types/workout';

interface TimerControlsProps {
  timerState: TimerState;
  onStartPause: () => void;
  onReset: () => void;
  onPrevPhase: () => void;
  onNextPhase: () => void;
}

export function TimerControls({
  timerState,
  onStartPause,
  onReset,
  onPrevPhase,
  onNextPhase,
}: TimerControlsProps) {
  const { status } = timerState;
  const isRunning = status === 'running' || status === 'countdown';
  const isFinished = status === 'finished';

  return (
    <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
      <button
        onClick={onPrevPhase}
        aria-label="Poprzednia faza"
        disabled={isFinished}
        className="btn-secondary"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={onStartPause}
        aria-label={isRunning ? 'Pauza' : 'Start'}
        className={`btn-primary min-w-[140px] text-lg font-bold px-8 py-4 ${
          isFinished ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isFinished}
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            Pauza
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start
          </span>
        )}
      </button>

      <button
        onClick={onReset}
        aria-label="Reset"
        className="btn-secondary"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <button
        onClick={onNextPhase}
        aria-label="Następna faza"
        disabled={isFinished}
        className="btn-secondary"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
