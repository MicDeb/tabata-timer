import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseTimerReturn {
  secondsLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (seconds: number) => void;
  setSeconds: (s: number) => void;
  onTick: (cb: (secondsLeft: number) => void) => void;
  onFinish: (cb: () => void) => void;
}

export function useTimer(initialSeconds: number): UseTimerReturn {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  const secondsLeftRef = useRef(initialSeconds);
  const isRunningRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const startSecondsRef = useRef(initialSeconds);
  const rafRef = useRef<number>(0);

  const tickCallbackRef = useRef<((s: number) => void) | null>(null);
  const finishCallbackRef = useRef<(() => void) | null>(null);
  const lastNotifiedSecondRef = useRef(-1);

  const onTick = useCallback((cb: (s: number) => void) => {
    tickCallbackRef.current = cb;
  }, []);

  const onFinish = useCallback((cb: () => void) => {
    finishCallbackRef.current = cb;
  }, []);

  const tick = useCallback(() => {
    if (!isRunningRef.current) return;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, startSecondsRef.current - elapsed);
    const remainingInt = Math.ceil(remaining);

    if (remainingInt !== lastNotifiedSecondRef.current) {
      lastNotifiedSecondRef.current = remainingInt;
      secondsLeftRef.current = remainingInt;
      setSecondsLeft(remainingInt);

      if (tickCallbackRef.current) {
        tickCallbackRef.current(remainingInt);
      }
    }

    if (remaining <= 0) {
      isRunningRef.current = false;
      setIsRunning(false);
      if (finishCallbackRef.current) {
        finishCallbackRef.current();
      }
      return;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (isRunningRef.current) return;
    if (secondsLeftRef.current <= 0) return;

    isRunningRef.current = true;
    setIsRunning(true);
    startTimeRef.current = performance.now();
    startSecondsRef.current = secondsLeftRef.current;
    lastNotifiedSecondRef.current = secondsLeftRef.current;

    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    isRunningRef.current = false;
    setIsRunning(false);
    cancelAnimationFrame(rafRef.current);
  }, []);

  const reset = useCallback((seconds: number) => {
    isRunningRef.current = false;
    setIsRunning(false);
    cancelAnimationFrame(rafRef.current);
    secondsLeftRef.current = seconds;
    lastNotifiedSecondRef.current = seconds;
    setSecondsLeft(seconds);
  }, []);

  const setSeconds = useCallback((s: number) => {
    secondsLeftRef.current = s;
    lastNotifiedSecondRef.current = s;
    setSecondsLeft(s);
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { secondsLeft, isRunning, start, pause, reset, setSeconds, onTick, onFinish };
}
