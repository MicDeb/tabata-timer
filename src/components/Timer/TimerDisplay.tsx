
import type { TimerState } from '../../types/workout';
import { formatTime } from '../../utils/timeUtils';
import { ProgressBar } from './ProgressBar';
import { PhaseIndicator } from './PhaseIndicator';
import { NextExercise } from './NextExercise';

interface TimerDisplayProps {
  timerState: TimerState;
  progressBarStyle: 'linear' | 'circular';
}

export function TimerDisplay({ timerState, progressBarStyle }: TimerDisplayProps) {
  const { status, secondsLeft, currentPhase, totalSeconds } = timerState;

  const isLastFive = secondsLeft <= 5 && secondsLeft > 0 && status === 'running';
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const phaseClass = (() => {
    if (currentPhase === 'countdown') return 'from-indigo-900 to-purple-900';
    if (currentPhase === 'finished') return 'from-gray-900 to-gray-800';
    if (currentPhase === 'rest') return 'from-blue-900 to-teal-900';
    if (isLastFive) return 'from-red-900 to-orange-900';
    return 'from-orange-900 to-red-900';
  })();

  return (
    <div
      className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${phaseClass} rounded-2xl p-6 md:p-10 transition-all duration-500 min-h-[50vh] md:min-h-[60vh]`}
    >
      {progressBarStyle === 'circular' ? (
        <div className="relative flex items-center justify-center mb-4">
          <CircularProgress progress={progress} isLastFive={isLastFive} size={280} />
          <div className="absolute flex flex-col items-center">
            <ClockFace
              secondsLeft={secondsLeft}
              isLastFive={isLastFive}
              status={status}
            />
          </div>
        </div>
      ) : (
        <>
          <ClockFace
            secondsLeft={secondsLeft}
            isLastFive={isLastFive}
            status={status}
          />
          <div className="w-full max-w-md mt-4">
            <ProgressBar progress={progress} style="linear" isLastFive={isLastFive} />
          </div>
        </>
      )}

      <PhaseIndicator timerState={timerState} />
      <NextExercise timerState={timerState} />
    </div>
  );
}

function ClockFace({
  secondsLeft,
  isLastFive,
  status,
}: {
  secondsLeft: number;
  isLastFive: boolean;
  status: string;
}) {
  const displayTime = status === 'countdown' ? String(secondsLeft) : formatTime(secondsLeft);

  return (
    <div
      className={`font-mono text-white select-none tracking-tight leading-none
        ${status === 'countdown' ? 'text-[25vw] md:text-[20vw] lg:text-[15vw]' : 'text-[22vw] md:text-[18vw] lg:text-[12vw]'}
        ${isLastFive ? 'animate-pulse text-red-300' : ''}
      `}
      aria-live="polite"
      aria-label={`Czas: ${displayTime}`}
    >
      {displayTime}
    </div>
  );
}

function CircularProgress({
  progress,
  isLastFive,
  size,
}: {
  progress: number;
  isLastFive: boolean;
  size: number;
}) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={12}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={isLastFive ? '#f87171' : '#ffffff'}
        strokeWidth={12}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}
