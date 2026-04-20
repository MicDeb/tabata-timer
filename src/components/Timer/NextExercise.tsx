
import type { TimerState } from '../../types/workout';

interface NextExerciseProps {
  timerState: TimerState;
}

export function NextExercise({ timerState }: NextExerciseProps) {
  const { secondsLeft, nextStepName, status } = timerState;

  const shouldShow =
    nextStepName &&
    secondsLeft <= 10 &&
    secondsLeft > 0 &&
    status === 'running';

  if (!shouldShow) return null;

  return (
    <div className="mt-3 flex items-center gap-2 text-white/60 text-sm md:text-base animate-fade-in">
      <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
      <span>Za chwilę: <span className="font-semibold text-white/80">{nextStepName}</span></span>
    </div>
  );
}
