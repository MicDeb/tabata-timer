import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';

// Mock requestAnimationFrame and performance.now
let rafCallbacks: FrameRequestCallback[] = [];
let currentTime = 0;

beforeEach(() => {
  rafCallbacks = [];
  currentTime = 0;

  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    rafCallbacks.push(cb);
    return rafCallbacks.length;
  });

  vi.stubGlobal('cancelAnimationFrame', () => {});

  vi.spyOn(performance, 'now').mockImplementation(() => currentTime);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function flushRaf(advanceMs = 0) {
  currentTime += advanceMs;
  const cbs = [...rafCallbacks];
  rafCallbacks = [];
  cbs.forEach((cb) => cb(currentTime));
}

describe('useTimer', () => {
  it('initializes with correct secondsLeft', () => {
    const { result } = renderHook(() => useTimer(60));
    expect(result.current.secondsLeft).toBe(60);
    expect(result.current.isRunning).toBe(false);
  });

  it('starts running after start()', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('pauses after pause()', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('decrements time as RAF advances', () => {
    const { result } = renderHook(() => useTimer(10));

    act(() => {
      result.current.start();
    });

    act(() => {
      flushRaf(2000); // advance 2 seconds
    });

    expect(result.current.secondsLeft).toBeLessThanOrEqual(8);
  });

  it('resets to given seconds', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.start();
    });

    act(() => {
      flushRaf(5000);
    });

    act(() => {
      result.current.reset(30);
    });

    expect(result.current.secondsLeft).toBe(30);
    expect(result.current.isRunning).toBe(false);
  });

  it('calls onFinish when timer reaches 0', () => {
    const { result } = renderHook(() => useTimer(2));
    const onFinish = vi.fn();

    act(() => {
      result.current.onFinish(onFinish);
      result.current.start();
    });

    act(() => {
      flushRaf(2500); // advance past end
    });

    expect(onFinish).toHaveBeenCalled();
  });

  it('calls onTick callback with seconds remaining', () => {
    const { result } = renderHook(() => useTimer(5));
    const onTick = vi.fn();

    act(() => {
      result.current.onTick(onTick);
      result.current.start();
    });

    act(() => {
      flushRaf(1000);
    });

    expect(onTick).toHaveBeenCalledWith(expect.any(Number));
  });

  it('setSeconds updates the display value', () => {
    const { result } = renderHook(() => useTimer(60));

    act(() => {
      result.current.setSeconds(45);
    });

    expect(result.current.secondsLeft).toBe(45);
  });

  it('does not go below 0', () => {
    const { result } = renderHook(() => useTimer(1));

    act(() => {
      result.current.start();
    });

    act(() => {
      flushRaf(5000);
    });

    expect(result.current.secondsLeft).toBeGreaterThanOrEqual(0);
  });
});
