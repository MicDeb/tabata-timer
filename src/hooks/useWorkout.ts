import { useState, useRef, useCallback, useEffect } from 'react';
import type { WorkoutConfig, TimerState, SequenceStep } from '../types/workout';

interface UseWorkoutCallbacks {
  onCountdownBeep: (num: number) => void;
  onStart: () => void;
  onWorkEnd: () => void;
  onRestEnd: () => void;
  onTick: () => void;
  onFinish: () => void;
  onPhaseChange: (phase: 'work' | 'rest', stepName?: string) => void;
}

interface UseWorkoutReturn {
  timerState: TimerState;
  startWorkout: () => void;
  pauseWorkout: () => void;
  resetWorkout: () => void;
  nextPhase: () => void;
  prevPhase: () => void;
}

interface Phase {
  type: 'work' | 'rest' | 'countdown';
  seconds: number;
  round: number;
  totalRounds: number;
  stepName?: string;
  nextStepName?: string;
}

function buildPhases(config: WorkoutConfig): Phase[] {
  const phases: Phase[] = [];

  if (config.mode === 'countdown') {
    phases.push({
      type: 'work',
      seconds: config.totalSeconds,
      round: 1,
      totalRounds: 1,
    });
  } else if (config.mode === 'tabata') {
    for (let r = 1; r <= config.rounds; r++) {
      phases.push({
        type: 'work',
        seconds: config.workSeconds,
        round: r,
        totalRounds: config.rounds,
      });
      if (r < config.rounds) {
        phases.push({
          type: 'rest',
          seconds: config.restSeconds,
          round: r,
          totalRounds: config.rounds,
        });
      }
    }
  } else if (config.mode === 'rounds') {
    for (let r = 1; r <= config.totalRounds; r++) {
      phases.push({
        type: 'work',
        seconds: config.roundSeconds,
        round: r,
        totalRounds: config.totalRounds,
      });
      if (r < config.totalRounds) {
        phases.push({
          type: 'rest',
          seconds: config.restSeconds,
          round: r,
          totalRounds: config.totalRounds,
        });
      }
    }
  } else if (config.mode === 'sequence') {
    const allSteps: SequenceStep[] = [];
    for (let repeat = 0; repeat < Math.max(1, config.repeatTimes); repeat++) {
      allSteps.push(...config.steps);
    }
    allSteps.forEach((step, index) => {
      const nextStep = allSteps[index + 1];
      phases.push({
        type: 'work',
        seconds: step.durationSeconds,
        round: index + 1,
        totalRounds: allSteps.length,
        stepName: step.name,
        nextStepName: nextStep?.name,
      });
    });
  }

  return phases;
}

const COUNTDOWN_SECONDS = 3;

export function useWorkout(config: WorkoutConfig, callbacks: UseWorkoutCallbacks): UseWorkoutReturn {
  const phases = buildPhases(config);

  const initialState: TimerState = {
    status: 'idle',
    secondsLeft: phases[0]?.seconds ?? 0,
    currentPhase: 'work',
    currentRound: 1,
    totalRounds: phases[0]?.totalRounds ?? 1,
    currentStepName: phases[0]?.stepName,
    nextStepName: phases[0]?.nextStepName,
    totalSeconds: phases[0]?.seconds ?? 0,
  };

  const [timerState, setTimerState] = useState<TimerState>(initialState);

  const statusRef = useRef<TimerState['status']>('idle');
  const phaseIndexRef = useRef(0);
  const secondsLeftRef = useRef(phases[0]?.seconds ?? 0);
  const totalSecondsRef = useRef(phases[0]?.seconds ?? 0);
  const isCountdownRef = useRef(false);
  const countdownSecondsRef = useRef(COUNTDOWN_SECONDS);
  const startTimeRef = useRef(0);
  const startSecondsRef = useRef(0);
  const rafRef = useRef(0);
  const lastNotifiedSecondRef = useRef(-1);
  const callbacksRef = useRef(callbacks);

  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  const goToPhase = useCallback(
    (index: number, startRunning: boolean) => {
      if (index >= phases.length) {
        // Finished
        stopLoop();
        statusRef.current = 'finished';
        setTimerState((prev) => ({
          ...prev,
          status: 'finished',
          secondsLeft: 0,
          currentPhase: 'finished',
        }));
        callbacksRef.current.onFinish();
        return;
      }

      const phase = phases[index];
      phaseIndexRef.current = index;
      secondsLeftRef.current = phase.seconds;
      totalSecondsRef.current = phase.seconds;
      isCountdownRef.current = false;

      const newState: Partial<TimerState> = {
        secondsLeft: phase.seconds,
        totalSeconds: phase.seconds,
        currentPhase: phase.type,
        currentRound: phase.round,
        totalRounds: phase.totalRounds,
        currentStepName: phase.stepName,
        nextStepName: phase.nextStepName,
      };

      if (startRunning) {
        newState.status = 'running';
        statusRef.current = 'running';
        startTimeRef.current = performance.now();
        startSecondsRef.current = phase.seconds;
        lastNotifiedSecondRef.current = phase.seconds;
      }

      setTimerState((prev) => ({ ...prev, ...newState }));
    },
    [phases, stopLoop]
  );

  const tick = useCallback(() => {
    if (statusRef.current !== 'running' && statusRef.current !== 'countdown') {
      return;
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, startSecondsRef.current - elapsed);
    const remainingInt = Math.ceil(remaining);

    if (remainingInt !== lastNotifiedSecondRef.current) {
      lastNotifiedSecondRef.current = remainingInt;
      secondsLeftRef.current = remainingInt;

      if (isCountdownRef.current) {
        // Pre-start countdown
        if (remainingInt > 0) {
          setTimerState((prev) => ({ ...prev, secondsLeft: remainingInt }));
          callbacksRef.current.onCountdownBeep(remainingInt);
        }
      } else {
        // Main timer
        setTimerState((prev) => ({ ...prev, secondsLeft: remainingInt }));

        if (remainingInt <= 5 && remainingInt > 0) {
          callbacksRef.current.onTick();
        }
      }
    }

    if (remaining <= 0) {
      if (isCountdownRef.current) {
        // Countdown finished, start actual workout
        isCountdownRef.current = false;
        statusRef.current = 'running';
        setTimerState((prev) => ({ ...prev, status: 'running' }));
        callbacksRef.current.onStart();

        const phase = phases[phaseIndexRef.current];
        startTimeRef.current = performance.now();
        startSecondsRef.current = phase.seconds;
        secondsLeftRef.current = phase.seconds;
        totalSecondsRef.current = phase.seconds;
        lastNotifiedSecondRef.current = phase.seconds;

        setTimerState((prev) => ({
          ...prev,
          secondsLeft: phase.seconds,
          totalSeconds: phase.seconds,
          currentPhase: phase.type,
        }));

        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Phase ended
      const currentPhaseData = phases[phaseIndexRef.current];
      const nextIndex = phaseIndexRef.current + 1;

      if (currentPhaseData.type === 'work') {
        callbacksRef.current.onWorkEnd();
      } else if (currentPhaseData.type === 'rest') {
        callbacksRef.current.onRestEnd();
      }

      if (nextIndex >= phases.length) {
        // All done
        stopLoop();
        statusRef.current = 'finished';
        setTimerState((prev) => ({
          ...prev,
          status: 'finished',
          secondsLeft: 0,
          currentPhase: 'finished',
        }));
        callbacksRef.current.onFinish();
        return;
      }

      // Move to next phase
      const nextPhaseData = phases[nextIndex];
      phaseIndexRef.current = nextIndex;
      secondsLeftRef.current = nextPhaseData.seconds;
      totalSecondsRef.current = nextPhaseData.seconds;
      startTimeRef.current = performance.now();
      startSecondsRef.current = nextPhaseData.seconds;
      lastNotifiedSecondRef.current = nextPhaseData.seconds;

      setTimerState((prev) => ({
        ...prev,
        secondsLeft: nextPhaseData.seconds,
        totalSeconds: nextPhaseData.seconds,
        currentPhase: nextPhaseData.type,
        currentRound: nextPhaseData.round,
        totalRounds: nextPhaseData.totalRounds,
        currentStepName: nextPhaseData.stepName,
        nextStepName: nextPhaseData.nextStepName,
      }));

      callbacksRef.current.onPhaseChange(nextPhaseData.type as 'work' | 'rest', nextPhaseData.stepName);

      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [phases, stopLoop]);

  const startWorkout = useCallback(() => {
    if (statusRef.current === 'running') return;

    if (statusRef.current === 'paused') {
      // Resume
      statusRef.current = 'running';
      setTimerState((prev) => ({ ...prev, status: 'running' }));
      startTimeRef.current = performance.now();
      startSecondsRef.current = secondsLeftRef.current;
      lastNotifiedSecondRef.current = secondsLeftRef.current;
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    // Fresh start with countdown
    phaseIndexRef.current = 0;
    isCountdownRef.current = true;
    countdownSecondsRef.current = COUNTDOWN_SECONDS;
    startTimeRef.current = performance.now();
    startSecondsRef.current = COUNTDOWN_SECONDS;
    secondsLeftRef.current = COUNTDOWN_SECONDS;
    lastNotifiedSecondRef.current = COUNTDOWN_SECONDS;

    const firstPhase = phases[0];
    statusRef.current = 'countdown';

    setTimerState({
      status: 'countdown',
      secondsLeft: COUNTDOWN_SECONDS,
      currentPhase: 'countdown',
      currentRound: firstPhase?.round ?? 1,
      totalRounds: firstPhase?.totalRounds ?? 1,
      currentStepName: firstPhase?.stepName,
      nextStepName: firstPhase?.nextStepName,
      totalSeconds: COUNTDOWN_SECONDS,
    });

    callbacksRef.current.onCountdownBeep(COUNTDOWN_SECONDS);
    rafRef.current = requestAnimationFrame(tick);
  }, [phases, tick]);

  const pauseWorkout = useCallback(() => {
    if (statusRef.current !== 'running' && statusRef.current !== 'countdown') return;
    stopLoop();
    statusRef.current = 'paused';
    setTimerState((prev) => ({ ...prev, status: 'paused' }));
  }, [stopLoop]);

  const resetWorkout = useCallback(() => {
    stopLoop();
    phaseIndexRef.current = 0;
    isCountdownRef.current = false;
    statusRef.current = 'idle';

    const firstPhase = phases[0];
    secondsLeftRef.current = firstPhase?.seconds ?? 0;
    totalSecondsRef.current = firstPhase?.seconds ?? 0;

    setTimerState({
      status: 'idle',
      secondsLeft: firstPhase?.seconds ?? 0,
      currentPhase: firstPhase?.type ?? 'work',
      currentRound: firstPhase?.round ?? 1,
      totalRounds: firstPhase?.totalRounds ?? 1,
      currentStepName: firstPhase?.stepName,
      nextStepName: firstPhase?.nextStepName,
      totalSeconds: firstPhase?.seconds ?? 0,
    });
  }, [phases, stopLoop]);

  const nextPhase = useCallback(() => {
    const nextIndex = phaseIndexRef.current + 1;
    const wasRunning =
      statusRef.current === 'running' || statusRef.current === 'countdown';
    stopLoop();
    if (wasRunning) {
      goToPhase(nextIndex, true);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      goToPhase(nextIndex, false);
    }
  }, [goToPhase, stopLoop, tick]);

  const prevPhase = useCallback(() => {
    const prevIndex = Math.max(0, phaseIndexRef.current - 1);
    const wasRunning =
      statusRef.current === 'running' || statusRef.current === 'countdown';
    stopLoop();
    if (wasRunning) {
      goToPhase(prevIndex, true);
      rafRef.current = requestAnimationFrame(tick);
    } else {
      goToPhase(prevIndex, false);
    }
  }, [goToPhase, stopLoop, tick]);

  // Reset when config changes
  useEffect(() => {
    stopLoop();
    phaseIndexRef.current = 0;
    isCountdownRef.current = false;
    statusRef.current = 'idle';

    const firstPhase = phases[0];
    secondsLeftRef.current = firstPhase?.seconds ?? 0;
    totalSecondsRef.current = firstPhase?.seconds ?? 0;
    lastNotifiedSecondRef.current = firstPhase?.seconds ?? 0;

    setTimerState({
      status: 'idle',
      secondsLeft: firstPhase?.seconds ?? 0,
      currentPhase: firstPhase?.type ?? 'work',
      currentRound: firstPhase?.round ?? 1,
      totalRounds: firstPhase?.totalRounds ?? 1,
      currentStepName: firstPhase?.stepName,
      nextStepName: firstPhase?.nextStepName,
      totalSeconds: firstPhase?.seconds ?? 0,
    });

    return () => {
      stopLoop();
    };
    // We intentionally use a JSON-stringified config as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);

  return {
    timerState,
    startWorkout,
    pauseWorkout,
    resetWorkout,
    nextPhase,
    prevPhase,
  };
}
