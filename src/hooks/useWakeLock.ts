import { useState, useRef, useCallback } from 'react';

interface UseWakeLockReturn {
  isActive: boolean;
  acquire: () => Promise<void>;
  release: () => Promise<void>;
}

export function useWakeLock(): UseWakeLockReturn {
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const release = useCallback(async () => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignore
      }
      wakeLockRef.current = null;
      setIsActive(false);
    }
  }, []);

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
        wakeLockRef.current = null;
      });
    } catch {
      // Browser doesn't support or permission denied — silent fail
    }
  }, []);

  const scheduleAutoRelease = useCallback(
    (delayMs: number) => {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
      releaseTimerRef.current = setTimeout(() => {
        release();
      }, delayMs);
    },
    [release]
  );

  // Expose schedule for external use — attach to the returned object
  return {
    isActive,
    acquire,
    release,
    // @ts-expect-error extra property
    scheduleAutoRelease,
  };
}
