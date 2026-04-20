
import type { TimerState } from '../../types/workout';

interface PhaseIndicatorProps {
  timerState: TimerState;
}

export function PhaseIndicator({ timerState }: PhaseIndicatorProps) {
  const { currentPhase, currentRound, totalRounds, currentStepName, status } = timerState;

  const phaseLabel = (() => {
    if (status === 'finished') return 'KONIEC!';
    if (currentPhase === 'countdown') return 'GOTOWY?';
    if (currentPhase === 'rest') return 'ODPOCZYNEK';
    if (currentStepName) return currentStepName.toUpperCase();
    return 'PRACA';
  })();

  const showRound = currentPhase !== 'countdown' && status !== 'finished' && totalRounds > 1;

  return (
    <div className="flex flex-col items-center gap-1 mt-4">
      <div
        className={`text-2xl md:text-4xl font-bold tracking-widest text-white drop-shadow-lg
          ${currentPhase === 'rest' ? 'text-blue-200' : ''}
          ${currentPhase === 'countdown' ? 'text-purple-200' : ''}
          ${status === 'finished' ? 'text-yellow-300 text-4xl md:text-6xl' : ''}
        `}
      >
        {phaseLabel}
      </div>
      {showRound && (
        <div className="text-lg md:text-2xl font-semibold text-white/80">
          Runda {currentRound} / {totalRounds}
        </div>
      )}
    </div>
  );
}
